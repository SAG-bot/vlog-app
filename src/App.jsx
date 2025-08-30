// src/App.jsx
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";

const affirmations = [
  "💜 You are loved 💜",
  "🌸 You make the world brighter 🌸",
  "💫 I’m proud of you 💫",
  "🌟 Keep shining 🌟",
  "💕 You are amazing 💕",
  "🌈 You inspire me every day 🌈"
];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    // Pick a random affirmation each time app loads
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(random);

    // Get initial session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error getting session:", error.message);
      setSession(data?.session || null);
      setLoading(false);
    };
    getSession();

    // Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="app-container">
        <Login />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>{affirmation}</header>

      <div className="controls">
        <button
          className="logout-btn"
          onClick={() => supabase.auth.signOut()}
        >
          Logout
        </button>
      </div>

      <VideoUpload user={session.user} />
      <VideoList user={session.user} />
    </div>
  );
}
