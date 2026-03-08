/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { songsApi, singersApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import { Suspense } from 'react';
import SearchBar from '@/components/SearchBar';

function formatListens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
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
  const { play, setPlaylist } = usePlayer();

  useEffect(() => {
    if (!q) {
      setSongs([]);
      setSingers([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [songsRes, singersRes] = await Promise.all([
          songsApi.getAll(`search=${encodeURIComponent(q)}&limit=20`),
          singersApi.getAll(`search=${encodeURIComponent(q)}&limit=10`)
        ]);
        setSongs(songsRes.data || songsRes); // Depend on exact API response format
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
          <h1 className="section-title">Kết quả tìm kiếm cho: &quot;{q}&quot;</h1>
          <div style={{ width: 300 }}>
            <SearchBar />
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <>
            {/* Singers Results */}
            {singers?.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 className="section-title" style={{ fontSize: 18, marginBottom: 16 }}>Nghệ sĩ</h2>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {singers.map((s) => (
                    <div key={s.id} style={{ 
                      width: 140, textAlign: 'center', 
                      background: 'var(--bg-card)', padding: 16, 
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                      cursor: 'pointer', transition: 'var(--transition)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}>
                      <div style={{
                        width: 100, height: 100, borderRadius: '50%',
                        margin: '0 auto 12px', overflow: 'hidden',
                        background: 'var(--gradient-card)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {s.avatar ? (
                          <img src={s.avatar} alt={s.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <i className="bx bxs-user" style={{ fontSize: 40, color: 'var(--text-muted)' }}></i>
                        )}
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {highlightText(s.fullName, q)}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Songs Results */}
            <div>
              <h2 className="section-title" style={{ fontSize: 18, marginBottom: 16 }}>Bài hát</h2>
              {songs?.length > 0 ? (
                <div className="songs-grid">
                  {songs.map((song: any) => (
                    <div
                      key={song.id}
                      className="song-card"
                      onClick={() => {
                        setPlaylist(songs);
                        play(song);
                      }}
                    >
                      <div className="song-card-image">
                        {song.avatar ? <img src={song.avatar} alt={song.title} /> : ''}
                        <div className="song-card-play">▶</div>
                      </div>
                      <div className="song-card-info">
                        <div className="song-card-title">{highlightText(song.title, q)}</div>
                        <div className="song-card-artist">{highlightText(song.singer?.fullName || 'Unknown', q)}</div>
                        <div className="song-card-meta">
                          <span>▶ {formatListens(song.listenCount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', padding: 20 }}>
                  Không tìm thấy bài hát nào phù hợp.
                </div>
              )}
            </div>
            
            {songs?.length === 0 && singers?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                Không tìm thấy kết quả nào. Hãy thử từ khoá khác.
              </div>
            )}
          </>
        )}
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
