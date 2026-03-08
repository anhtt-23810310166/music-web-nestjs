/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { playlistsApi } from '@/lib/api';
import Link from 'next/link';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    setLoggedIn(true);
    const fetchData = async () => {
      try {
        const data = await playlistsApi.getAll(token);
        setPlaylists(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const token = getToken();
      const pl = await playlistsApi.create({ title: newTitle.trim() }, token);
      setPlaylists((prev) => [pl, ...prev]);
      setNewTitle('');
      setShowCreate(false);
    } catch { /* ignore */ }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá playlist này?')) return;
    try {
      const token = getToken();
      await playlistsApi.remove(id, token);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xoá playlist');
    }
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
            Đăng nhập để quản lý playlist cá nhân và nghe nhạc theo danh sách của bạn.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/login"><button className="btn btn-primary" style={{ padding: '10px 28px', fontSize: 14, fontWeight: 600 }}>Đăng nhập</button></Link>
            <Link href="/register"><button className="btn btn-outline" style={{ padding: '10px 28px', fontSize: 14, fontWeight: 600 }}>Đăng ký</button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {loading ? (
            <div className="skeleton" style={{ width: '200px', height: '32px' }}></div>
          ) : (
            <>
              <h1 className="section-title">Playlist của bạn</h1>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreate(true)}
                style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <i className="bx bx-plus"></i> Tạo playlist
              </button>
            </>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="playlist-create-form" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24,
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tên playlist..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              style={{
                flex: 1, padding: '10px 14px', fontSize: 14,
                background: 'var(--bg-input)', color: 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none',
              }}
            />
            <button className="btn btn-primary" onClick={handleCreate} disabled={creating}
              style={{ padding: '10px 20px', fontSize: 13, whiteSpace: 'nowrap' }}>
              {creating ? 'Đang tạo...' : 'Tạo'}
            </button>
            <button className="btn btn-outline" onClick={() => { setShowCreate(false); setNewTitle(''); }}
              style={{ padding: '10px 20px', fontSize: 13, whiteSpace: 'nowrap' }}>
              Huỷ
            </button>
          </div>
        )}

        <div className="songs-grid"> 
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="song-card" style={{ background: 'none', border: 'none' }}>
                <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-lg)' }}></div>
                <div className="skeleton" style={{ width: '70%', height: '16px', marginTop: '12px', marginInline: 'auto' }}></div>
              </div>
            ))
          ) : playlists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', width: '100%', gridColumn: '1 / -1' }}>
              <i className="bx bx-list-ul" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }}></i>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Chưa có playlist nào.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Bấm "Tạo playlist" để bắt đầu!</p>
            </div>
          ) : (
            playlists.map((pl) => (
              <div key={pl.id} className="song-card">
                <div className="song-card-image" style={{ borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--accent), #6b46c1)' }}>
                  <Link href={`/playlists/${pl.id}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bx bx-music" style={{ fontSize: 48, color: 'rgba(255,255,255,0.5)' }}></i>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(pl.id);
                    }}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', zIndex: 10,
                    }}
                    title="Xoá playlist"
                  >
                    <i className="bx bx-trash" style={{ fontSize: 16 }}></i>
                  </button>
                </div>
                <div className="song-card-info" style={{ textAlign: 'center' }}>
                  <Link href={`/playlists/${pl.id}`}>
                    <div className="song-card-title">{pl.title}</div>
                  </Link>
                  <div className="song-card-artist">
                    {pl.songs?.length || pl._count?.songs || 0} bài hát
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
