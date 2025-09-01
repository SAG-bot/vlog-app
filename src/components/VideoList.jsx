import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ session }) {
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
      console.error("Error fetching videos:", error);
    } else {
      setVideos(data);
    }
  };

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-tile">
          <h3>{video.title}</h3>
          <div className="video-wrapper">
            <iframe
              width="100%"
              height="200"
              src={video.video_link.replace("watch?v=", "embed/")}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ))}
    </div>
  );
}
