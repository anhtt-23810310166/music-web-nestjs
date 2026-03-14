/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { favoritesApi } from '@/lib/api';
import SongList from '@/components/SongList';
import Link from 'next/link';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function FavoritesPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    setLoggedIn(true);
    const fetchData = async () => {
      try {
        const data = await favoritesApi.getAll(token);
        setSongs(data);
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

  if (!loggedIn && !loading) {
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
          {loading ? (
            <div className="skeleton" style={{ width: '220px', height: '32px' }}></div>
          ) : (
            <>
              <h1 className="section-title">Bài hát yêu thích</h1>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{songs.length} bài hát</span>
            </>
          )}
        </div>

        {songs.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', width: '100%' }}>
            <i className="bx bx-heart" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }}></i>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Chưa có bài hát yêu thích nào.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Nhấn nút ❤️ trên player để thêm bài hát.</p>
          </div>
        ) : (
          <SongList 
            songs={songs} 
            loading={loading} 
            renderActions={(song) => (
              <button
                className="player-btn player-btn-fav"
                onClick={(e) => { e.stopPropagation(); handleRemove(song.id); }}
                title="Bỏ yêu thích"
                style={{ fontSize: 18, color: '#e74c3c' }}
              >
                <i className="bx bxs-heart"></i>
              </button>
            )}
          />
        )}
      </section>
    </div>
  );
}
