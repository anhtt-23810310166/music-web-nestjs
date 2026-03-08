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
            Đăng nhập để quản lý playlist cá nhân và nghe nhạc theo danh sách của bạn.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a href="/login"><button className="btn btn-primary" style={{ padding: '10px 28px', fontSize: 14, fontWeight: 600 }}>Đăng nhập</button></a>
            <a href="/register"><button className="btn btn-outline" style={{ padding: '10px 28px', fontSize: 14, fontWeight: 600 }}>Đăng ký</button></a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="section-title">Playlist của bạn</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
            style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <i className="bx bx-plus"></i> Tạo playlist
          </button>
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

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : playlists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="bx bx-list-ul" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }}></i>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Chưa có playlist nào.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Bấm "Tạo playlist" để bắt đầu!</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {playlists.map((pl) => (
              <div key={pl.id} style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                overflow: 'hidden', transition: 'var(--transition)',
                border: '1px solid var(--border)', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ position: 'relative' }}>
                  <Link href={`/playlists/${pl.id}`} style={{ display: 'block' }}>
                    <div style={{
                      width: '100%', aspectRatio: '16/2',
                      background: 'linear-gradient(135deg, var(--accent), #6b46c1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="bx bx-music" style={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }}></i>
                    </div>
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
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(229,62,62,0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                  >
                    <i className="bx bx-trash" style={{ fontSize: 16 }}></i>
                  </button>
                </div>
                <Link href={`/playlists/${pl.id}`} style={{ textDecoration: 'none', color: 'inherit', padding: '14px 16px', flex: 1 }}>
                  <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{pl.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {pl.songs?.length || pl._count?.songs || 0} bài hát
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
