/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { songsApi, singersApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';
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

// Highlight matching text
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} style={{ 
        background: 'rgba(233, 69, 96, 0.3)', 
        color: 'var(--accent-hover)',
        padding: '0 2px',
        borderRadius: '2px',
        fontWeight: 600,
      }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [songs, setSongs] = useState<any[]>([]);
  const [singers, setSingers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { play, setPlaylist, currentSong, isPlaying } = usePlayer();
  const [visibleSongs, setVisibleSongs] = useState(10);

  useEffect(() => {
    if (!q) {
      setSongs([]);
      setSingers([]);
      setVisibleSongs(10);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [songsRes, singersRes] = await Promise.all([
          songsApi.getAll(`search=${encodeURIComponent(q)}&limit=20`),
          singersApi.getAll(`search=${encodeURIComponent(q)}&limit=10`)
        ]);
        setSongs(songsRes.data || songsRes);
        setSingers(singersRes.data || singersRes);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    const handleListen = (e: any) => {
      const { songId } = e.detail;
      setSongs(prev => prev.map(s => s.id === songId ? { ...s, listenCount: (s.listenCount || 0) + 1 } : s));
    };

    window.addEventListener('song-listen', handleListen);
    return () => window.removeEventListener('song-listen', handleListen);
  }, [q]);

  if (!q) {
    return (
      <div className="fade-in">
        <section className="section" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <i className="bx bx-search" style={{ fontSize: 64, color: 'var(--text-muted)' }}></i>
            <h2 style={{ fontSize: 20, color: 'var(--text-secondary)', marginTop: 16 }}>
              Nhập từ khoá để tìm kiếm bài hát, nghệ sĩ...
            </h2>
            <div style={{ marginTop: 24 }}>
              <SearchBar />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '250px', height: '32px' }}></div>
          ) : (
            <h1 className="section-title">Kết quả: &quot;{q}&quot;</h1>
          )}
          <div style={{ width: 300 }}>
            <SearchBar />
          </div>
        </div>

        {/* Singers Results */}
        <div style={{ marginBottom: 40 }}>
          <div className="section-header">
            {loading ? (
              <div className="skeleton" style={{ width: '100px', height: '20px' }}></div>
            ) : (
              <h2 className="section-title" style={{ fontSize: 18 }}>Nghệ sĩ</h2>
            )}
          </div>
          <div className="songs-grid"> 
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="song-card" style={{ background: 'none', border: 'none' }}>
                  <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-lg)' }}></div>
                  <div className="skeleton" style={{ width: '60%', height: '14px', marginTop: '12px', marginInline: 'auto' }}></div>
                </div>
              ))
            ) : (
              singers?.length > 0 ? (
                singers.map((s) => (
                  <Link key={s.id} href={`/singer/${s.id}`} className="song-card" style={{ background: 'none', border: 'none' }}>
                    <div className="song-card-image" style={{ borderRadius: 'var(--radius-lg)', aspectRatio: '1/1', width: '100%' }}>
                      {s.avatar ? (
                        <img src={s.avatar} alt={s.fullName} style={{ borderRadius: 'var(--radius-lg)', width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}>
                          <i className="bx bxs-user" style={{ fontSize: 40, color: 'var(--text-muted)' }}></i>
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        padding: '10px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'center',
                        opacity: 0,
                        transition: 'var(--transition)'
                      }} className="singer-name-overlay">
                        {s.fullName}
                      </div>
                    </div>
                    <style jsx>{`
                      .song-card:hover .singer-name-overlay {
                        opacity: 1;
                      }
                    `}</style>
                  </Link>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Không tìm thấy nghệ sĩ nào.</div>
              )
            )}
          </div>
        </div>

        {/* Songs Results */}
        <div>
          <div className="section-header">
            {loading ? (
              <div className="skeleton" style={{ width: '100px', height: '20px' }}></div>
            ) : (
              <h2 className="section-title" style={{ fontSize: 18 }}>Bài hát</h2>
            )}
          </div>
          <div className="song-list">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="song-list-item">
                  <div className="skeleton" style={{ width: '30px', height: '20px' }}></div>
                  <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)' }}></div>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '8px' }}></div>
                    <div className="skeleton" style={{ width: '20%', height: '12px' }}></div>
                  </div>
                  <div className="skeleton" style={{ width: '60px', height: '16px' }}></div>
                </div>
              ))
            ) : (
              songs?.length > 0 ? (
                songs.slice(0, visibleSongs).map((song: any, i: number) => {
                  const isActive = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      className="song-list-item"
                      onClick={() => {
                        setPlaylist(songs);
                        play(song);
                      }}
                      style={{ 
                        background: isActive ? 'rgba(233, 69, 96, 0.1)' : 'transparent',
                        paddingLeft: '16px',
                      }}
                    >
                      <div className="song-list-rank" style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>
                         {isActive && isPlaying ? <i className="bx bx-equalizer bx-tada" style={{ color: 'var(--accent)' }}></i> : i + 1}
                      </div>
                      <div className="song-list-img">
                        {song.avatar ? <img src={song.avatar} alt={song.title} loading="lazy" /> : <i className="bx bxs-music"></i>}
                      </div>
                      <div className="song-list-info">
                        <div className="song-list-title" style={{ color: isActive ? 'var(--accent)' : 'inherit', fontWeight: isActive ? '700' : '500' }}>
                          {highlightText(song.title, q)}
                        </div>
                        <div className="song-list-artist">
                          <Link href={`/singer/${song.singer?.id}`} onClick={(e) => e.stopPropagation()}>
                            {highlightText(song.singer?.fullName || 'Unknown', q)}
                          </Link>
                        </div>
                      </div>
                      <div className="song-list-stats">
                        ▶ {formatListens(song.listenCount || 0)}
                      </div>
                      <div className="song-list-duration">
                        {formatDuration(song.duration)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--text-secondary)', padding: 20 }}>
                  Không tìm thấy bài hát nào phù hợp.
                </div>
              )
            )}
          </div>
          {songs.length > visibleSongs && !loading && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                className="btn btn-outline"
                onClick={() => setVisibleSongs(prev => prev + 10)}
                style={{ minWidth: '120px' }}
              >
                Tải thêm
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Wrapper with Suspense for useSearchParams hook
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="loading"><div className="spinner"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}
