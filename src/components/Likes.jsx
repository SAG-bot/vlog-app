import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Likes = ({ videoId, user }) => {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const fetchLikes = async () => {
    const { data, error } = await supabase.from("likes").select("*").eq("video_id", videoId);
    if (!error) {
      setCount(data.length);
      setLiked(data.some((l) => l.user_id === user.id));
    }
  };

  const toggleLike = async () => {
    if (liked) return; // only allow once
    await supabase.from("likes").insert([{ video_id: videoId, user_id: user.id }]);
    fetchLikes();
  };

  useEffect(() => {
    fetchLikes();
  }, []);

  return (
    <button className="like-btn" onClick={toggleLike}>
      ❤️ {count}
    </button>
  );
};

export default Likes;
