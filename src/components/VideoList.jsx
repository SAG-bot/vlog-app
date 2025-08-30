import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Comments from "./Comments";
import Likes from "./Likes";

const VideoList = ({ user }) => {
  const [videos, setVideos] = useState([]);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setVideos(data);
  };

  const handleDelete = async (videoId) => {
    await supabase.from("videos").delete().eq("id", videoId);
    fetchVideos();
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-tile">
          <h3>{video.title}</h3>
          <video controls>
            <source src={video.video_url} type="video/mp4" />
          </video>

          <Likes videoId={video.id} user={user} />
          <Comments videoId={video.id} user={user} />

          {video.user_id === user.id && (
            <button className="delete-btn" onClick={() => handleDelete(video.id)}>
              🗑 Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default VideoList;
