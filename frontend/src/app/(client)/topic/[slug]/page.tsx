/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { topicsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';

function formatListens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function TopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist } = usePlayer();

  useEffect(() => {
    if (!slug) return;
    topicsApi.getBySlug(slug).then(setTopic).catch(console.error).finally(() => setLoading(false));

    const handleListen = (e: any) => {
      const { songId } = e.detail;
      setTopic((prev: any) => {
        if (!prev) return prev;
        const updatedSongs = prev.songs.map((s: any) => s.id === songId ? { ...s, listenCount: (s.listenCount || 0) + 1 } : s);
        return { ...prev, songs: updatedSongs };
      });
    };

    window.addEventListener('song-listen', handleListen);
    return () => window.removeEventListener('song-listen', handleListen);
  }, [slug]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!topic) return <div className="loading">Không tìm thấy thể loại</div>;

  const songs = topic.songs || [];

  return (
    <div className="fade-in">
      <div className="hero-banner" style={{ marginBottom: 24, padding: '32px 40px' }}>
        <h1 className="hero-title">{topic.title}</h1>
        <p className="hero-subtitle">{topic.description || `Khám phá nhạc ${topic.title}`}</p>
        {songs.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={() => { setPlaylist(songs); play(songs[0]); }}
          >
            ▶ Phát tất cả ({songs.length} bài)
          </button>
        )}
      </div>

      <div className="songs-grid">
        {songs.map((song: any) => (
          <div
            key={song.id}
            className="song-card"
            onClick={() => { 
              setPlaylist(songs); 
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
    </div>
  );
}
