/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { playlistsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import SongList from '@/components/SongList';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist: setPlayerPlaylist } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) { router.push('/login'); return; }
      try {
        const data = await playlistsApi.getById(id, token);
        setPlaylist(data);
      } catch {
        router.push('/playlists');
      }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, router]);

  const handleRemoveSong = async (songId: string) => {
    const token = getToken();
    try {
      await playlistsApi.removeSong(id, songId, token);
      setPlaylist((prev: any) => ({
        ...prev,
        songs: prev.songs.filter((s: any) => s.id !== songId),
      }));
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    if (!confirm('Xoá playlist này?')) return;
    const token = getToken();
    try {
      await playlistsApi.remove(id, token);
      router.push('/playlists');
    } catch { /* ignore */ }
  };

  const playAll = () => {
    if (playlist?.songs?.length > 0) {
      setPlayerPlaylist(playlist.songs);
      play(playlist.songs[0]);
    }
  };

  if (!loading && !playlist) return null;

  const songs = playlist?.songs || [];

  return (
    <div className="fade-in">
      <section className="section">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32,
          padding: 24, background: 'linear-gradient(135deg, rgba(229,62,62,0.1), rgba(107,70,193,0.1))',
          borderRadius: 'var(--radius-lg)',
        }}>
          {loading ? (
            <>
              <div className="skeleton" style={{ width: 120, height: 120, borderRadius: 'var(--radius-md)' }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '80px', height: '14px', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ width: '60px', height: '14px' }}></div>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: 120, height: 120, borderRadius: 'var(--radius-md)', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), #6b46c1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="bx bx-music" style={{ fontSize: 48, color: 'rgba(255,255,255,0.6)' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Playlist</p>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{playlist.title}</h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{songs.length} bài hát</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  {songs.length > 0 && (
                    <button className="btn btn-primary" onClick={playAll}
                      style={{ padding: '10px 24px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="bx bx-play"></i> Phát tất cả
                    </button>
                  )}
                  <button className="btn btn-outline" onClick={handleDelete}
                    style={{ padding: '10px 24px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#e74c3c', borderColor: '#e74c3c' }}>
                    <i className="bx bx-trash"></i> Xoá
                  </button>
                  <button className="btn btn-outline" onClick={() => router.push('/playlists')}
                    style={{ padding: '10px 24px', fontSize: 13 }}>
                    <i className="bx bx-arrow-back"></i> Quay lại
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {songs.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', width: '100%' }}>
            <i className="bx bx-music" style={{ fontSize: 40, color: 'var(--text-muted)' }}></i>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 12 }}>Playlist chưa có bài hát nào.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Thêm bài hát từ trang chủ hoặc khám phá.</p>
          </div>
        ) : (
          <SongList 
            songs={songs} 
            loading={loading} 
            renderActions={(song) => (
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveSong(song.id); }}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 16, padding: 6,
                }}
                title="Xoá khỏi playlist"
              >
                <i className="bx bx-x"></i>
              </button>
            )}
          />
        )}
      </section>
    </div>
  );
}
