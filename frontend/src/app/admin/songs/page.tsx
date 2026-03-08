/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { songsApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

function getToken() { return localStorage.getItem('accessToken') || ''; }

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  useEffect(() => { fetchSongs(); }, []);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSongs = async () => {
    try { setLoading(true); const data = await songsApi.getAllAdmin(getToken(), 'limit=100'); setSongs(data.data || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá bài hát này?')) return;
    try { await songsApi.remove(id, getToken()); showToast('Đã xoá bài hát!'); fetchSongs(); }
    catch { showToast('Lỗi khi xoá.', 'error'); }
  };

  return (
    <div className="fade-in">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="section-header">
        <h1 className="section-title">Quản lý Bài hát</h1>
        <Link href="/admin/songs/create" className="btn btn-primary">
          <i className="bx bx-plus" style={{ marginRight: 6 }}></i>Thêm Bài hát
        </Link>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Bài hát</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Nghệ sĩ</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Chủ đề</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Thông số</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Trạng thái</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--gradient-card)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {song.avatar ? (
                          <Image src={song.avatar} alt={song.title} width={40} height={40} style={{ objectFit: 'cover' }} />
                        ) : (
                          <i className="bx bxs-music" style={{ fontSize: 18, color: 'var(--text-secondary)' }}></i>
                        )}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{song.title}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{song.singer?.fullName || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    {song.topic?.title ? (
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-secondary)', fontSize: 12 }}>{song.topic.title}</span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                      <span style={{ fontSize: 12 }}><i className="bx bx-play-circle" style={{ color: 'var(--accent)' }}></i> {(song.listenCount || 0).toLocaleString()}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{formatTime(song.duration)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, background: song.status === 'ACTIVE' ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)', color: song.status === 'ACTIVE' ? '#2ecc71' : '#e74c3c' }}>
                      {song.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <Link href={`/admin/songs/edit/${song.id}`} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 16 }}>
                        <i className="bx bx-edit-alt"></i>
                      </Link>
                      <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: 16, background: '#e74c3c' }} onClick={() => handleDelete(song.id)}>
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {songs.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có bài hát nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
