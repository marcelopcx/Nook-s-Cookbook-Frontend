import React, { createContext, useContext, useMemo, useState } from "react";

import {
  setMusicEnabled as setMusicEnabledService,
  setSfxEnabled as setSfxEnabledService,
} from "@/services/soundtrack";

type AudioSettingsContextValue = {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  sfxEnabled: boolean;
  setSfxEnabled: (enabled: boolean) => void;
};

const AudioSettingsContext = createContext<AudioSettingsContextValue | null>(
  null,
);

export function AudioSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [musicEnabled, setMusicEnabledState] = useState(true);
  const [sfxEnabled, setSfxEnabledState] = useState(true);

  const setMusicEnabled = (enabled: boolean) => {
    setMusicEnabledService(enabled);
    setMusicEnabledState(enabled);
  };

  const setSfxEnabled = (enabled: boolean) => {
    setSfxEnabledService(enabled);
    setSfxEnabledState(enabled);
  };

  const value = useMemo<AudioSettingsContextValue>(
    () => ({
      musicEnabled,
      setMusicEnabled,
      sfxEnabled,
      setSfxEnabled,
    }),
    [musicEnabled, sfxEnabled],
  );

  return (
    <AudioSettingsContext.Provider value={value}>
      {children}
    </AudioSettingsContext.Provider>
  );
}

export function useAudioSettings() {
  const ctx = useContext(AudioSettingsContext);
  if (!ctx) {
    throw new Error(
      "useAudioSettings must be used within an AudioSettingsProvider",
    );
  }
  return ctx;
}
