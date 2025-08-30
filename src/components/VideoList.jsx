import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ user }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error);
    } else {
      // Convert storage paths to public URLs
      const withUrls = data.map((v) => {
        const { data: urlData } = supabase.storage
          .from("videos")
          .getPublicUrl(v.video_url); // 👈 make URL
        return { ...v, public_url: urlData.publicUrl };
      });
      setVideos(withUrls);
    }
    setLoading(false);
  };

  const handleDelete = async (id, path) => {
    // Only owner can delete
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (!error) {
      await supabase.storage.from("videos").remove([path]);
      setVideos((vids) => vids.filter((v) => v.id !== id));
    }
  };

  if (loading) return <p>Loading videos...</p>;

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div className="tile" key={video.id}>
          <h3>{video.title}</h3>
          <video width="100%" controls>
            <source src={video.public_url} type="video/mp4" />
            Your browser does not support video.
          </video>
          {/* Delete button for owner */}
          {video.user_id === user.id && (
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
