import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ session, onUploadComplete }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const userId = session?.user?.id;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      alert("Please provide a title and select a video.");
      return;
    }

    setUploading(true);

    // Generate unique file name
    const fileName = `${userId}-${Date.now()}-${file.name}`;

    // 1. Upload to Storj via backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    const res = await fetch("/api/upload-to-storj", {
      method: "POST",
      body: formData,
    });

    const { success, url, error } = await res.json();

    if (!success) {
      console.error("Storj upload failed:", error);
      alert("Upload failed: " + error);
      setUploading(false);
      return;
    }

    // 2. Insert metadata into Supabase
    const { error: dbError } = await supabase.from("videos").insert([
      {
        title,
        video_url: url, // full Storj URL
        user_id: userId,
      },
    ]);

    if (dbError) {
      console.error("Error inserting into videos table:", dbError.message);
      alert("Database insert failed: " + dbError.message);
      setUploading(false);
      return;
    }

    setTitle("");
    setFile(null);
    setUploading(false);
    alert("✅ Video uploaded successfully!");

    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <form className="upload-form" onSubmit={handleUpload}>
      <h3>Upload a Video</h3>
      <input
        type="text"
        placeholder="Enter a title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
