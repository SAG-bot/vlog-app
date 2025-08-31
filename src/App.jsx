// src/App.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";
import "./style.css";

const AFFIRMATIONS = [
  "🌸 You are stronger than you think.",
  "✨ Growth takes time, but you’re on the right path.",
  "💫 Your presence makes the world brighter.",
  "🌷 Small steps forward are still progress.",
  "🌙 Rest is productive too!!!",
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

export default function App() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [affirmation, setAffirmation] = useState("");

  // pick a random affirmation on load
  useEffect(() => {
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  }, []);

  // auth session + listener
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
    }
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // fetch videos (get public URL for each)
  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchVideos error:", error);
      setVideos([]);
      return;
    }
    // resolve public url for any file_path entries
    const mapped = await Promise.all(
      (data || []).map(async (v) => {
        // if public_url already in DB, prefer it; else compute from file_path
        if (v.public_url && v.public_url.startsWith("http")) {
          return { ...v, _public_url: v.public_url };
        }
        if (v.file_path) {
          const { data: urlData } = await supabase.storage.from("videos").getPublicUrl(v.file_path);
          return { ...v, _public_url: urlData?.publicUrl ?? "" };
        }
        return { ...v, _public_url: "" };
      })
    );

    setVideos(mapped);
  };

  // auto-fetch when logged in
  useEffect(() => {
    if (user) fetchVideos();
    else setVideos([]);
  }, [user]);

  if (!user) return <Login />;

  return (
    <div className="container">
      <div className="affirmations">{affirmation}</div>

      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setUser(null);
          }}
        >
          Logout
        </button>
      </div>

      <VideoUpload user={user} onUploadComplete={fetchVideos} />

      <VideoList user={user} videos={videos} refreshVideos={fetchVideos} />
    </div>
  );
}
