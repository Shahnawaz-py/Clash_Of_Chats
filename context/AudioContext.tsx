"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { sfx } from '@/lib/sfx';

interface AudioContextType {
  isPlaying: boolean;
  toggleMusic: () => void;
  volume: number;
  setVolume: (vol: number) => void;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  toggleMusic: () => { },
  volume: 0.45,
  setVolume: () => { },
});

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.45);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userInteractedRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedPref = localStorage.getItem('coc_music_enabled');
    const shouldPlay = savedPref === null ? true : savedPref === 'true';

    // Create single global audio instance
    const audio = new Audio('/audio/bgm.mp3');
    audio.loop = true;
    audio.volume = 0.45;
    audioRef.current = audio;

    const attemptPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        sfx.setMuted(false);
      } catch {
        // Browser autoplay blocked until interaction
        setIsPlaying(false);
      }
    };

    if (shouldPlay) {
      attemptPlay();
    } else {
      audio.pause();
      audio.muted = true;
      sfx.setMuted(true);
    }

    const handleUserInteraction = (e: Event) => {
      // Prevent autoplay unlock listener from firing on volume toggle button clicks
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[aria-label*="Toggle Music"]')) return;

      if (!userInteractedRef.current && audioRef.current) {
        userInteractedRef.current = true;
        const currentPref = localStorage.getItem('coc_music_enabled');
        if (currentPref !== 'false' && audioRef.current.paused) {
          audioRef.current.muted = false;
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            sfx.setMuted(false);
          }).catch(() => { });
        }
      }
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    // Check if currently playing
    const currentlyPlaying = !audioRef.current.paused || isPlaying;

    if (currentlyPlaying) {
      // TURN OFF MUSIC & SFX
      audioRef.current.pause();
      audioRef.current.muted = true;
      setIsPlaying(false);
      sfx.setMuted(true);
      localStorage.setItem('coc_music_enabled', 'false');
    } else {
      // TURN ON MUSIC & SFX
      audioRef.current.muted = false;
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        sfx.setMuted(false);
        localStorage.setItem('coc_music_enabled', 'true');
        sfx.playClick();
      }).catch((err) => {
        console.error('[Audio Play Error]', err);
      });
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggleMusic, volume, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
