// src/components/VideoList.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideoList({ user, videos: initialVideos = [], refreshVideos }) {
  const [videos, setVideos] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [likesMap, setLikesMap] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // When parent gives updated videos (from App), resolve public URL for each
  useEffect(() => {
    (async () => {
      const v = initialVideos || [];
      const mapped = await Promise.all(
        v.map(async (vid) => {
          // if _public_url present (App resolved it), use it; else compute from file_path
          if (vid._public_url && vid._public_url.startsWith("http")) return vid;
          if (vid.file_path) {
            const { data: urlData } = supabase.storage.from("videos").getPublicUrl(vid.file_path);
            return { ...vid, _public_url: urlData?.publicUrl ?? "" };
          }
          return { ...vid, _public_url: vid.public_url || "" };
        })
      );
      setVideos(mapped);
      if (mapped.length) {
        await fetchCommentsAndLikes(mapped.map((x) => x.id));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVideos]);

  // fetch comments & likes in bulk for a set of videoIds
  async function fetchCommentsAndLikes(videoIds = []) {
    if (!videoIds.length) return;
    // comments
    const { data: comments } = await supabase.from("comments").select("*").in("video_id", videoIds).order("created_at", { ascending: true });
    const cMap = {};
    (comments || []).forEach((c) => {
      cMap[c.video_id] = cMap[c.video_id] || [];
      cMap[c.video_id].push(c);
    });
    setCommentsMap((p) => ({ ...p, ...cMap }));

    // likes (video likes)
    const { data: likes } = await supabase.from("likes").select("*").in("video_id", videoIds);
    const lMap = {};
    (likes || []).forEach((l) => {
      lMap[l.video_id] = (lMap[l.video_id] || 0) + 1;
    });
    setLikesMap((p) => ({ ...p, ...lMap }));
  }

  // Like a video (creates a row in likes table; uniqueness prevented by DB unique constraint)
  async function handleLikeVideo(videoId) {
    const { error } = await supabase.from("likes").insert([{ video_id: videoId, user_id: user.id }]);
    if (error) {
      // duplicate like will error — ignore silently
      console.warn("like error:", error.message || error);
    }
    await fetchCommentsAndLikes([videoId]);
  }

  // Comments: add
  async function handleAddComment(videoId) {
    const text = (commentInputs[videoId] || "").trim();
    if (!text) return;
    const { error } = await supabase.from("comments").insert([{ video_id: videoId, user_id: user.id, text }]);
    if (error) {
      console.error("comment insert:", error);
    } else {
      setCommentInputs((p) => ({ ...p, [videoId]: "" }));
      await fetchCommentsAndLikes([videoId]);
    }
  }

  // Comment like/unlike via comment_likes table
  async function handleLikeComment(commentId) {
    const { error } = await supabase.from("comment_likes").insert([{ comment_id: commentId, user_id: user.id }]);
    if (error) {
      console.warn("comment like error:", error);
    } else {
      // fetch comments again to update counts
      const ids = videos.map((v) => v.id);
      await fetchCommentsAndLikes(ids);
    }
  }

  // Delete comment (only owner allowed per policy)
  async function handleDeleteComment(commentId, videoId) {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) console.error("delete comment error:", error);
    else await fetchCommentsAndLikes([videoId]);
  }

  // Delete video (owner only): remove storage file and DB row
  async function handleDeleteVideo(videoId, filePath) {
    if (!window.confirm("Delete this video?")) return;
    // remove storage
    try {
      await supabase.storage.from("videos").remove([filePath]);
    } catch (e) {
      console.warn("storage remove:", e);
    }
    // remove DB row
    await supabase.from("videos").delete().eq("id", videoId);
    if (refreshVideos) await refreshVideos();
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div key={video.id} className="video-tile">
          <h3>{video.title}</h3>

          {/* playable video */}
          <video controls playsInline preload="metadata" src={video._public_url || video.public_url}>
            Your browser does not support the video tag.
          </video>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <button className="like-btn" onClick={() => handleLikeVideo(video.id)}>❤️ Like</button>
            <div style={{ color: "#ffe4f2", fontWeight: 600 }}>{likesMap[video.id] || 0} likes</div>

            {video.user_id === user.id && (
              <button className="delete-btn" style={{ marginLeft: "auto" }} onClick={() => handleDeleteVideo(video.id, video.file_path)}>
                🗑 Delete
              </button>
            )}
          </div>

          {/* comments */}
          <div className="comments" style={{ marginTop: 12 }}>
            <h4>Comments</h4>

            <div className="comment-list">
              {(commentsMap[video.id] || []).map((c) => (
                <div className="comment-row" key={c.id}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: "#fff" }}>{c.user_id === user.id ? "You" : c.user_id.slice(0, 6)}</strong>: <span style={{ color: "#fff" }}>{c.text}</span>
                  </div>

                  <div className="comment-actions">
                    <button onClick={() => handleLikeComment(c.id)}>❤️</button>
                    {c.user_id === user.id && <button onClick={() => handleDeleteComment(c.id, video.id)}>✖️</button>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInputs[video.id] || ""}
                onChange={(e) => setCommentInputs((p) => ({ ...p, [video.id]: e.target.value }))}
              />
              <button onClick={() => handleAddComment(video.id)}>Post</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
