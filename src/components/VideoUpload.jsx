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

    // Prepare form data for Netlify function
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    try {
      // 1. Upload to Storj via Netlify Function
      const res = await fetch("/.netlify/functions/upload-to-storj", {
        method: "POST",
        body: formData,
      });

      const { success, url, error } = await res.json();

      if (!success) {
        throw new Error(error || "Unknown upload error");
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
        throw new Error(dbError.message);
      }

      // 3. Reset form and notify
      setTitle("");
      setFile(null);
      alert("✅ Video uploaded successfully!");

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      console.error("Upload error:", err.message);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
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
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
