import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import VideoUpload from "./components/VideoUpload";
import UploadList from "./components/UploadList";

const affirmations = [
  "🌸 You are stronger than you think.",
  "✨ Growth takes time, but you’re on the right path.",
  "💫 Your presence makes the world brighter.",
  "🌷 Small steps forward are still progress.",
  "🌙 Rest is productive too!!",
  "🌟 You are capable of amazing things.",
  "🌼 Your kindness matters.",
  "🌊 Breathe deeply, you are safe here.",
  "🌻 Choose progress over perfection.",
  "🔥 You’ve overcome every hard day so far.",
  "🌹 Believe in your own light.",
  "☀️ Today is full of possibilities.",
  "🌺 Your effort is worth it.",
  "🌈 Healing isn’t linear, and that’s okay.",
  "🌐 You belong, exactly as you are.",
  "🕊️ Let go of what you can’t control.",
  "🍃 Even on hard days, you’re growing.",
  "💎 You are worthy of love and respect.",
  "🌌 The future holds beautiful things for you.",
  "🌸 You are enough, exactly as you are."
];

function App() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);

  // Fetch affirmations randomly
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setAffirmation(affirmations[randomIndex]);
  }, []);

  // Check session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch videos from DB
  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error);
    } else {
      setVideos(data);
    }
  };

  useEffect(() => {
    if (user) fetchVideos();
  }, [user]);

  if (!user) return <Login />;

  return (
    <div className="app">
      {/* Affirmation tile */}
      <div className="affirmations">
        <p>{affirmation}</p>
      </div>

      {/* Upload form */}
      <VideoUpload user={user} onUploadComplete={fetchVideos} />

      {/* Videos grid */}
      <UploadList user={user} videos={videos} refreshVideos={fetchVideos} />
    </div>
  );
}

export default App;
