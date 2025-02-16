class SoundManager {
  private sounds: Map<string, HTMLAudioElement>;

  constructor(soundFiles: Record<string, string>) {
    this.sounds = new Map();

    // Load sounds into the Map
    Object.entries(soundFiles).forEach(([key, filePath]) => {
      const audio = new Audio(filePath);
      this.sounds.set(key, audio);
    });
  }

  playSound(name: string): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0; // Restart sound from the beginning
      sound.play().catch((err) => console.error(`Error playing "${name}":`, err));
    } else {
      console.warn(`Sound "${name}" not found.`);
    }
  }
}

// Example usage:
const soundManager = new SoundManager({
  messageReceiveNoti: "/audio/notiReceive.mp3",
  messageSendNoti: "/audio/notiSend.ogg",
});

export function playMessageReceiveNotificationSound() {
  soundManager.playSound('messageReceiveNoti');
}

export function playMessageSendNotificationSound() {
  soundManager.playSound('messageSendNoti');
}

