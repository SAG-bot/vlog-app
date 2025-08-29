import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("videos").select("*").order("id", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setVideos(data);
    }
    setLoading(false);
  };

  return (
    <div className="videos-container">
      <h2>My Videos</h2>
      {loading ? (
        <p>Loading...</p>
      ) : videos.length === 0 ? (
        <p>No videos yet. Upload one!</p>
      ) : (
        videos.map((video) => (
          <div key={video.id} className="video-card">
            <h3>{video.title}</h3>
            <video controls width="500">
              <source src={video.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-actions">
              <a href={video.video_url} download>
                <button>Download</button>
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
