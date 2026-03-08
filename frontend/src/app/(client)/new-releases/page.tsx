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

export default function NewReleasesPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist } = usePlayer();

  useEffect(() => {
    songsApi.getNew(20).then(setSongs).catch(console.error).finally(() => setLoading(false));

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
          <h1 className="section-title">Mới phát hành</h1>
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
      </section>
    </div>
  );
}
