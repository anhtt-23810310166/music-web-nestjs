/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { topicsApi } from '@/lib/api';
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

export default function TopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist, currentSong, isPlaying } = usePlayer();

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

      <div className="song-list">
        {songs.map((song: any, i: number) => {
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
    </div>
  );
}
