import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ onUpload }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a video file to upload");

    setUploading(true);

    try {
      // 1. Get current logged in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to upload a video.");
      }

      // 2. Upload video file to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Insert metadata into videos table
      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          video_url: filePath, // path inside bucket
          user_id: user.id,    // ✅ IMPORTANT for RLS
        },
      ]);

      if (dbError) throw dbError;

      // 4. Reset form
      setTitle("");
      setFile(null);

      if (onUpload) onUpload(); // refresh video list
      alert("Video uploaded successfully ✅");
    } catch (err) {
      console.error("Upload failed:", err.message);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleUpload}>
      <input
        type="text"
        placeholder="Enter video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
    </form>
  );
}
