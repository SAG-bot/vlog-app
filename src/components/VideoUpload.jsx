import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ session, onUpload }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      alert("Please add a title and select a video file");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          video_url: publicUrl,
          user_id: session.user.id,
        },
      ]);

      if (dbError) throw dbError;

      setTitle("");
      setFile(null);
      if (onUpload) onUpload();

    } catch (error) {
      console.error("Upload failed:", error.message);
      alert("Error uploading video: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={handleUpload}>
      <input
        type="text"
        placeholder="Video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
    </form>
  );
}
