const emojis = [
  "😀",
  "🙁",
  "😂",
  "​​😁​",
  "😍",
  "🤩",
  "😎",
  "😢",
  "😅​​",
  "😡",
  "🙃",
  "​🤑",
  "🥵​",
  "🥶​",
  "😁​​",
  "🤮",
  "​🥺​",
  "😇​",
  "😍​",
  "😵‍💫​",
  "🤯",
  "​😲",
  "😜​",
  "😈​",
  "👍",
  "👎",
  "🔥",
  "💀",
  "🎉",
  "❤️",
  "👋​",
  "💪",
  "🤖",
  "🐭",
  "🎁",
  "🍕",
  "⚡",
  "✨",
  "🚀",
  "🎮",
  "​​​👑​",
  "💰",
  "🫵​",
  "🧠​",
  "🔔",
  "​🏆",
  "​💡",
  "🍔",
  "🍎",
  "🎂",
  "🍪​",
  "🍾",
  "🔪",
  "💣​",
  "⚔️​",
  "🎨​​​​​",
  "🎰​",
  "✏️​​",
  "🌲​",
  "​🐀​",
];


export default function EmojiPicker({ onSelect } ) {
  return (
    <div className="emojiPicker" onClick={(e) => e.stopPropagation()}>
      {emojis.map((emoji, index) => (
        <button
          key={index}
          className="emojiBtn"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
