import SoundBoard from "./soundBoard";
import VoiceUserList from "./voiceUserList";
import { useState, useEffect } from "react";

export default function VoicePanel({ channelName, guildId, isConnected, setIsConnected, isMuted, setIsMuted, currentChannel }) {
  const [showSoundboard, setShowSoundboard] = useState(false);
  return (
    <div className="voiceContainer">
      <div className="voiceHeader">
        {isConnected
          ? `Connecté à ${channelName}`
          : `Déconnecté de ${channelName}`}
      </div>

      <div className="voiceBody">
        <button
          className="Btn"
          onClick={() => setShowSoundboard(!showSoundboard)}
        >
          Soundboard
        </button>

        {showSoundboard && <SoundBoard channelId={currentChannel} />}

        <div className="hide">
          <VoiceUserList channelId={currentChannel} />
        </div>
      </div>

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
