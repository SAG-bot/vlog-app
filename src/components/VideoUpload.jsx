import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ session, onUpload }) {
  const [title, setTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("videos").insert([
      {
        title,
        video_link: videoLink,
        user_id: session.user.id,
      },
    ]);

    if (error) {
      console.error("Error uploading video link:", error);
      alert("Error saving video link");
    } else {
      alert("Video link added!");
      setTitle("");
      setVideoLink("");
      if (onUpload) onUpload();
    }
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Video Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="url"
        placeholder="YouTube or Vimeo Link"
        value={videoLink}
        onChange={(e) => setVideoLink(e.target.value)}
        required
      />
      <button type="submit">Add Video</button>
    </form>
  );
}
