import SoundBoard from "./soundBoard";
import TTSPanel from "./TTSPanel";
import Mascot from "./Mouse";
import VoiceUserList from "./voiceUserList";
import { useState, useEffect } from "react";
import { playSound } from "../services/sonnerie";

export default function VoicePanel({ channelName, guildId, isConnected, setIsConnected, isMuted, setIsMuted, currentChannel }) {
  const [ttsText, setTtsText] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [mascotState, setMascotState] = useState("");

  const sendTTS = () => {
    if (!ttsText.trim()) return;

    fetch(`http://localhost:3001/tts/${currentChannel}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: ttsText }),
    });

    setTtsText("");
  };

  return (
    <div className="voiceContainer">
      <div className="voiceHeader">
        {isConnected
          ? `Connecté à ${channelName}`
          : `Déconnecté de ${channelName}`}
      </div>

      {!isMuted && (
        <div className="voiceBody">
          <button
            className="Btn"
            onClick={() =>
              setActiveMenu(activeMenu === "soundboard" ? null : "soundboard")
            }
          >
            Soundboard
          </button>

          {activeMenu === "soundboard" && (
            <SoundBoard channelId={currentChannel} />
          )}

          <button
            //className="Btn"
            className="hide"
            onClick={() => setActiveMenu(activeMenu === "tts" ? null : "tts")}
          >
            TTS
          </button>

          {activeMenu === "tts" && <TTSPanel channelId={currentChannel} />}

          <div className="hide">
            <VoiceUserList channelId={currentChannel} />
          </div>
        </div>
      )}
      {isMuted && (
        <div className="file">
          <Mascot state={mascotState} />
          <h4 className="info">Vous êtes Mute !</h4>
        </div>
      )}

      <div className="voiceFooter">
        <button className="Btn" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? "Muted" : "Actif"}
        </button>

        <button
          className="leaveBtn"
          onClick={() => {
            fetch(`http://localhost:3001/leave-voice/${guildId}`, {
              method: "POST",
            });
            setIsConnected(false);
          }}
        >
          Quitter le vocal
        </button>
      </div>
    </div>
  );
}
