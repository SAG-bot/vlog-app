import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ session }) {
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState({});

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*, comments(*), likes(*)")
      .order("created_at", { ascending: false });

    if (!error) {
      setVideos(data);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", videoId)
      .eq("user_id", session.user.id);

    if (!error) fetchVideos();
  };

  const handleLike = async (videoId) => {
    await supabase.from("likes").insert([
      { video_id: videoId, user_id: session.user.id }
    ]);
    fetchVideos();
  };

  const handleComment = async (videoId, text) => {
    if (!text.trim()) return;
    await supabase.from("comments").insert([
      { video_id: videoId, user_id: session.user.id, text }
    ]);
    setComments({ ...comments, [videoId]: "" });
    fetchVideos();
  };

  const handleDeleteComment = async (commentId, userId) => {
    if (userId !== session.user.id) return;
    await supabase.from("comments").delete().eq("id", commentId);
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
          <div>
            <button onClick={() => handleLike(video.id)}>❤️ Like ({video.likes?.length || 0})</button>
            {video.user_id === session.user.id && (
              <button
                className="delete-btn"
                onClick={() => handleDeleteVideo(video.id)}
              >
                Delete
              </button>
            )}
          </div>

          <div className="comments">
            {video.comments?.map((c) => (
              <div key={c.id} className="comment">
                <span>{c.text}</span>
                {c.user_id === session.user.id && (
                  <button
                    onClick={() => handleDeleteComment(c.id, c.user_id)}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleComment(video.id, comments[video.id] || "");
              }}
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={comments[video.id] || ""}
                onChange={(e) =>
                  setComments({ ...comments, [video.id]: e.target.value })
                }
              />
              <button type="submit">💬</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
