import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const UploadList = ({ user }) => {
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [likes, setLikes] = useState({});

  // Fetch videos
  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, video_url, user_id");

    if (error) console.error(error);
    else setVideos(data);
  };

  // Fetch comments for each video
  const fetchComments = async (videoId) => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, text, user_id")
      .eq("video_id", videoId);

    if (error) console.error(error);
    else setComments((prev) => ({ ...prev, [videoId]: data }));
  };

  // Fetch likes for each video
  const fetchLikes = async (videoId) => {
    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("video_id", videoId);

    if (error) console.error(error);
    else setLikes((prev) => ({ ...prev, [videoId]: count }));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    videos.forEach((video) => {
      fetchComments(video.id);
      fetchLikes(video.id);
    });
  }, [videos]);

  // Handle comment submit
  const handleCommentSubmit = async (videoId, e) => {
    e.preventDefault();
    if (!newComments[videoId]) return;

    const { error } = await supabase.from("comments").insert([
      {
        video_id: videoId,
        text: newComments[videoId],
        user_id: user.id,
      },
    ]);

    if (error) console.error(error);
    else {
      fetchComments(videoId);
      setNewComments((prev) => ({ ...prev, [videoId]: "" }));
    }
  };

  // Delete a comment
  const deleteComment = async (commentId, videoId) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) console.error(error);
    else fetchComments(videoId);
  };

  // Like a comment (just a demo counter, could be a separate table if needed)
  const likeComment = (commentId) => {
    alert(`Liked comment ${commentId} ❤️`); // placeholder
  };

  // Like a video
  const handleLike = async (videoId) => {
    const { error } = await supabase
      .from("likes")
      .insert([{ video_id: videoId, user_id: user.id }]);

    if (error) console.error(error);
    else fetchLikes(videoId);
  };

  // Delete a video
  const deleteVideo = async (videoId, videoUrl) => {
    const { error } = await supabase.from("videos").delete().eq("id", videoId);
    if (error) console.error(error);
    else {
      // Also delete from storage
      const filePath = videoUrl.split("/").pop();
      await supabase.storage.from("videos").remove([filePath]);
      fetchVideos();
    }
  };

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-tile">
          <h3>{video.title}</h3>
          <video src={video.video_url} controls />

          {/* Likes */}
          <button className="like-btn" onClick={() => handleLike(video.id)}>
            ❤️ {likes[video.id] || 0}
          </button>

          {/* Delete button only for owner */}
          {video.user_id === user.id && (
            <button
              className="delete-btn"
              onClick={() => deleteVideo(video.id, video.video_url)}
            >
              Delete
            </button>
          )}

          {/* Comments */}
          <div className="comments">
            <h4>Comments</h4>
            {comments[video.id]?.map((comment) => (
              <div key={comment.id} className="comment-row">
                <span>{comment.text}</span>
                <div className="comment-actions">
                  <button onClick={() => likeComment(comment.id)}>❤️</button>
                  {comment.user_id === user.id && (
                    <button onClick={() => deleteComment(comment.id, video.id)}>✖️</button>
                  )}
                </div>
              </div>
            ))}
            <form onSubmit={(e) => handleCommentSubmit(video.id, e)}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComments[video.id] || ""}
                onChange={(e) =>
                  setNewComments((prev) => ({ ...prev, [video.id]: e.target.value }))
                }
              />
              <button type="submit">Post</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadList;
