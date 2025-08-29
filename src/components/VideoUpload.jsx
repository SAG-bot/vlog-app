import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ user }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 const handleUpload = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  console.log("Upload started...");

  if (!file) {
    setError("Please select a file");
    return;
  }

  if (!user) {
    setError("No user logged in");
    return;
  }

  console.log("User ID:", user.id);

  const filePath = `${user.id}/${Date.now()}-${file.name}`;
  console.log("Uploading file to:", filePath);

  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Storage upload error:", uploadError.message);
    setError(uploadError.message);
    return;
  }

  const { data } = supabase.storage.from("videos").getPublicUrl(filePath);
  const videoUrl = data.publicUrl;

  const { error: dbError } = await supabase.from("videos").insert([
    {
      title,
      video_url: videoUrl,
      user_id: user.id,
    },
  ]);

  if (dbError) {
    console.error("DB insert error:", dbError.message);
    setError(dbError.message);
  } else {
    console.log("Upload successful!");
    setSuccess("Video uploaded successfully!");
    setTitle("");
    setFile(null);
  }
};

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
