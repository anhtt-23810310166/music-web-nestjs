/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { topicsApi, songsApi } from '@/lib/api';
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

export default function ExplorePage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist, currentSong, isPlaying } = usePlayer();

  useEffect(() => {
    async function load() {
      try {
        const [cats, top] = await Promise.all([
          topicsApi.getAll(),
          songsApi.getTop(1, 20),
        ]);
        setTopics(cats);
        // Handle paginated response: top.data
        setTopSongs(top?.data || (Array.isArray(top) ? top : []));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();

    const handleListen = (e: any) => {
      const { songId } = e.detail;
      setTopSongs(prev => prev.map(s => s.id === songId ? { ...s, listenCount: (s.listenCount || 0) + 1 } : s));
    };

    window.addEventListener('song-listen', handleListen);
    return () => window.removeEventListener('song-listen', handleListen);
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header">
          <h1 className="section-title">Khám phá thể loại</h1>
        </div>
        <div className="topics-grid">
          {topics.map((t: any) => (
            <Link href={`/topic/${t.slug}`} key={t.id}>
              <div className="topic-card">
                <div className="topic-card-title">{t.title}</div>
                <div className="topic-card-count">{t._count?.songs || 0} bài hát</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Tất cả bài hát phổ biến</h2>
        </div>
        <div className="song-list">
          {topSongs.map((song: any, i: number) => {
            const isActive = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className="song-list-item"
                onClick={() => {
                  setPlaylist(topSongs);
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
                  {song.avatar ? <img src={song.avatar} alt="" /> : <i className="bx bxs-music"></i>}
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
                <div className="song-list-stats">
                  ▶ {formatListens(song.listenCount)}
                </div>
                <div className="song-list-duration">
                  {formatDuration(song.duration)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
