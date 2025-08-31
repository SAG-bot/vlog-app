import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ user }) {
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [likes, setLikes] = useState({});

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setVideos(data);
        fetchLikes(data);
        fetchComments(data);
      }
    };

    fetchVideos();
  }, []);

  // Fetch likes
  const fetchLikes = async (videosData) => {
    const { data } = await supabase.from("likes").select("*");
    if (!data) return;

    const likeMap = {};
    videosData.forEach((video) => {
      likeMap[video.id] = data.filter((l) => l.video_id === video.id).length;
    });
    setLikes(likeMap);
  };

  // Fetch comments
  const fetchComments = async (videosData) => {
    const { data } = await supabase.from("comments").select("*");
    if (!data) return;

    const commentMap = {};
    videosData.forEach((video) => {
      commentMap[video.id] = data.filter((c) => c.video_id === video.id);
    });
    setComments(commentMap);
  };

  // Like handler
  const handleLike = async (videoId) => {
    await supabase.from("likes").insert([
      { video_id: videoId, user_id: user.id }
    ]);
    fetchLikes(videos);
  };

  // Comment handler
  const handleAddComment = async (videoId) => {
    if (!newComments[videoId]) return;

    await supabase.from("comments").insert([
      { video_id: videoId, user_id: user.id, content: newComments[videoId] }
    ]);

    setNewComments({ ...newComments, [videoId]: "" });
    fetchComments(videos);
  };

  // Delete handler
  const handleDelete = async (videoId) => {
    await supabase.from("videos").delete().eq("id", videoId);
    setVideos(videos.filter((v) => v.id !== videoId));
  };

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div className="video-tile" key={video.id}>
          <h3>{video.title}</h3>
          <video controls>
            <source src={video.video_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="video-actions">
            <button
              className="like-btn"
              onClick={() => handleLike(video.id)}
            >
              ❤️ {likes[video.id] || 0}
            </button>

            {user.id === video.user_id && (
              <button
                className="delete-btn"
                onClick={() => handleDelete(video.id)}
              >
                🗑 Delete
              </button>
            )}
          </div>

          <div className="comments">
            <h4>Comments</h4>
            <div className="comment-list">
              {comments[video.id]?.map((c) => (
                <p key={c.id} className="comment">
                  {c.content}
                </p>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComments[video.id] || ""}
              onChange={(e) =>
                setNewComments({ ...newComments, [video.id]: e.target.value })
              }
            />
            <button onClick={() => handleAddComment(video.id)}>Post</button>
          </div>
        </div>
      ))}
    </div>
  );
}
