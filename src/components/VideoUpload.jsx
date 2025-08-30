import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const VideoUpload = ({ user, onUpload }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setLoading(true);

    const fileName = `${user.id}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      setLoading(false);
      return alert("Upload failed: " + uploadError.message);
    }

    const { data: urlData } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase.from("videos").insert([
      {
        title,
        video_url: urlData.publicUrl,
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (dbError) {
      alert("Database insert failed: " + dbError.message);
    } else {
      setTitle("");
      setFile(null);
      onUpload();
    }
  };

  return (
    <form onSubmit={handleUpload} className="upload-form">
      <input
        type="text"
        placeholder="Video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input type="file" accept="video/mp4" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
};

export default VideoUpload;
