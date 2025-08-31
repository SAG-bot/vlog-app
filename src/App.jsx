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

  useEffect(() => {
    const currentSession = supabase.auth.getSession();
    currentSession.then(({ data: { session } }) => setSession(session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div>
      {!session ? (
        <Login onLogin={setSession} />
      ) : (
        <>
          <div className="affirmations">
            <h2>Daily Affirmations 💕</h2>
            <ul>
              {affirmations.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </div>

          <button onClick={handleLogout}>🚪 Logout</button>
          <VideoUpload session={session} onUpload={() => window.location.reload()} />
          <VideoList session={session} />
        </>
      )}
    </div>
  );
}
