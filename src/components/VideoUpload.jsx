import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

let createFFmpeg;
let fetchFile;
let ffmpegInstance;

const MAX_SIZE_MB = 50;

const VideoUpload = () => {
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [video, setVideo] = useState(null);
  const [compressed, setCompressed] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Load FFmpeg dynamically in the browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@ffmpeg/ffmpeg").then((module) => {
        createFFmpeg = module.createFFmpeg;
        fetchFile = module.fetchFile;
        ffmpegInstance = createFFmpeg({ log: true });
        setFfmpegLoaded(true);
      });
    }
  }, []);

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
    setCompressed(null);
    setProgress(0);
    setStatusMessage("");
  };

  const compressVideo = async () => {
    if (!video || !ffmpegLoaded) return;

    setUploading(true);
    setStatusMessage("Loading FFmpeg...");
    await ffmpegInstance.load();

    ffmpegInstance.setProgress(({ ratio }) => setProgress(Math.round(ratio * 50)));

    ffmpegInstance.FS("writeFile", video.name, await fetchFile(video));

    setStatusMessage("Compressing video...");
    let bitrate = 500;
    let compressedFile;

    while (true) {
      await ffmpegInstance.run(
        "-i",
        video.name,
        "-vf",
        "scale=640:-1",
        "-b:v",
        `${bitrate}k`,
        "-preset",
        "veryfast",
        "output.mp4"
      );

      const data = ffmpegInstance.FS("readFile", "output.mp4");
      compressedFile = new File([data.buffer], "compressed.mp4", { type: "video/mp4" });

      if (compressedFile.size / 1024 / 1024 <= MAX_SIZE_MB || bitrate <= 100) break;

      bitrate = Math.floor(bitrate * 0.8);
      setStatusMessage(`Compressing... adjusting bitrate to ${bitrate} kbps`);
    }

    setCompressed(compressedFile);
    setProgress(50);
    setStatusMessage("Compression complete. Ready to upload...");
  };

  const uploadToSupabase = async () => {
    if (!compressed) return;

    const filePath = `user-videos/${Date.now()}-${compressed.name}`;
    const { error } = await supabase.storage.from("videos").upload(filePath, compressed, {
      onUploadProgress: (event) => {
        setProgress(50 + Math.round((event.loaded / event.total) * 50));
      },
    });

    if (error) {
      console.error(error);
      setStatusMessage("Upload failed");
    } else {
      setStatusMessage("Upload successful!");
      setProgress(100);
      setVideo(null);
      setCompressed(null);
    }

    setUploading(false);
  };

  const handleCompressAndUpload = async () => {
    await compressVideo();
    await uploadToSupabase();
  };

  return (
    <div className="video-upload">
      {!ffmpegLoaded && <p>Loading video engine...</p>}

      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button
        className="upload-btn"
        onClick={handleCompressAndUpload}
        disabled={!video || uploading || !ffmpegLoaded}
      >
        {uploading ? "Processing..." : "Upload Video"}
      </button>

      {statusMessage && <p>{statusMessage}</p>}

      {uploading && (
        <div className="w-full bg-gray-300 rounded h-4 mt-2">
          <div
            className="bg-blue-500 h-4 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
