/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { songsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';

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

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '320px', height: '32px' }}></div>
          ) : (
            <h1 className="section-title">Bảng xếp hạng Trending</h1>
          )}
        </div>
        <div className="song-list">
          {loading ? (
            [...Array(12)].map((_, i) => (
              <div key={i} className="song-list-item">
                <div className="skeleton" style={{ width: '30px', height: '20px' }}></div>
                <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)' }}></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '20%', height: '12px' }}></div>
                </div>
                <div className="skeleton" style={{ width: '60px', height: '16px' }}></div>
              </div>
            ))
          ) : (
            songs.map((song: any, i: number) => {
              const isActive = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className="song-list-item"
                  onClick={() => { 
                    setPlaylist(songs); 
                    play(song); 
                  }}
                  style={{ 
                    background: isActive ? 'rgba(233, 69, 96, 0.1)' : 'transparent',
                    paddingLeft: '16px',
                  }}
                >
                  <div className={`song-list-rank ${i < 3 ? 'top-3' : ''}`} style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>
                    {isActive && isPlaying ? <i className="bx bx-equalizer bx-tada" style={{ color: 'var(--accent)' }}></i> : i + 1}
                  </div>
                  <div className="song-list-img">
                    {song.avatar ? <img src={song.avatar} alt="" loading="lazy" /> : <i className="bx bxs-music"></i>}
                  </div>
                  <div className="song-list-info">
                    <div className="song-list-title" style={{ color: isActive ? 'var(--accent)' : 'inherit', fontWeight: isActive ? '700' : '500' }}>
                      {song.title}
                    </div>
                    <div className="song-list-artist">
                      <Link href={`/singer/${song.singer?.id}`} onClick={(e) => e.stopPropagation()}>
                        {song.singer?.fullName || 'Unknown'}
                      </Link>
                    </div>
                  </div>
                  <div className="song-list-stats">▶ {formatListens(song.listenCount)}</div>
                  <div className="song-list-duration">{formatDuration(song.duration)}</div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
