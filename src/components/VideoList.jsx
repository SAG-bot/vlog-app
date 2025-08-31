import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ session, refresh }) {
  const [videos, setVideos] = useState([]);
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    fetchVideos();
  }, [session, refresh]); // 👈 Respond to external refresh

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, video_url, user_id, comments(id, content, user_id), likes(id, user_id)")
      .order("id", { ascending: false });

    if (error) console.error(error);
    else setVideos(data);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchVideos(); // 👈 Trigger local refresh
  };

  const handleLike = async (videoId) => {
    const { error } = await supabase.from("likes").insert([
      { video_id: videoId, user_id: session.user.id },
    ]);
    if (error) console.error(error);
    else fetchVideos(); // 👈 Trigger local refresh
  };

  const handleComment = async (videoId) => {
    if (!newComment[videoId]) return;
    const { error } = await supabase.from("comments").insert([
      { video_id: videoId, user_id: session.user.id, content: newComment[videoId] },
    ]);
    if (error) console.error(error);
    else {
      setNewComment({ ...newComment, [videoId]: "" });
      fetchVideos(); // 👈 Trigger local refresh
    }
  };

  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) console.error(error);
    else fetchVideos(); // 👈 Trigger local refresh
  };

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div className="video-tile" key={video.id}>
          <h3>{video.title}</h3>
          <video controls src={video.video_url}></video>

          <button className="like-btn" onClick={() => handleLike(video.id)}>
            ❤️ Like ({video.likes?.length || 0})
          </button>

          {video.user_id === session.user.id && (
            <button className="delete-btn" onClick={() => handleDelete(video.id)}>
              🗑 Delete
            </button>
          )}

          <div className="comments">
            <h4>Comments</h4>
            {video.comments?.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{c.content}</span>
                {c.user_id === session.user.id && (
                  <button onClick={() => handleDeleteComment(c.id)}>❌</button>
                )}
              </div>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleComment(video.id);
              }}
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment[video.id] || ""}
                onChange={(e) =>
                  setNewComment({ ...newComment, [video.id]: e.target.value })
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
