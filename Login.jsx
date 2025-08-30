import { useState } from "react";
import { supabase } from "../supabaseClient";

const affirmations = [
  "💜 You are loved 💜",
  "🌸 You make the world brighter 🌸",
  "💫 I’m proud of you 💫",
  "🌟 Keep shining 🌟",
  "💕 You are amazing 💕",
  "🌈 You inspire me every day 🌈"
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [affirmation] = useState(
    affirmations[Math.floor(Math.random() * affirmations.length)]
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("✨ Welcome back! Logging you in...");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("✅ Account created! Check your email to confirm.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="affirmation">{affirmation}</h1>

        <form className="login-form" onSubmit={handleLogin}>
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

          <button type="submit" className="login-btn">Login</button>
          <button type="button" className="signup-btn" onClick={handleSignup}>
            Sign Up
          </button>
        </form>

        {errorMsg && <p className="error">{errorMsg}</p>}
        {successMsg && <p className="success">{successMsg}</p>}
      </div>
    </div>
  );
}
