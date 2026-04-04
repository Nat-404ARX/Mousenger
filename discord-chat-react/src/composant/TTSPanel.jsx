import { useState } from "react";

export default function TTSPanel({ channelId }) {
  const [text, setText] = useState("");
  const [pitch, setPitch] = useState(1);
  const [speed, setSpeed] = useState(1);


  const sendTTS = async () => {
    if (!text.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/tts/${channelId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, pitch, speed }),
      });

      const data = await res.json();

      if (data.url) {
        console.log(data.url)
        playTTS(data.url);
      }

      setText();
    } catch (err) {
      console.error("Erreur TTS :", err);
    }
  };

  let currentAudio = null;

  function playTTS(url) {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(url);
    currentAudio = audio;

    audio.volume = 1;

    audio.play().catch((err) => {
      console.error("Erreur lecture :", err);
    });
  }

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
