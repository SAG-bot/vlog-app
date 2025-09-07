import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({ log: true });

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [compressed, setCompressed] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
    setCompressed(null);
    setProgress(0);
    setStatusMessage("");
    setUploadedUrl(null);
  };

  const compressVideo = async () => {
    if (!video) return;

    setStatusMessage("Loading FFmpeg...");
    setUploading(true);

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    ffmpeg.setProgress(({ ratio }) => {
      setProgress(Math.round(ratio * 50)); // compression progress 0-50%
    });

    ffmpeg.FS("writeFile", video.name, await fetchFile(video));

    setStatusMessage("Compressing video...");
    await ffmpeg.run(
      "-i",
      video.name,
      "-vf",
      "scale=640:-1",
      "-b:v",
      "500k",
      "-preset",
      "veryfast",
      "output.mp4"
    );

    const data = ffmpeg.FS("readFile", "output.mp4");
    const compressedFile = new File([data.buffer], "compressed.mp4", {
      type: "video/mp4",
    });

    setCompressed(compressedFile);
    setProgress(50); // compression done
    setStatusMessage("Compression complete. Preparing to upload...");
  };

  const uploadToSupabase = async () => {
    if (!compressed) return;

    setStatusMessage("Uploading...");
    const filePath = `user-videos/${Date.now()}-${compressed.name}`;

    // Monitor upload progress
    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filePath, compressed, {
        onUploadProgress: (event) => {
          const percent = 50 + Math.round((event.loaded / event.total) * 50); // 50-100%
          setProgress(percent);
        },
      });

    if (error) {
      console.error(error);
      setStatusMessage("Upload failed.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    setUploadedUrl(publicUrlData.publicUrl);
    setStatusMessage("Upload successful!");
    setUploading(false);
    setProgress(100);
  };

  const handleCompressAndUpload = async () => {
    await compressVideo();
    await uploadToSupabase();
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-xl mb-2">Upload a Video</h2>

      <input type="file" accept="video/*" onChange={handleFileChange} />

      <button
        onClick={handleCompressAndUpload}
        disabled={!video || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded mt-3 disabled:opacity-50"
      >
        {uploading ? "Processing..." : "Upload Video"}
      </button>

      {statusMessage && <p className="mt-2 text-gray-700">{statusMessage}</p>}

      {video && !compressed && (
        <p className="text-sm mt-1">Original size: {(video.size / 1024 / 1024).toFixed(2)} MB</p>
      )}

      {compressed && (
        <p className="text-sm mt-1">
          Compressed size: {(compressed.size / 1024 / 1024).toFixed(2)} MB
        </p>
      )}

      {uploading && (
        <div className="w-full bg-gray-300 rounded h-4 mt-2">
          <div
            className="bg-blue-500 h-4 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {uploadedUrl && (
        <div className="mt-4">
          <h3 className="font-semibold">Uploaded Video:</h3>
          <video controls src={uploadedUrl} className="w-full max-w-md" />
          <p className="text-sm break-words">{uploadedUrl}</p>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
