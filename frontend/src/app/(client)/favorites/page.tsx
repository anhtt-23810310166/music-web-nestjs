/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { favoritesApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';

function getToken() { return localStorage.getItem('accessToken') || ''; }

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
            <a href="/login">
              <button className="btn btn-primary" style={{ padding: '10px 28px', fontSize: 14, fontWeight: 600 }}>
                Đăng nhập
              </button>
            </a>
            <a href="/register">
              <button className="btn btn-outline" style={{ padding: '10px 28px', fontSize: 14, fontWeight: 600 }}>
                Đăng ký
              </button>
            </a>
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
                  className={`song-item ${isActive ? 'song-item-active' : ''}`}
                  onClick={() => { setPlaylist(songs); play(song); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)' }}
                >
                  <span style={{ width: 30, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {isActive && isPlaying ? <i className="bx bx-equalizer bx-tada" style={{ color: 'var(--accent)' }}></i> : i + 1}
                  </span>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--gradient-card)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {song.avatar ? (
                      <img src={song.avatar} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bx bxs-music" style={{ color: 'var(--text-muted)' }}></i>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: isActive ? 'var(--accent)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {song.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {song.singer?.fullName || 'Unknown'}
                    </div>
                  </div>
                  <button
                    className="player-btn player-btn-fav"
                    onClick={(e) => { e.stopPropagation(); handleRemove(song.id); }}
                    title="Bỏ yêu thích"
                    style={{ fontSize: 18 }}
                  >
                    <i className="bx bxs-heart"></i>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
