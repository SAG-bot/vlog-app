import { useEffect, useState } from "react";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setVideos(data);
    
  };

  const handleLike = async (videoId) => {
    const { error } = await supabase
      .from("videos")
      .update({ likes: supabase.rpc("increment_like", { video_id: videoId }) })
      .eq("id", videoId);

    if (error) {
      console.error("Error liking video:", error.message);
    } else {
      fetchVideos(); // refresh list
    }
  };

  const handleComment = async (videoId) => {
    if (!newComment.trim()) return;

    const user = (await supabase.auth.getUser()).data.user;

    const { error } = await supabase.from("comments").insert([
      {
        video_id: videoId,
        content: newComment,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error("Error adding comment:", error.message);
    } else {
      setNewComment("");
      fetchComments(videoId);
    }
  };

  const fetchComments = async (videoId) => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("video_id", videoId);

    if (!error) {
      setComments((prev) => ({ ...prev, [videoId]: data }));
    }
  };

  
  const handleDelete = async (videoId) => {
    await supabase.from("videos").delete().eq("id", videoId);
    fetchVideos();
  };

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-card">
          <h3>{video.title}</h3>

          <video width="100%" controls>
            <source src={video.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <button onClick={() => handleLike(video.id)}>❤️ Like</button>
          <span>{video.likes || 0} Likes</span>

          <div className="comments">
            <button onClick={() => fetchComments(video.id)}>
              Show Comments
            </button>

            {comments[video.id]?.map((c) => (
              <p key={c.id}>
                <strong>{c.user_id.slice(0, 5)}:</strong> {c.content}
              </p>
            ))}

            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={() => handleComment(video.id)}>Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
}
