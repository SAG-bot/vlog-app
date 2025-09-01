import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ session }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  // Fetch videos with likes and comments
  const fetchVideos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("videos")
      .select(`
        id,
        title,
        video_url,
        user_id,
        likes (
          id,
          user_id
        ),
        comments (
          id,
          content,
          user_id
        )
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error.message);
    } else {
      setVideos(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Like/unlike video
  const toggleLike = async (videoId) => {
    const video = videos.find((v) => v.id === videoId);
    const alreadyLiked = video.likes.some((l) => l.user_id === userId);

    if (alreadyLiked) {
      await supabase.from("likes").delete().match({ video_id: videoId, user_id: userId });
    } else {
      await supabase.from("likes").insert([{ video_id: videoId, user_id: userId }]);
    }

    fetchVideos();
  };

  // Add a comment
  const addComment = async (e, videoId) => {
    e.preventDefault();
    const content = e.target.elements.comment.value.trim();
    if (!content) return;

    await supabase.from("comments").insert([{ video_id: videoId, user_id: userId, content }]);
    e.target.reset();
    fetchVideos();
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    await supabase.from("comments").delete().match({ id: commentId, user_id: userId });
    fetchVideos();
  };

  // Like a comment
  const likeComment = async (commentId) => {
    const { data: existing } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      await supabase.from("comment_likes").delete().match({ id: existing.id });
    } else {
      await supabase.from("comment_likes").insert([{ comment_id: commentId, user_id: userId }]);
    }
    fetchVideos();
  };

  // Delete video (only if owner)
  const deleteVideo = async (videoId) => {
    await supabase.from("videos").delete().match({ id: videoId, user_id: userId });
    fetchVideos();
  };

  if (loading) return <p>Loading videos...</p>;

  return (
    <div className="video-grid">
      {videos.map((video) => {
        const liked = video.likes.some((l) => l.user_id === userId);

        return (
          <div key={video.id} className="video-tile">
            <h3>{video.title}</h3>
            <video src={video.video_url} controls />

            {/* Like button */}
            <button onClick={() => toggleLike(video.id)} className="like-btn">
              {liked ? "💖 Unlike" : "❤️ Like"} ({video.likes.length})
            </button>

            {/* Delete video button (only for owner) */}
            {video.user_id === userId && (
              <button
                onClick={() => deleteVideo(video.id)}
                className="delete-btn"
              >
                🗑️ Delete Video
              </button>
            )}

            {/* Comments Section */}
            <div className="comments">
              <form onSubmit={(e) => addComment(e, video.id)}>
                <input type="text" name="comment" placeholder="Write a comment..." />
                <button type="submit">💬 Post</button>
              </form>

              {video.comments.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{c.content}</span>

                  {/* Like comment button */}
                  <button onClick={() => likeComment(c.id)}>👍</button>

                  {/* Delete comment (only if owner) */}
                  {c.user_id === userId && (
                    <button onClick={() => deleteComment(c.id)}>❌</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
