import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const VideoUpload = ({ user, onUpload }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    try {
      setUploading(true);

      // upload to storage
      const filePath = `public/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("videos")
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      // insert into DB
      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          video_url: urlData.publicUrl,
          user_id: user.id,
        },
      ]);

      if (dbError) throw dbError;

      setTitle("");
      setFile(null);
      if (onUpload) onUpload();
    } catch (err) {
      console.error(err.message);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="upload-form">
      <input
        type="text"
        placeholder="Video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" disabled={uploading}>
        {uploading ? "⏳ Uploading..." : "⬆ Upload Video"}
      </button>
    </form>
  );
};

export default VideoUpload;
