import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";
import "../style.css";

const affirmations = [
  "🌸 You are stronger than you think.",
  "💎 Every step forward counts.",
  "✨ Your energy inspires others.",
  "🌱 Growth takes time, and you're growing beautifully.",
  "🌊 Peace flows through you.",
  "🌞 You bring light wherever you go.",
  "🌷 You deserve to bloom in your own time.",
  "🦋 Change is beautiful and so are you.",
  "🌈 Brighter days are always ahead.",
  "🔥 You are resilient and unstoppable.",
  "🎶 Your vibe attracts positivity.",
  "🌟 You shine even on cloudy days.",
  "💖 You are deeply loved and valued.",
  "🕊 Calmness surrounds your heart.",
  "🍀 Luck and blessings flow to you.",
  "🌻 Keep reaching for the sun.",
  "🌌 The universe is on your side.",
  "💫 Your dreams are valid and possible.",
  "🏔 You can climb any mountain.",
  "🌺 You are more than enough."
];

export default function App() {
  const [session, setSession] = useState(null);
  const [dailyAffirmation, setDailyAffirmation] = useState("");
  const [refreshVideos, setRefreshVideos] = useState(false);

  useEffect(() => {
    // Set daily affirmation based on date
    const index = new Date().getDate() % affirmations.length;
    setDailyAffirmation(affirmations[index]);

    // Supabase session handling
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="container">
      {!session ? (
        <Login onLogin={setSession} />
      ) : (
        <>
          {/* Top-right logout button */}
          <div className="logout-container">
            <button onClick={handleLogout}>🚪 Logout</button>
          </div>

          {/* Daily affirmation */}
          <div className="affirmations">
            <h2>Daily Affirmation 💕</h2>
            <p>{dailyAffirmation}</p>
          </div>

          {/* Upload and video list */}
          <VideoUpload
            session={session}
            onUpload={() => setRefreshVideos(prev => !prev)}
          />
          <VideoList session={session} refresh={refreshVideos} />
        </>
      )}
    </div>
  );
}
