import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  playClickSound,
  playPopSound,
  playChimeSound,
  playCorrectSound,
  playBadgeUnlockSound,
  playSuccessWhistleSound,
  playPointsEarnedSound,
  playTryAgainSound,
  playSparkleSound,
  setGlobalSoundMuted,
  setGlobalVolume,
  getAudioContext,
} from '../utils/audio';
import { 
  getStoredSoundMuted, 
  saveStoredSoundMuted, 
  getStoredVolume, 
  saveStoredVolume 
} from '../utils/storage';

export interface SoundContextType {
  isMuted: boolean;
  toggleSound: () => void;
  setMuted: (muted: boolean) => void;
  volume: number; // 0 to 1
  setVolume: (volume: number) => void;
  // Specific sound triggers
  playClick: () => void;
  playPop: () => void;
  playChime: () => void;
  playCorrect: () => void;
  playBadgeUnlock: () => void;
  playSuccessWhistle: () => void;
  playPointsEarned: () => void;
  playTryAgain: () => void;
  playSparkle: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    return getStoredSoundMuted();
  });

  const [volume, setVolumeState] = useState<number>(() => {
    return getStoredVolume();
  });

  // Sync with global audio engine on mount & changes
  useEffect(() => {
    setGlobalSoundMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    setGlobalVolume(volume);
  }, [volume]);

  // Handle first user gesture to unlock Web Audio API if needed
  useEffect(() => {
    const unlockAudio = () => {
      getAudioContext();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted);
    setGlobalSoundMuted(muted);
    saveStoredSoundMuted(muted);
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    setGlobalVolume(clamped);
    saveStoredVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMutedState(false);
      setGlobalSoundMuted(false);
      saveStoredSoundMuted(false);
    }
  }, [isMuted]);

  const toggleSound = useCallback(() => {
    setIsMutedState((prev) => {
      const next = !prev;
      setGlobalSoundMuted(next);
      saveStoredSoundMuted(next);
      if (!next) {
        // Play gentle chime feedback upon unmuting
        setTimeout(() => playPopSound(), 50);
      }
      return next;
    });
  }, []);

  const playClick = useCallback(() => {
    playClickSound();
  }, []);

  const playPop = useCallback(() => {
    playPopSound();
  }, []);

  const playChime = useCallback(() => {
    playChimeSound();
  }, []);

  const playCorrect = useCallback(() => {
    playCorrectSound();
  }, []);

  const playBadgeUnlock = useCallback(() => {
    playBadgeUnlockSound();
  }, []);

  const playSuccessWhistle = useCallback(() => {
    playSuccessWhistleSound();
  }, []);

  const playPointsEarned = useCallback(() => {
    playPointsEarnedSound();
  }, []);

  const playTryAgain = useCallback(() => {
    playTryAgainSound();
  }, []);

  const playSparkle = useCallback(() => {
    playSparkleSound();
  }, []);

  const value = useMemo(
    () => ({
      isMuted,
      toggleSound,
      setMuted,
      volume,
      setVolume,
      playClick,
      playPop,
      playChime,
      playCorrect,
      playBadgeUnlock,
      playSuccessWhistle,
      playPointsEarned,
      playTryAgain,
      playSparkle,
    }),
    [
      isMuted,
      toggleSound,
      setMuted,
      volume,
      setVolume,
      playClick,
      playPop,
      playChime,
      playCorrect,
      playBadgeUnlock,
      playSuccessWhistle,
      playPointsEarned,
      playTryAgain,
      playSparkle,
    ]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

/**
 * Custom hook for accessing the global sound effects system anywhere in the app
 */
export function useSound(): SoundContextType {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
