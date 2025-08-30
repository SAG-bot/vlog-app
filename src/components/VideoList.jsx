import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ user }) {
  const [videos, setVideos] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

  // Load videos
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, video_url, created_at, user_id");

    if (error) {
      console.error("Error fetching videos:", error.message);
    } else {
      setVideos(data);

      // Load likes + comments per video
      data.forEach((v) => {
        fetchLikes(v.id);
        fetchComments(v.id);
      });
    }
  };

  const fetchLikes = async (videoId) => {
    const { count, error } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("video_id", videoId);

    if (!error) {
      setLikes((prev) => ({ ...prev, [videoId]: count }));
    }
  };

  const fetchComments = async (videoId) => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, user_id, created_at")
      .eq("video_id", videoId)
      .order("created_at", { ascending: true });

    if (!error) {
      setComments((prev) => ({ ...prev, [videoId]: data }));
    }
  };

  const handleLike = async (videoId) => {
    const { error } = await supabase.from("likes").insert([
      {
        video_id: videoId,
        user_id: user.id,
      },
    ]);

    if (!error) {
      fetchLikes(videoId);
    }
  };

  const handleComment = async (e, videoId) => {
    e.preventDefault();

    if (!newComment[videoId]) return;

    const { error } = await supabase.from("comments").insert([
      {
        video_id: videoId,
        user_id: user.id,
        content: newComment[videoId],
      },
    ]);

    if (!error) {
      setNewComment((prev) => ({ ...prev, [videoId]: "" }));
      fetchComments(videoId);
    }
  };

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-card">
          <video
            controls
            src={video.video_url}
            className="video-player"
          ></video>
          <h3>{video.title}</h3>
          <p className="date">
            {new Date(video.created_at).toLocaleDateString()}
          </p>

          {/* Likes */}
          <button onClick={() => handleLike(video.id)}>
            ❤️ {likes[video.id] || 0}
          </button>

          {/* Comments */}
          <div className="comments">
            <h4>Comments</h4>
            <ul>
              {(comments[video.id] || []).map((c) => (
                <li key={c.id}>
                  <span>{c.content}</span>
                </li>
              ))}
            </ul>

            <form onSubmit={(e) => handleComment(e, video.id)}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment[video.id] || ""}
                onChange={(e) =>
                  setNewComment((prev) => ({
                    ...prev,
                    [video.id]: e.target.value,
                  }))
                }
              />
              <button type="submit">Post</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
