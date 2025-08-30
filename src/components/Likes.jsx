import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Likes({ videoId, user }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("video_id", videoId);

    setLikes(count);

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("video_id", videoId)
      .eq("user_id", user.id)
      .single();

    setLiked(!!data);
  };

  const toggleLike = async () => {
    if (liked) {
      await supabase.from("likes").delete().eq("video_id", videoId).eq("user_id", user.id);
      setLikes(likes - 1);
    } else {
      await supabase.from("likes").insert([{ video_id: videoId, user_id: user.id }]);
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  return (
    <button className="like-btn" onClick={toggleLike}>
      ❤️ {likes}
    </button>
  );
  <button onClick={() => handleLike(video.id)}>❤️ {video.likes || 0}</button>

}
