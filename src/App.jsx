import { useState } from "react";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";

function App() {
  const [view, setView] = useState("list"); // default to "My Videos"

  return (
    <div className="container">
      <nav className="navbar">
        <h1>My Vlog</h1>
        <div className="nav-buttons">
          <button onClick={() => setView("upload")}>Upload Video</button>
          <button onClick={() => setView("list")}>My Videos</button>
        </div>
      </nav>

      <main>
        {view === "upload" && <VideoUpload />}
        {view === "list" && <VideoList />}
      </main>
    </div>
  );
}

export default App;
