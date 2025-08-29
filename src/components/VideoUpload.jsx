import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ user }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    // Upload video to Supabase Storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("videos") // make sure you created a bucket called 'videos'
      .upload(filePath, file);

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    // Get public URL
    const { data } = supabase.storage.from("videos").getPublicUrl(filePath);
    const videoUrl = data.publicUrl;

    // Insert record into videos table
    const { error: dbError } = await supabase.from("videos").insert([
      {
        title,
        video_url: videoUrl,
        user_id: user.id,
      },
    ]);

    if (dbError) {
      setError(dbError.message);
    } else {
      setSuccess("Video uploaded successfully!");
      setTitle("");
      setFile(null);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload a Video</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}
