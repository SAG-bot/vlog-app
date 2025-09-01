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

    const fileName = `${userId}-${Date.now()}-${file.name}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    try {
      // Upload to Storj via Netlify Function
      const res = await fetch("/.netlify/functions/upload-to-storj", {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        throw new Error(`Unexpected response: ${text.slice(0, 100)}`);
      }

      const { success, url, error } = data;

      if (!success) {
        throw new Error(error || "Unknown upload error");
      }

      // Insert metadata into Supabase
      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          video_url: url,
          user_id: userId,
        },
      ]);

      if (dbError) {
        throw new Error(dbError.message);
      }

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
