import { useEffect, useState } from "react";
import supabase from "./supabaseClient";
import Auth from "./components/Auth";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";
import Affirmations from "./components/Affirmations";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Auth />;

  return (
    <div>
      <header>
        <h1>Her Vlog Sanctuary</h1>
        <Affirmations />
      </header>
      <VideoUpload />
      <VideoList />
    </div>
  );
}

export default App;
