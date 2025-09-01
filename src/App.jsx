import React from "react";
import VideoUpload from "./components/VideoUpload";

export default function App() {
  // If you use Supabase Auth, pass the real session here
  const session = null;

  const handleComplete = () => {
    // Refresh your list, navigate, etc.
    console.log("Upload complete");
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2>Vlog Sanctuary</h2>
      <VideoUpload session={session} onUploadComplete={handleComplete} />
    </div>
  );
}
