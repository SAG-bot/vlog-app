import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";

export default function App() {
  const [user, setUser] = useState(null);
  const [idx, setIdx] = useState(0);

  // 20 calm, elegant affirmations
  const affirmations = useMemo(
    () => [
      "You are deeply loved and endlessly worthy.",
      "Your presence brings warmth and light to every room.",
      "You create beauty in small, thoughtful ways every day.",
      "You are allowed to take up space and be heard.",
      "Your kindness has a lasting impact.",
      "Baby you're pressure.",
      "You deserve peace, joy, and gentle days.",
      "Your heart is strong, soft, and brave.",
      "You handle challenges with grace and patience.",
      "You are more than enough, exactly as you are.",
      "Your creativity is a gift that inspires others.",
      "You are safe to rest, reset, and begin again.",
      "Ndokuda hangu but haaa, this was hard broski.",
      "You are allowed to celebrate yourself without apology.",
      "Your courage is quiet, steady, and real.",
      "You bring calm to the people you love.",
      "Your future is soft, bright, and welcoming.",
      "You choose love for yourself a little more each day.",
      "Your dreams deserve your full belief.",
      "You are the miracle you’ve been looking for."
    ],
    []
  );

  // Rotate affirmation every 6 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % affirmations.length);
    }, 6000);
    return () => clearInterval(t);
  }, [affirmations.length]);

  // Auth boot + listener
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app-container">
      {/* Affirmations tile (click to shuffle) */}
      <div
        className="affirmations"
        onClick={() => setIdx((i) => (i + 1) % affirmations.length)}
        title="Click to see another affirmation"
        style={{ cursor: "pointer" }}
      >
        {affirmations[idx]}
      </div>

      {/* Simple top bar */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 10 }}>
        <button onClick={handleSignOut}>Sign out</button>
      </div>

      {/* Upload + List */}
      <VideoUpload user={user} onUpload={() => { /* VideoList fetches on mount; keep simple here */ }} />
      <VideoList user={user} />
    </div>
  );
}
