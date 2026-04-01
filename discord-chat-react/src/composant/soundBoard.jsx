import { playSound } from "../services/sonnerie";

const sounds = [
  { emoji: "🐭", name: "squeak", file: "squeak.mp3" },
  { emoji: "🔔", name: "ding", file: "ding.mp3" },
  { emoji: "😂", name: "laugh", file: "laugh.mp3" },
  { emoji: "💥", name: "boom", file: "boom.mp3" },
  { emoji: "🦆​", name: "quack", file: "quack.mp3" },
  { emoji: "👅​", name: "lick", file: "lick.mp3" },
  { emoji: "🥁​", name: "drump", file: "drump.mp3" },
  { emoji: "🤨​​", name: "vine", file: "vine.mp3" },
  { emoji: "🔩​​", name: "metal pipe", file: "metal-pipe.mp3" },
  { emoji: "😱​​​", name: "scream", file: "scream.mp3" },
  { emoji: "🏚️", name: "dun dun duun", file: "dun-dun-dun.mp3" },
  { emoji: "🧱", name: "lego breaking", file: "lego-breaking.mp3" },
];


export default function SoundBoard({ channelId }) {
  const playSoundDiscord = (file) => {
    fetch(`http://localhost:3001/soundboard/${channelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file }),
    });
    playSound(file);
  };

  return (
    <div className="soundboard">
      {sounds.map((sound, index) => (
        <div
          key={index}
          className="soundBtn"
          onClick={() => playSoundDiscord(sound.file)}
        >
          <div className="emoji">{sound.emoji}</div>
          <div className="label">{sound.name}</div>
        </div>
      ))}
    </div>
  );
}
