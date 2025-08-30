import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false); // 👈 this was missing

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      setUploading(true);

      const { data, error } = await supabase.storage
        .from("videos")
        .upload(`public/${Date.now()}-${file.name}`, file);

      if (error) throw error;

      const url = supabase.storage
        .from("videos")
        .getPublicUrl(data.path).data.publicUrl;

      const { error: dbError } = await supabase.from("videos").insert([
        {
          title,
          video_url: url,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (dbError) throw dbError;

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
    <form onSubmit={handleUpload} className="upload-form">
      <input
        type="text"
        placeholder="Enter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
    </form>
  );
}
