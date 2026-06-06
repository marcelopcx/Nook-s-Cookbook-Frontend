import { Audio } from "expo-av";

import {
  LOGRO_CALABAZA,
  LOGRO_NINA_TRISTE,
} from "@/constants/achievements";

let musicEnabled = true;
let sfxEnabled = true;

let soundtrack: Audio.Sound | null = null;
let startPromise: Promise<void> | null = null;
let stopPromise: Promise<void> | null = null;

let pageTurnSfx: Audio.Sound | null = null;
let pageTurnPromise: Promise<void> | null = null;

async function ensureAudioMode() {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
}

export function setMusicEnabled(enabled: boolean) {
  musicEnabled = enabled;
}

export function setSfxEnabled(enabled: boolean) {
  sfxEnabled = enabled;
}

export async function startSoundtrack() {
  if (!musicEnabled) return;

  if (stopPromise) {
    await stopPromise;
  }

  if (soundtrack) {
    const status = await soundtrack.getStatusAsync();
    if (status.isLoaded) {
      if (!status.isLooping) {
        await soundtrack.setIsLoopingAsync(true);
      }
      await soundtrack.setVolumeAsync(0.4);
      if (!status.isPlaying) {
        await soundtrack.setPositionAsync(0);
        await soundtrack.playAsync();
      }
      return;
    }

    soundtrack = null;
  }

  if (startPromise) return startPromise;

  startPromise = (async () => {
    await ensureAudioMode();

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

export async function playPageTurnSfx() {
  if (!sfxEnabled) return;

  const targetVolume = 0.12;

  if (!pageTurnSfx) {
    if (pageTurnPromise) {
      await pageTurnPromise;
    } else {
      pageTurnPromise = (async () => {
        await ensureAudioMode();
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/music/page_turn.mp3"),
          {
            shouldPlay: false,
            volume: targetVolume,
          },
        );
        pageTurnSfx = sound;
      })().finally(() => {
        pageTurnPromise = null;
      });

      await pageTurnPromise;
    }
  }

  if (!pageTurnSfx) return;

  const status = await pageTurnSfx.getStatusAsync();
  if (!status.isLoaded) return;

  if (status.isPlaying) {
    await pageTurnSfx.stopAsync();
  }

  await pageTurnSfx.setPositionAsync(0);
  await pageTurnSfx.setVolumeAsync(targetVolume);
  await pageTurnSfx.playAsync();
}

export async function stopSoundtrack() {
  if (stopPromise) return stopPromise;
  if (!soundtrack) return;

  stopPromise = (async () => {
    try {
      const status = await soundtrack.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundtrack.stopAsync();
        }
        await soundtrack.setPositionAsync(0);
      }
    } finally {
      await soundtrack.unloadAsync();
      soundtrack = null;
    }
  })().finally(() => {
    stopPromise = null;
  });

  return stopPromise;
}

export async function unloadPageTurnSfx() {
  if (!pageTurnSfx) return;

  try {
    const status = await pageTurnSfx.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await pageTurnSfx.stopAsync();
    }
  } finally {
    await pageTurnSfx.unloadAsync();
    pageTurnSfx = null;
  }
}

const ACHIEVEMENT_UNLOCK_SOURCES = {
  default: require("../../assets/sfx/normal.mp3"),
  [LOGRO_CALABAZA]: require("../../assets/sfx/win.mp3"),
  [LOGRO_NINA_TRISTE]: require("../../assets/sfx/gay.mp3"),
} as const;

function achievementUnlockSource(achievementName: string) {
  if (achievementName === LOGRO_CALABAZA) {
    return ACHIEVEMENT_UNLOCK_SOURCES[LOGRO_CALABAZA];
  }

  if (achievementName === LOGRO_NINA_TRISTE) {
    return ACHIEVEMENT_UNLOCK_SOURCES[LOGRO_NINA_TRISTE];
  }

  return ACHIEVEMENT_UNLOCK_SOURCES.default;
}

export async function playAchievementUnlockSfx(achievementName: string) {
  await ensureAudioMode();

  const { sound } = await Audio.Sound.createAsync(
    achievementUnlockSource(achievementName),
    {
      shouldPlay: true,
      volume: 0.85,
    },
  );

  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      void sound.unloadAsync();
    }
  });
}
