/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { playlistsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { play, currentSong, isPlaying, setPlaylist: setPlayerPlaylist } = usePlayer();

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
        {/* Header Skeleton vs Real */}
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

        {/* Song list Skeleton vs Real */}
        <div className="song-list">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="song-list-item">
                <div className="skeleton" style={{ width: '30px', height: '20px' }}></div>
                <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)' }}></div>
                <div style={{ flex: 1 }}><div className="skeleton" style={{ width: '40%', height: '16px' }}></div></div>
                <div className="skeleton" style={{ width: '60px', height: '16px' }}></div>
              </div>
            ))
          ) : songs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', width: '100%' }}>
              <i className="bx bx-music" style={{ fontSize: 40, color: 'var(--text-muted)' }}></i>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 12 }}>Playlist chưa có bài hát nào.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Thêm bài hát từ trang chủ hoặc khám phá.</p>
            </div>
          ) : (
            songs.map((song: any, i: number) => {
              const isActive = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => { setPlayerPlaylist(songs); play(song); }}
                  className="song-list-item"
                  style={{
                    background: isActive ? 'rgba(233, 69, 96, 0.1)' : 'transparent',
                    paddingLeft: '16px',
                  }}
                >
                  <span style={{ width: 30, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {isActive && isPlaying ? <i className="bx bx-equalizer bx-tada" style={{ color: 'var(--accent)' }}></i> : i + 1}
                  </span>
                  <div className="song-list-img">
                    {song.avatar ? (
                      <img src={song.avatar} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <i className="bx bxs-music" style={{ color: 'var(--text-muted)' }}></i>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600, fontSize: 14,
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {song.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      <Link href={`/singer/${song.singer?.id}`} onClick={(e) => e.stopPropagation()}>
                        {song.singer?.fullName || 'Unknown'}
                      </Link>
                    </div>
                  </div>
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
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
