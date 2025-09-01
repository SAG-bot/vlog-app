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
    const filePath = `uploads/${fileName}`;

    // 1. Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError.message);
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // 2. Insert into "videos" table
    const { error: dbError } = await supabase.from("videos").insert([
      {
        title,
        video_url: filePath, // store relative path
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

    // 3. Refresh VideoList
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
