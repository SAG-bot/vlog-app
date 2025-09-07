import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const VideoList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const loadVideos = async () => {
      const { data, error } = await supabase.storage.from("videos").list("user-videos", {
        limit: 20,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (error) console.error(error);
      else {
        const urls = data.map((file) =>
          supabase.storage.from("videos").getPublicUrl(`user-videos/${file.name}`).data.publicUrl
        );
        setVideos(urls);
      }
    };

    loadVideos();
  }, []);

  return (
    <div>
      <h2 className="font-bold text-xl mb-3">Uploaded Videos</h2>
      {videos.map((url, idx) => (
        <video key={idx} controls src={url} className="w-full max-w-md mb-4" />
      ))}
    </div>
  );
};

export default VideoList;
