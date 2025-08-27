import { useEffect, useState } from "react";

const affirmations = [
  "You are loved 💙",
  "Your voice matters 🎤",
  "Keep creating 🌟",
  "Every step counts 🚀",
  "You inspire me 💫"
];

export default function Affirmations() {
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(random);
  }, []);

  return <div id="affirmation">{affirmation}</div>;
}
