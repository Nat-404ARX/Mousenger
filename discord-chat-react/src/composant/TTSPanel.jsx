import { useState } from "react";

export default function TTSPanel({ channelId }) {
  const [text, setText] = useState("");
  const [pitch, setPitch] = useState(1);
  const [speed, setSpeed] = useState(1);

  const sendTTS = () => {
    if (!text.trim()) return;

    fetch(`http://localhost:3001/tts/${channelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, pitch, speed }),
    });

    setText("");
  };

  return (
    <div className="ttsPanel">
      <input
        value={text}
        className="TTStext"
        onChange={(e) => setText(e.target.value)}
        placeholder="Fais parler Mouse..."
      />

      <div className="sliders">
        <label>Pitch</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
        />

        <label>Vitesse</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
        />
      </div>

      <button className="Btn" onClick={sendTTS}>Parler</button>
    </div>
  );
}
