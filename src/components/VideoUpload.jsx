import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoUpload({ session, onUpload }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const userId = session.user.id;
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    // 1. Create a signed URL
    const { data: signedUrl, error: signError } = await supabase.storage
      .from("videos")
      .createSignedUploadUrl(filePath);

    if (signError) {
      console.error("Signed URL error:", signError.message);
      setUploading(false);
      return;
    }

    // 2. Upload file in chunks
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .uploadToSignedUrl(signedUrl.path, signedUrl.token, file);

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      setUploading(false);
      return;
    }

    // 3. Save metadata in DB
    const { error: dbError } = await supabase.from("videos").insert([
      {
        title,
        video_url: filePath,
        user_id: userId,
      },
    ]);

    if (dbError) {
      console.error("DB error:", dbError.message);
    } else {
      setTitle("");
      setFile(null);
      if (onUpload) onUpload();
    }

    setUploading(false);
  };

  return (
    <form className="upload-form" onSubmit={handleUpload}>
      <input
        type="text"
        placeholder="Video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
