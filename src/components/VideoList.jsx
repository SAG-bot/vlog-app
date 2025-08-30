import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ user }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error.message);
    } else {
      setVideos(data);
    }
  };

  const handleDelete = async (videoId, videoUrl) => {
    try {
      // Remove from DB
      const { error: dbError } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId)
        .eq("user_id", user.id);

      if (dbError) throw dbError;

      // Remove from Storage
      const path = videoUrl.split("/videos/")[1];
      const { error: storageError } = await supabase.storage
        .from("videos")
        .remove([path]);

      if (storageError) throw storageError;

      // Update UI
      setVideos(videos.filter((v) => v.id !== videoId));
      alert("✅ Video deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err.message);
      alert("❌ Could not delete video: " + err.message);
    }
  };

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-card">
          <h3>{video.title}</h3>
          <video src={video.video_url} controls />
          {user.id === video.user_id && (
            <button
              className="delete-btn"
              onClick={() => handleDelete(video.id, video.video_url)}
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
