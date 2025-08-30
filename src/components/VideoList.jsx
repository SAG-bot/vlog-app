import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import VideoCard from "./VideoCard";

export default function VideoList({ user }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, video_url, user_id, created_at");

    if (!error) setVideos(data);
  };

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} user={user} />
      ))}
    </div>
  );
}
