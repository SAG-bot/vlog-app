// src/components/Login.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    // successful login triggers auth listener in App.jsx
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    alert("Check your email to confirm your account.");
  };

  return (
    <div className="login-page">
      <div>
        <div className="affirmations">
          🌸 You are loved. • 🌟 Keep going. • ✨ Small steps matter.
        </div>

        <div className="login-card">
          <h2>Welcome back</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <button type="button" onClick={handleSignup} style={{ marginTop: 8 }}>
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
