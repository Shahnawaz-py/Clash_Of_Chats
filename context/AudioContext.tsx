"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { sfx } from '@/lib/sfx';
import { tapSoundEngine } from '@/lib/tapSound';

interface AudioContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
  volume: number;
  setVolume: (vol: number) => void;

  isSfxEnabled: boolean;
  toggleSfx: () => void;
  sfxVolume: number;
  setSfxVolume: (vol: number) => void;
  playTapSound: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: true,
  toggleMusic: () => { },
  volume: 0.55,
  setVolume: () => { },

  isSfxEnabled: true,
  toggleSfx: () => { },
  sfxVolume: 0.55,
  setSfxVolume: () => { },
  playTapSound: () => { },
});

const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[onclick]',
  '.clickable',
  '.cursor-pointer',
  '.coc-btn',
  '[data-clickable]',
].join(', ');

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSfxEnabled, setIsSfxEnabled] = useState<boolean>(true);
  const [sfxVolume, setSfxVolumeState] = useState<number>(0.55);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preload CoC tap sound file (/audio/clash_clans_pop.mp3) on app launch
    tapSoundEngine.preload();

    // Sync SFX state from localStorage
    const savedSfxPref = localStorage.getItem('coc_sfx_enabled');
    const sfxEnabled = savedSfxPref === null ? true : savedSfxPref === 'true';
    setIsSfxEnabled(sfxEnabled);
    tapSoundEngine.setMuted(!sfxEnabled);
    sfx.setMuted(!sfxEnabled);

    const savedSfxVol = localStorage.getItem('coc_sfx_volume');
    if (savedSfxVol) {
      const vol = parseFloat(savedSfxVol);
      if (!isNaN(vol)) {
        setSfxVolumeState(vol);
        tapSoundEngine.setVolume(vol);
      }
    }

    // Unlock audio context on user interaction
    const handleUserInteraction = () => {
      tapSoundEngine.unlockAudio();
    };

    // Global Event Delegation Listener for Tap Sound
    const handleGlobalTap = (e: PointerEvent | MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest(INTERACTIVE_SELECTOR);
      if (clickable) {
        if (clickable.hasAttribute('disabled') || clickable.getAttribute('aria-disabled') === 'true') {
          return;
        }
        tapSoundEngine.play();
      }
    };

    window.addEventListener('pointerdown', handleGlobalTap, { capture: true, passive: true });
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleGlobalTap, { capture: true });
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const toggleSfx = () => {
    const nextState = !isSfxEnabled;
    setIsSfxEnabled(nextState);
    tapSoundEngine.setMuted(!nextState);
    sfx.setMuted(!nextState);
    if (nextState) {
      tapSoundEngine.play();
    }
  };

  const setSfxVolume = (vol: number) => {
    setSfxVolumeState(vol);
    tapSoundEngine.setVolume(vol);
  };

  const playTapSound = () => {
    tapSoundEngine.play();
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying: isSfxEnabled,
        toggleMusic: toggleSfx,
        volume: sfxVolume,
        setVolume: setSfxVolume,
        isSfxEnabled,
        toggleSfx,
        sfxVolume,
        setSfxVolume,
        playTapSound,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);

export function useSoundEffect() {
  const { isSfxEnabled, toggleSfx, sfxVolume, setSfxVolume, playTapSound } = useAudio();

  return {
    playTap: playTapSound,
    isSfxEnabled,
    toggleSfx,
    sfxVolume,
    setSfxVolume,
    playSuccess: () => sfx.playSuccess(),
    playError: () => sfx.playError(),
    playWarHorn: () => sfx.playWarHorn(),
    playClanReward: () => sfx.playClanReward(),
  };
}
