import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Comments({ videoId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, content, user_id, created_at")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false });
    setComments(data);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await supabase.from("comments").insert([
      { video_id: videoId, user_id: user.id, content: newComment }
    ]);

    setNewComment("");
    fetchComments();
  };

  return (
    <div className="comments">
      <form onSubmit={addComment}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="comment-btn">Post</button>
      </form>
      {comments.map((c) => (
        <div key={c.id} className="comment">{c.content}</div>
      ))}
    </div>
  );
}
