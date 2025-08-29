import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a video");

    try {
      setUploading(true);

      // 1. Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("videos") // your Supabase storage bucket name
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get a public URL for the video
      const { data } = supabase.storage.from("videos").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // 3. Save metadata into videos table
      const { error: insertError } = await supabase.from("videos").insert([
        {
          title,
          video_url: publicUrl,
        },
      ]);

      if (insertError) throw insertError;

      alert("Video uploaded successfully!");
      setFile(null);
      setTitle("");
    } catch (error) {
      console.error(error);
      alert("Error uploading video");
    } finally {
      setUploading(false);
    }
  };

  const { error: dbError } = await supabase.from("videos").insert([
  {
    title,
    video_url: videoUrl,
    user_id: user.id, // important
  },
]);

if (dbError) {
  console.error("DB insert error details:", dbError);
  setError(dbError.message);
} else {
  console.log("DB insert success!");
  setSuccess("Video uploaded successfully!");
}


  return (
    <div className="upload-container">
      <h2>Upload a Video</h2>
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
          required
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
