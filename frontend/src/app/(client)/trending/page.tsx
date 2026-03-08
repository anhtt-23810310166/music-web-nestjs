/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { songsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';

function formatListens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function formatDuration(s?: number): string {
  if (!s) return '--:--';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function TrendingPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist, currentSong, isPlaying } = usePlayer();

  useEffect(() => {
    songsApi.getTop(1, 20)
      .then(res => setSongs(res?.data || (Array.isArray(res) ? res : [])))
      .catch(console.error)
      .finally(() => setLoading(false));

    const handleListen = (e: any) => {
      const { songId } = e.detail;
      setSongs(prev => prev.map(s => s.id === songId ? { ...s, listenCount: (s.listenCount || 0) + 1 } : s));
    };

    window.addEventListener('song-listen', handleListen);
    return () => window.removeEventListener('song-listen', handleListen);
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header">
          <h1 className="section-title">Bảng xếp hạng Trending</h1>
        </div>
        <div className="song-list">
          {songs.map((song: any, i: number) => (
            <div
              key={song.id}
              className="song-list-item"
              onClick={() => { 
                setPlaylist(songs); 
                play(song); 
              }}
            >
              <div className={`song-list-rank ${i < 3 ? 'top-3' : ''}`}>{i + 1}</div>
              <div className="song-list-img">
                {song.avatar ? <img src={song.avatar} alt="" /> : ''}
              </div>
              <div className="song-list-info">
                <div className="song-list-title">
                  {currentSong?.id === song.id && isPlaying && ''}{song.title}
                </div>
                <div className="song-list-artist">{song.singer?.fullName || 'Unknown'}</div>
              </div>
              <div className="song-list-stats">▶ {formatListens(song.listenCount)}</div>
              <div className="song-list-duration">{formatDuration(song.duration)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
