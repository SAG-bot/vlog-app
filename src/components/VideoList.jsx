import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ user }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({}); // track comment inputs

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("videos")
      .select("*, comments(*), likes(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error);
    } else {
      // Add public URL
      const withUrls = data.map((v) => {
        const { data: urlData } = supabase.storage
          .from("videos")
          .getPublicUrl(v.video_url);
        return { ...v, public_url: urlData.publicUrl };
      });
      setVideos(withUrls);
    }
    setLoading(false);
  };

  const handleLike = async (videoId) => {
    const { error } = await supabase.from("likes").insert([
      { video_id: videoId, user_id: user.id },
    ]);
    if (!error) fetchVideos();
  };

  const handleComment = async (videoId) => {
    if (!commentText[videoId]) return;
    const { error } = await supabase.from("comments").insert([
      { video_id: videoId, user_id: user.id, text: commentText[videoId] },
    ]);
    if (!error) {
      setCommentText((prev) => ({ ...prev, [videoId]: "" }));
      fetchVideos();
    }
  };

  const handleDelete = async (id, path) => {
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (!error) {
      await supabase.storage.from("videos").remove([path]);
      setVideos((vids) => vids.filter((v) => v.id !== id));
    }
  };

  if (loading) return <p>Loading videos...</p>;

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div className="tile" key={video.id}>
          <h3>{video.title}</h3>
          <video width="100%" controls>
            <source src={video.public_url} type="video/mp4" />
            Your browser does not support video.
          </video>

          {/* Likes */}
          <div className="likes-section">
            <button onClick={() => handleLike(video.id)}>❤️ Like</button>
            <span>{video.likes?.length || 0} likes</span>
          </div>

          {/* Comments */}
          <div className="comments-section">
            <h4>Comments</h4>
            <div className="comment-list">
              {video.comments?.map((c) => (
                <p key={c.id}>
                  <strong>{c.user_id.slice(0, 5)}:</strong> {c.text}
                </p>
              ))}
            </div>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText[video.id] || ""}
              onChange={(e) =>
                setCommentText((prev) => ({ ...prev, [video.id]: e.target.value }))
              }
            />
            <button onClick={() => handleComment(video.id)}>Post</button>
          </div>

          {/* Delete (owner only) */}
          {video.user_id === user.id && (
            <button
              className="delete-btn"
              onClick={() => handleDelete(video.id, video.video_url)}
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
