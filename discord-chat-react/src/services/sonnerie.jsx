export function playSound(soundName) {
  const audio = new Audio(`/sounds/${soundName}`);
  audio.volume = 0.5;
  audio.play().catch((err) => {
    console.log("Erreur lecture audio :", err);
  });
}
