/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { songsApi } from '@/lib/api';

type Song = {
  id: string;
  title: string;
  audio: string;
  avatar?: string;
  singer?: { fullName: string };
  duration?: number;
};

type RepeatMode = 'off' | 'all' | 'one';

type PlayerContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  repeat: RepeatMode;
  shuffle: boolean;
  play: (song: Song) => void;
  toggle: () => void;
  seek: (percent: number) => void;
  setVolume: (vol: number) => void;
  playlist: Song[];
  setPlaylist: (songs: Song[]) => void;
  next: () => void;
  prev: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [shuffle, setShuffle] = useState(false);

  // Refs to access latest state in event listeners
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);
  const playlistRef = useRef(playlist);
  const currentSongRef = useRef(currentSong);
  const lastCountedIdRef = useRef<string | null>(null);

  useEffect(() => { repeatRef.current = repeat; }, [repeat]);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);
  useEffect(() => { playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  const playInternal = useCallback((song: Song) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    setCurrentSong(song);
    audio.src = song.audio;
    audio.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.8;

    const audio = audioRef.current;
    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime);

      // Increment listen count after 2 seconds of playback
      const cs = currentSongRef.current;
      if (cs && audio.currentTime > 2 && lastCountedIdRef.current !== cs.id) {
        lastCountedIdRef.current = cs.id;
        songsApi.listen(cs.id).catch(() => {});
        // Dispatch event to update UI in other components
        window.dispatchEvent(new CustomEvent('song-listen', { detail: { songId: cs.id } }));
      }
    });
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    audio.addEventListener('ended', () => {
      const r = repeatRef.current;
      const s = shuffleRef.current;
      const pl = playlistRef.current;
      const cs = currentSongRef.current;

      if (r === 'one') {
        // Repeat current song
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      if (pl.length > 0 && cs) {
        const idx = pl.findIndex((song) => song.id === cs.id);

        if (s) {
          // Shuffle — pick random song (not the same)
          const others = pl.filter((_, i) => i !== idx);
          if (others.length > 0) {
            const randomSong = others[Math.floor(Math.random() * others.length)];
            playInternal(randomSong);
          }
          return;
        }

        if (idx < pl.length - 1) {
          playInternal(pl[idx + 1]);
        } else if (r === 'all') {
          // Loop back to first song
          playInternal(pl[0]);
        } else {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback(
    (song: Song) => {
      if (!audioRef.current) return;
      const audio = audioRef.current;
      if (currentSong?.id === song.id && !audio.paused) {
        audio.pause();
        setIsPlaying(false);
        return;
      }
      playInternal(song);
    },
    [currentSong, playInternal],
  );

  const toggle = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentSong]);

  const seek = useCallback((percent: number) => {
    if (!audioRef.current) return;
    if (!isFinite(audioRef.current.duration) || audioRef.current.duration === 0) return;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol;
    setVolumeState(vol);
  }, []);

  const next = useCallback(() => {
    if (!currentSong || playlist.length === 0) return;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);

    if (shuffle) {
      const others = playlist.filter((_, i) => i !== idx);
      if (others.length > 0) {
        playInternal(others[Math.floor(Math.random() * others.length)]);
      }
      return;
    }

    if (idx < playlist.length - 1) {
      playInternal(playlist[idx + 1]);
    } else if (repeat === 'all') {
      playInternal(playlist[0]);
    }
  }, [currentSong, playlist, playInternal, shuffle, repeat]);

  const prev = useCallback(() => {
    if (!currentSong || playlist.length === 0) return;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    if (idx > 0) {
      playInternal(playlist[idx - 1]);
    } else if (repeat === 'all') {
      playInternal(playlist[playlist.length - 1]);
    }
  }, [currentSong, playlist, playInternal, repeat]);

  const toggleRepeat = useCallback(() => {
    setRepeat((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        repeat,
        shuffle,
        play,
        toggle,
        seek,
        setVolume,
        playlist,
        setPlaylist,
        next,
        prev,
        toggleRepeat,
        toggleShuffle,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
