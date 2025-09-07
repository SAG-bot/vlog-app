import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({ log: false });

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [compressed, setCompressed] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const compressAndUpload = async () => {
    if (!video) return;

    setUploading(true);
    setProgress("Loading encoder...");

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    setProgress("Compressing... this may take a minute");

    // Write original file to ffmpeg memory
    ffmpeg.FS("writeFile", video.name, await fetchFile(video));

    // Run ffmpeg: resize width to 640px, lower bitrate to ~500kbps
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

    // Upload to Supabase Storage
    const filePath = `user-videos/${Date.now()}-${compressedFile.name}`;
    const { data: uploadData, error } = await supabase.storage
      .from("videos") // 🔑 your bucket name
      .upload(filePath, compressedFile);

    if (error) {
      console.error(error);
      setProgress("Upload failed");
    } else {
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);
      setUploadedUrl(publicUrl.publicUrl);
      setProgress("Upload successful!");
    }

    setUploading(false);
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-xl mb-2">Upload a Video</h2>

      <input type="file" accept="video/*" onChange={handleFileChange} />

      <button
        onClick={compressAndUpload}
        disabled={!video || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded mt-3 disabled:opacity-50"
      >
        {uploading ? "Processing..." : "Upload Video"}
      </button>

      {progress && <p className="mt-2 text-gray-700">{progress}</p>}

      {compressed && (
        <p className="mt-2 text-sm">
          Compressed size: {(compressed.size / 1024 / 1024).toFixed(2)} MB
        </p>
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
