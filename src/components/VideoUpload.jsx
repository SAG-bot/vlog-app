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
      // 1️⃣ Upload to Google Drive via Netlify Function
      const res = await fetch("/.netlify/functions/upload-to-gdrive", {
        method: "POST",
        body: formData,
      });

      // 2️⃣ Read the body ONCE as text
      const raw = await res.text();

      // 3️⃣ Try to parse JSON
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`Unexpected response: ${raw.slice(0, 100)}`);
      }

      // 4️⃣ Check for backend error
      if (!data.success) {
        throw new Error(data.error || "Unknown upload error");
      }

      // 5️⃣ Insert metadata into Supabase
      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          video_url: data.url, // Direct download link from Google Drive
          user_id: userId,
        },
      ]);

      if (dbError) {
        throw new Error(dbError.message);
      }

      // 6️⃣ Reset form and notify
      setTitle("");
      setFile(null);
      alert("✅ Video uploaded successfully!");

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      console.error("Upload error:", err);
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
