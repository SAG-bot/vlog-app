import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ user }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a video to upload");
      return;
    }

    setUploading(true);

    try {
      // ✅ Upload into public/ folder
      const filePath = `public/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("videos") // bucket name = videos
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // ✅ Get public URL
      const { data: publicData } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      // ✅ Save to DB
      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          video_url: publicUrl,
          user_id: user.id,
        },
      ]);

      if (dbError) {
        throw dbError;
      }

      alert("Video uploaded successfully!");
      setTitle("");
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err.message);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tile">
      <h2>Upload a New Video</h2>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="input-field"
        />
        <button type="submit" className="btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
