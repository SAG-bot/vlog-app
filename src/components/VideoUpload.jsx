import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const VideoUpload = ({ user, onUploadComplete }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    // Upload to Supabase storage bucket "videos"
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      alert("Upload failed!");
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // Insert into DB
    const { error: dbError } = await supabase.from("videos").insert([
      {
        title,
        video_url: publicUrl,
        user_id: user.id,
      },
    ]);

    if (dbError) {
      console.error(dbError);
      alert("Database insert failed!");
      setUploading(false);
      return;
    }

    setTitle("");
    setFile(null);
    setUploading(false);

    // Refresh video list in UploadList.jsx
    if (onUploadComplete) onUploadComplete();
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
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
};

export default VideoUpload;
