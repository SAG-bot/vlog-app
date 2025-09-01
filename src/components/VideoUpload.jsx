import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ session, onUploadComplete }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const userId = session?.user?.id || "anonymous";

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
      // Call Netlify Function
      const res = await fetch("/.netlify/functions/upload-to-gdrive", {
        method: "POST",
        body: formData
      });

      // Read body once and parse
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Unexpected response: ${raw.slice(0, 120)}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Unknown upload error");
      }

      // Save metadata to Supabase
      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          video_url: data.url,
          user_id: userId
        }
      ]);

      if (dbError) {
        throw new Error(dbError.message);
      }

      setTitle("");
      setFile(null);
      alert("✅ Video uploaded successfully!");

      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleUpload} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
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
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
