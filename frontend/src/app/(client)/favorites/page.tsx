/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { favoritesApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';

function getToken() { return localStorage.getItem('accessToken') || ''; }

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

export default function FavoritesPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const { play, currentSong, isPlaying, setPlaylist } = usePlayer();

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    setLoggedIn(true);
    const fetchData = async () => {
      try {
        const data = await favoritesApi.getAll(token);
        setSongs(data);
        setPlaylist(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleRemove = async (songId: string) => {
    const token = getToken();
    try {
      await favoritesApi.toggle(songId, token);
      setSongs((prev) => prev.filter((s) => s.id !== songId));
    } catch { /* ignore */ }
  };

  if (!loggedIn) {
    return (
      <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(229,62,62,0.2), rgba(229,62,62,0.05))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <i className="bx bx-lock-alt" style={{ fontSize: 36, color: '#e53e3e' }}></i>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Nội dung riêng tư</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Đăng nhập để xem danh sách bài hát yêu thích của bạn và đồng bộ trên mọi thiết bị.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/login">
              <button className="btn btn-primary" style={{ padding: '10px 28px', fontSize: 14, fontWeight: 600 }}>
                Đăng nhập
              </button>
            </Link>
            <Link href="/register">
              <button className="btn btn-outline" style={{ padding: '10px 28px', fontSize: 14, fontWeight: 600 }}>
                Đăng ký
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header">
          <h1 className="section-title">Bài hát yêu thích</h1>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{songs.length} bài hát</span>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : songs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="bx bx-heart" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }}></i>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Chưa có bài hát yêu thích nào.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Nhấn nút ❤️ trên player để thêm bài hát.</p>
          </div>
        ) : (
          <div className="song-list">
            {songs.map((song, i) => {
              const isActive = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className="song-list-item"
                  onClick={() => { setPlaylist(songs); play(song); }}
                  style={{ 
                    background: isActive ? 'rgba(233, 69, 96, 0.1)' : 'transparent',
                    paddingLeft: '16px',
                  }}
                >
                  <span className={`song-list-rank ${i < 3 ? 'top-3' : ''}`}>
                    {isActive && isPlaying ? <i className="bx bx-equalizer bx-tada" style={{ color: 'var(--accent)' }}></i> : i + 1}
                  </span>
                  <div className="song-list-img">
                    {song.avatar ? (
                      <img src={song.avatar} alt={song.title} />
                    ) : (
                      <i className="bx bxs-music"></i>
                    )}
                  </div>
                  <div className="song-list-info">
                    <div className="song-list-title" style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>
                      {song.title}
                    </div>
                    <div className="song-list-artist">
                      <Link href={`/singer/${song.singer?.id}`} onClick={(e) => e.stopPropagation()}>
                        {song.singer?.fullName || 'Unknown'}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="song-list-stats">
                    ▶ {formatListens(song.listenCount || 0)}
                  </div>
                  
                  <div className="song-list-duration">
                    <button
                      className="player-btn player-btn-fav"
                      onClick={(e) => { e.stopPropagation(); handleRemove(song.id); }}
                      title="Bỏ yêu thích"
                      style={{ fontSize: 18, color: '#e74c3c' }}
                    >
                      <i className="bx bxs-heart"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
