/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { singersApi, songsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';

function formatListens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function SingerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [singer, setSinger] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [singerData, songsData] = await Promise.all([
          singersApi.getById(id),
          songsApi.getBySinger(id),
        ]);
        setSinger(singerData);
        // Correctly handle paginated response from songsApi.getBySinger
        setSongs(songsData?.data || (Array.isArray(songsData) ? songsData : []));
      } catch (err) {
        console.error('Error fetching singer details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!singer) return <div className="loading">Không tìm thấy ca sĩ</div>;

  return (
    <div className="fade-in">
      {/* Follow existing style from TopicPage */}
      <div className="hero-banner" style={{ marginBottom: 32, padding: '40px', display: 'flex', gap: '32px', alignItems: 'center' }}>
        <div style={{ 
          width: '160px', 
          height: '160px', 
          borderRadius: '50%', 
          overflow: 'hidden', 
          flexShrink: 0,
          border: '4px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          {singer.avatar ? (
            <img src={singer.avatar} alt={singer.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bx bxs-user" style={{ fontSize: '64px', color: 'var(--text-muted)' }}></i>
            </div>
          )}
        </div>
        <div>
          <h1 className="hero-title" style={{ marginBottom: '8px' }}>{singer.fullName}</h1>
          <p className="hero-subtitle" style={{ marginBottom: '24px', maxWidth: '600px' }}>
            {singer.description || `Khám phá các bài hát của ${singer.fullName}`}
          </p>
          {songs.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={() => { setPlaylist(songs); play(songs[0]); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="bx bx-play" style={{ fontSize: '20px' }}></i>
              Phát tất cả ({songs.length} bài)
            </button>
          )}
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Tất cả bài hát</h2>
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
                <div className="song-card-artist">{singer.fullName}</div>
                <div className="song-card-meta">
                  <span>▶ {formatListens(song.listenCount || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {songs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Chưa có bài hát nào từ ca sĩ này.
          </div>
        )}
      </section>
    </div>
  );
}
