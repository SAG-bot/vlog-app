import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";

const affirmations = [
  "You are amazing 💖",
  "Keep shining 🌟",
  "Your energy is beautiful ✨",
  "You make the world brighter 🌸",
  "Believe in yourself 🌈"
];

function App() {
  const [user, setUser] = useState(null);
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    // Pick a random affirmation
    setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);

    // Supabase auth listener
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div>
      <div className="affirmations">{affirmation}</div>
      <div className="app-container">
        <h1>Welcome, {user.email}</h1>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>

        <VideoUpload user={user} />
        <VideoList user={user} />
      </div>
    </div>
  );
}

export default App;
