import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const VideoList = ({ user }) => {
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*, likes(user_id)")
      .order("created_at", { ascending: false });
    if (!error) setVideos(data);
  };

  const handleDelete = async (videoId) => {
    await supabase.from("videos").delete().eq("id", videoId);
    fetchVideos();
  };

  const handleLike = async (videoId) => {
    await supabase.from("likes").insert([{ video_id: videoId, user_id: user.id }]);
    fetchVideos();
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="video-list">
      <h2>🎥 Uploaded Videos</h2>
      <div className="video-grid">
        {videos.map((video) => (
          <div key={video.id} className="video-tile">
            <h3>{video.title}</h3>
            <video
              src={video.video_url}
              controls
              className="video-player"
            />
            <div className="video-actions">
              <button onClick={() => handleLike(video.id)} className="like-btn">
                ❤️ {video.likes?.length || 0}
              </button>
              {video.user_id === user.id && (
                <button
                  onClick={() => handleDelete(video.id)}
                  className="delete-btn"
                >
                  🗑 Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
