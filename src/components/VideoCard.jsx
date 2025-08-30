import Likes from "./Likes";
import Comments from "./Comments";

export default function VideoCard({ video, user }) {
  return (
    <div className="video-card">
      <video controls>
        <source src={video.video_url} type="video/mp4" />
      </video>
      <h3>{video.title}</h3>
      <div className="video-actions">
        <Likes videoId={video.id} user={user} />
      </div>
      <Comments videoId={video.id} user={user} />
    </div>
  );
}
