import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ user }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file.");
      return;
    }

    // 1. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("videos")
      .upload(`${user.id}/${Date.now()}-${file.name}`, file);

    if (error) {
      console.error("Storage error:", error.message);
      alert("Upload failed 😢");
      return;
    }

    // 2. Get public video URL
    const videoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/videos/${data.path}`;

    // 3. Insert metadata into Supabase DB
    const { error: dbError } = await supabase.from("videos").insert([
      {
        title,
        video_url: videoUrl,
        user_id: user.id,
      },
    ]);

    if (dbError) {
      console.error("DB error:", dbError.message);
      alert("Database insert failed 😢");
    } else {
      alert("Video uploaded successfully 🎉");
      setFile(null);
      setTitle("");
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload a Video</h2>
      <form onSubmit={handleUpload}>
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
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}
