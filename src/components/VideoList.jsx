import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function VideoList({ session }) {
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState({});
  const user = session?.user;

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setVideos(data || []);

    // Fetch comments for all videos
    const { data: commentData } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });

    if (commentData) {
      const grouped = {};
      commentData.forEach((c) => {
        grouped[c.video_id] = grouped[c.video_id] || [];
        grouped[c.video_id].push(c);
      });
      setComments(grouped);
    }
  }

  async function handleLikeVideo(videoId, currentLikes = 0) {
    await supabase.from("videos").update({ likes: currentLikes + 1 }).eq("id", videoId);
    fetchVideos();
  }

  async function handleComment(videoId, text) {
    await supabase.from("comments").insert([
      { video_id: videoId, user_id: user.id, text }
    ]);
    fetchVideos();
  }

  async function handleDeleteComment(commentId) {
    await supabase.from("comments").delete().eq("id", commentId);
    fetchVideos();
  }

  async function handleLikeComment(commentId, currentLikes = 0) {
    await supabase.from("comments").update({ likes: currentLikes + 1 }).eq("id", commentId);
    fetchVideos();
  }

  async function handleDeleteVideo(videoId, videoUrl) {
    if (!window.confirm("Delete this video?")) return;
    const path = videoUrl.split("/").pop();
    await supabase.storage.from("videos").remove([path]);
    await supabase.from("videos").delete().eq("id", videoId);
    fetchVideos();
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-tile">
          <h3>{video.title}</h3>
          <video src={video.video_url} controls playsInline />

          {/* Video likes */}
          <button onClick={() => handleLikeVideo(video.id, video.likes || 0)}>
            ❤️ {video.likes || 0}
          </button>

          {/* Delete video only for owner */}
          {video.user_id === user.id && (
            <button onClick={() => handleDeleteVideo(video.id, video.video_url)}>
              🗑️ Delete Video
            </button>
          )}

          {/* Comments section */}
          <div className="comments">
            <h4>Comments</h4>
            {(comments[video.id] || []).map((c) => (
              <p key={c.id}>
                <strong>{c.user_id === user.id ? "You" : c.user_id}:</strong> {c.text}
                <button onClick={() => handleLikeComment(c.id, c.likes || 0)}>👍 {c.likes || 0}</button>
                {c.user_id === user.id && (
                  <button onClick={() => handleDeleteComment(c.id)}>❌</button>
                )}
              </p>
            ))}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const text = e.target.comment.value.trim();
                if (text) handleComment(video.id, text);
                e.target.reset();
              }}
            >
              <input type="text" name="comment" placeholder="Write a comment..." />
              <button type="submit">💬</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
