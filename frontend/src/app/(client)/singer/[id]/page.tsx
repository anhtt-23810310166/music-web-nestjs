/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { singersApi, songsApi } from '@/lib/api';
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

export default function SingerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [singer, setSinger] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist, currentSong, isPlaying } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [singerData, songsData] = await Promise.all([
          singersApi.getById(id),
          songsApi.getBySinger(id),
        ]);
        setSinger(singerData);
        setSongs(songsData?.data || (Array.isArray(songsData) ? songsData : []));
      } catch (err) {
        console.error('Error fetching singer details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (!loading && !singer) return <div className="loading">Không tìm thấy ca sĩ</div>;

  return (
    <div className="fade-in">
      {/* Banner Skeleton vs Real Data */}
      <div className="hero-banner" style={{ marginBottom: 32, padding: '40px', display: 'flex', gap: '32px', alignItems: 'center' }}>
        {loading ? (
          <>
            <div className="skeleton" style={{ width: '180px', height: '180px', borderRadius: 'var(--radius-xl)', flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '250px', height: '40px', marginBottom: '16px' }}></div>
              <div className="skeleton" style={{ width: '80%', height: '20px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '24px' }}></div>
              <div className="skeleton" style={{ width: '150px', height: '45px', borderRadius: 'var(--radius-full)' }}></div>
            </div>
          </>
        ) : (
          <>
            <div style={{ 
              width: '180px', height: '180px', borderRadius: 'var(--radius-xl)', 
              overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              {singer.avatar ? (
                <img src={singer.avatar} alt={singer.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bx bxs-user" style={{ fontSize: '72px', color: 'var(--text-muted)' }}></i>
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
                  Phát tất cả
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '200px', height: '28px' }}></div>
          ) : (
            <h2 className="section-title">Danh sách bài hát</h2>
          )}
        </div>
        
        <div className="song-list">
          {loading ? (
            // List Skeleton
            [...Array(8)].map((_, i) => (
              <div key={i} className="song-list-item" style={{ pointerEvents: 'none' }}>
                <div className="skeleton" style={{ width: '30px', height: '20px' }}></div>
                <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)' }}></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '20%', height: '12px' }}></div>
                </div>
                <div className="skeleton" style={{ width: '60px', height: '16px' }}></div>
                <div className="skeleton" style={{ width: '45px', height: '16px' }}></div>
              </div>
            ))
          ) : (
            songs.map((song: any, i: number) => {
              const isActive = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className="song-list-item"
                  onClick={() => { setPlaylist(songs); play(song); }}
                  style={{ 
                    background: isActive ? 'rgba(233, 69, 96, 0.1)' : 'transparent',
                    paddingLeft: '16px',
                    boxShadow: isActive ? 'inset 0 0 10px rgba(233, 69, 96, 0.05)' : 'none'
                  }}
                >
                  <div className={`song-list-rank ${i < 3 ? 'top-3' : ''}`} style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>
                    {isActive && isPlaying ? <i className="bx bx-equalizer bx-tada" style={{ color: 'var(--accent)' }}></i> : i + 1}
                  </div>
                  <div className="song-list-img">
                    {song.avatar ? <img src={song.avatar} alt={song.title} loading="lazy" /> : <i className="bx bxs-music"></i>}
                  </div>
                  <div className="song-list-info">
                    <div className="song-list-title" style={{ color: isActive ? 'var(--accent)' : 'inherit', fontWeight: isActive ? '700' : '500' }}>
                      {song.title}
                    </div>
                    <div className="song-list-artist">{singer.fullName}</div>
                  </div>
                  <div className="song-list-stats">▶ {formatListens(song.listenCount || 0)}</div>
                  <div className="song-list-duration">{formatDuration(song.duration)}</div>
                </div>
              );
            })
          )}
        </div>

        {!loading && songs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Chưa có bài hát nào từ nghệ sĩ này.
          </div>
        )}
      </section>
    </div>
  );
}
