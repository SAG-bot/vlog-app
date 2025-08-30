import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const VideoUpload = ({ user }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setMessage("Please provide a title and file.");
      return;
    }

    try {
      // 1️⃣ Upload file to Supabase storage
      const filePath = `public/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, file);

      if (uploadError) {
        setMessage("Upload failed.");
        return;
      }

      // 2️⃣ Get public URL for playback
      const { data: publicUrlData } = supabase
        .storage
        .from("videos")
        .getPublicUrl(filePath);

      const videoUrl = publicUrlData.publicUrl;

      // 3️⃣ Insert video record into database
      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          video_url: videoUrl,
          user_id: user.id,
        },
      ]);

      if (dbError) {
        setMessage("Database insert failed.");
        return;
      }

      setMessage("Upload successful!");
      setTitle("");
      setFile(null);
    } catch (err) {
      setMessage("Unexpected error.");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleUpload} className="video-upload">
      <h2>Upload Video</h2>
      <input
        type="text"
        placeholder="Video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit">Upload</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default VideoUpload;
