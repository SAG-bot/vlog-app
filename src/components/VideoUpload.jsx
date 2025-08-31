// src/components/VideoUpload.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ user, onUploadComplete }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    setUploading(true);

    try {
      const filePath = `public/${user.id}-${Date.now()}-${file.name}`;

      // Upload to storage bucket 'videos'
      const { error: uploadError } = await supabase.storage.from("videos").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      // (Optional) get public url (we will store file_path and compute public url in front-end)
      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl ?? null;

      // Insert record: store file_path (and public_url for quick reference)
      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          file_path: filePath,
          public_url: publicUrl,
          user_id: user.id,
        },
      ]);

      if (dbError) throw dbError;

      setTitle("");
      setFile(null);

      // refresh list
      if (onUploadComplete) await onUploadComplete();
      alert("Upload complete");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleUpload}>
      <h3>Upload a Video</h3>
      <input
        type="text"
        placeholder="Enter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} required />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
