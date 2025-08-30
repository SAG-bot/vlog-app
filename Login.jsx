import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      onLogin(data.user); // Pass user back to App.jsx
    }
  };

  return (
    <div className="login-page">
      <div>
        {/* Affirmations Tile */}
        <div className="affirmations">
          🌸 You are loved. <br />
          🌈 You are enough. <br />
          ✨ Your creativity shines through everything you do.
        </div>

        {/* Login Card */}
        <div className="login-card">
          <h2>Welcome Back 💖</h2>
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
              {loading ? "Logging in..." : "Login ✨"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
