import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";
import "../style.css";

const affirmations = [
  "🌸 You are stronger than you think.",
  "💙 Your presence makes the world brighter.",
  "🌈 Growth is happening, even on tough days.",
  "✨ Your potential is limitless.",
  "🌻 You bring kindness wherever you go.",
  "🌟 Small steps still move you forward.",
  "💜 You are worthy of love and respect.",
  "🌸 Every day is a chance to bloom.",
  "🌈 You are enough, exactly as you are.",
  "🌟 Your dreams are worth chasing.",
  "💙 You’re making progress you can’t always see.",
  "🌻 Gratitude turns little into enough.",
  "🌸 You inspire others without even knowing.",
  "💜 You’re allowed to rest and recharge.",
  "🌟 Courage is choosing to keep going.",
  "🌈 You bring beauty to this world.",
  "💙 Mistakes mean you’re learning.",
  "🌸 Believe in your quiet strength.",
  "🌻 Your kindness has ripple effects.",
  "💜 You are becoming the best version of you."
];

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const currentSession = supabase.auth.getSession();
    currentSession.then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <div>
      <div className="affirmations">
        <h2>{affirmations[Math.floor(Math.random() * affirmations.length)]}</h2>
      </div>
      <VideoUpload session={session} onUpload={() => {}} />
      <VideoList session={session} />
      <button onClick={() => supabase.auth.signOut()}>Logout</button>
    </div>
  );
}
