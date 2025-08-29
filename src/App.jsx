import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import VideoUpload from "./components/VideoUpload";
import VideoList from "./components/VideoList";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Login onLogin={(user) => setSession({ user })} />;
  }

  return (
    <div className="container">
      <nav className="navbar">
        <h1>My Vlog</h1>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </nav>

      <VideoUpload />
      <VideoList user={session.user} />
    </div>
  );
}

export default App;
