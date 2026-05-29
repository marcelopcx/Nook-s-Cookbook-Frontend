import { Audio } from "expo-av";

let soundtrack: Audio.Sound | null = null;
let startPromise: Promise<void> | null = null;

export async function startSoundtrack() {
  if (soundtrack) {
    const status = await soundtrack.getStatusAsync();
    if (status.isLoaded) {
      if (!status.isLooping) {
        await soundtrack.setIsLoopingAsync(true);
      }
      if (!status.isPlaying) {
        await soundtrack.playAsync();
      }
      return;
    }

    soundtrack = null;
  }

  if (startPromise) return startPromise;

  startPromise = (async () => {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/music/soundtrack.mp3"),
      {
        isLooping: true,
        shouldPlay: true,
        volume: 0.4,
      },
    );

    soundtrack = sound;
    await soundtrack.playAsync();
  })().finally(() => {
    startPromise = null;
  });

  return startPromise;
}

export async function stopSoundtrack() {
  if (!soundtrack) return;

  try {
    const status = await soundtrack.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await soundtrack.stopAsync();
    }
  } finally {
    await soundtrack.unloadAsync();
    soundtrack = null;
  }
}
