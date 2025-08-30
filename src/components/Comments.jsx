import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Comments = ({ videoId, user }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: true });
    if (!error) setComments(data);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!text) return;

    await supabase.from("comments").insert([
      {
        video_id: videoId,
        user_id: user.id,
        content: text,
      },
    ]);
    setText("");
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="comments">
      <form onSubmit={addComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
      {comments.map((c) => (
        <p key={c.id}>{c.content}</p>
      ))}
    </div>
  );
};

export default Comments;
