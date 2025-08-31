import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ session, onUpload }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      alert("Please enter a title and select a video");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${session.user.id}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL for playback
      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      // Save video record in DB
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
      alert("Video uploaded successfully 🎉");
      if (onUpload) onUpload();
    } catch (error) {
      console.error("Error uploading video:", error.message);
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
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
    </form>
  );
}
