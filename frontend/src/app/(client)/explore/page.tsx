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

export default function ExplorePage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist } = usePlayer();

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
        <div className="songs-grid">
          {topSongs.map((song: any) => (
            <div
              key={song.id}
              className="song-card"
              onClick={() => {
                setPlaylist(topSongs);
                play(song);
              }}
            >
              <div className="song-card-image">
                {song.avatar ? <img src={song.avatar} alt="" /> : ''}
                <div className="song-card-play">▶</div>
              </div>
              <div className="song-card-info">
                <div className="song-card-title">{song.title}</div>
                <div className="song-card-artist">{song.singer?.fullName || 'Unknown'}</div>
                <div className="song-card-meta">
                  <span>▶ {formatListens(song.listenCount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
