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
      .select("*, likes(user_id), comments(id, content, user_id)")
      .order("id", { ascending: false });

    if (!error) setVideos(data);
  };

  const handleLike = async (videoId) => {
    await supabase.from("likes").insert({
      video_id: videoId,
      user_id: user.id,
    });
    fetchVideos();
  };

  const handleComment = async (videoId, content) => {
    if (!content.trim()) return;
    await supabase.from("comments").insert({
      video_id: videoId,
      user_id: user.id,
      content,
    });
    fetchVideos();
  };

  return (
    <div className="videos-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-card">
          <h3>{video.title}</h3>
          <video controls width="400">
            <source src={video.video_url} type="video/mp4" />
          </video>
          <div>
            <button onClick={() => handleLike(video.id)}>
              ❤️ {video.likes ? video.likes.length : 0}
            </button>
          </div>
          <div className="comments">
            <h4>Comments</h4>
            {video.comments?.map((c) => (
              <p key={c.id}>{c.content}</p>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleComment(video.id, e.target.comment.value);
                e.target.reset();
              }}
            >
              <input name="comment" placeholder="Add a comment..." />
              <button type="submit">Post</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
