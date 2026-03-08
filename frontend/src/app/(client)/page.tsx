/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { songsApi, topicsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
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

export default function HomePage() {
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [topSongsPage, setTopSongsPage] = useState(1);
  const [topSongsHasMore, setTopSongsHasMore] = useState(false);
  const limit = 10;

  const [newSongs, setNewSongs] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { play, setPlaylist, currentSong, isPlaying } = usePlayer();

  useEffect(() => {
    async function load() {
      try {
        const [topData, fresh, cats] = await Promise.all([
          songsApi.getTop(1, limit),
          songsApi.getNew(12),
          topicsApi.getAll(),
        ]);
        
        if (topData && topData.data) {
          setTopSongs(topData.data);
          setTopSongsHasMore(topData.meta.page < topData.meta.totalPages);
        } else {
          setTopSongs(Array.isArray(topData) ? topData : []);
        }

        setNewSongs(fresh);
        setTopics(cats);
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const loadMoreTopSongs = async () => {
    if (loadingMore || !topSongsHasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = topSongsPage + 1;
      const res = await songsApi.getTop(nextPage, limit);
      if (res && res.data) {
        setTopSongs(prev => [...prev, ...res.data]);
        setTopSongsPage(nextPage);
        setTopSongsHasMore(res.meta.page < res.meta.totalPages);
      }
    } catch (e) {
      console.error('Failed to load more top songs', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePlaySong = (song: any, list?: any[]) => {
    if (list) setPlaylist(list);
    play(song);
  };

  useEffect(() => {
    const handleListen = (e: any) => {
      const { songId } = e.detail;
      const updateCount = (songs: any[]) =>
        songs.map((s) => (s.id === songId ? { ...s, listenCount: (s.listenCount || 0) + 1 } : s));

      setTopSongs((prev) => updateCount(prev));
      setNewSongs((prev) => updateCount(prev));
    };

    window.addEventListener('song-listen', handleListen);
    return () => window.removeEventListener('song-listen', handleListen);
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <div className="hero-banner">
        {loading ? (
          <>
            <div className="skeleton" style={{ width: '150px', height: '14px', marginBottom: '16px' }}></div>
            <div className="skeleton" style={{ width: '300px', height: '48px', marginBottom: '16px' }}></div>
            <div className="skeleton" style={{ width: '80%', height: '20px', marginBottom: '8px' }}></div>
            <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '24px' }}></div>
            <div className="skeleton" style={{ width: '180px', height: '45px', borderRadius: 'var(--radius-full)' }}></div>
          </>
        ) : (
          <>
            <div className="hero-tagline">Music Streaming Platform</div>
            <h1 className="hero-title">
              Khám phá âm nhạc
              <br />
              không giới hạn
            </h1>
            <p className="hero-subtitle">
              Hàng ngàn bài hát, playlist được cập nhật mỗi ngày. Nghe nhạc mọi lúc, mọi nơi.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (topSongs.length > 0) {
                  const randomIdx = Math.floor(Math.random() * topSongs.length);
                  handlePlaySong(topSongs[randomIdx], topSongs);
                }
              }}
            >
              ▶ Phát ngẫu nhiên
            </button>
          </>
        )}
      </div>

      {/* Topics/Genres */}
      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '150px', height: '24px' }}></div>
          ) : (
            <>
              <h2 className="section-title">Thể loại</h2>
              <Link href="/explore" className="section-link">Xem tất cả →</Link>
            </>
          )}
        </div>
        <div className="topics-grid">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }}></div>
            ))
          ) : (
            topics.map((topic: any) => (
              <Link href={`/topic/${topic.slug}`} key={topic.id}>
                <div className="topic-card">
                  <div className="topic-card-title">{topic.title}</div>
                  <div className="topic-card-count">
                    {topic._count?.songs || 0} bài hát
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Trending */}
      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '150px', height: '24px' }}></div>
          ) : (
            <>
              <h2 className="section-title">Trending</h2>
              <Link href="/trending" className="section-link">Xem tất cả →</Link>
            </>
          )}
        </div>
        <div className="song-list">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="song-list-item">
                <div className="skeleton" style={{ width: '30px', height: '20px' }}></div>
                <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)' }}></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '20%', height: '12px' }}></div>
                </div>
                <div className="skeleton" style={{ width: '60px', height: '16px' }}></div>
              </div>
            ))
          ) : (
            topSongs.map((song: any, i: number) => {
              const isActive = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className="song-list-item"
                  onClick={() => handlePlaySong(song, topSongs)}
                  style={{ 
                    background: isActive ? 'rgba(233, 69, 96, 0.1)' : 'transparent',
                    paddingLeft: '16px',
                  }}
                >
                  <div className={`song-list-rank ${i < 3 ? 'top-3' : ''}`} style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>
                    {isActive && isPlaying ? <i className="bx bx-equalizer bx-tada" style={{ color: 'var(--accent)' }}></i> : i + 1}
                  </div>
                  <div className="song-list-img">
                    {song.avatar ? <img src={song.avatar} alt="" loading="lazy" /> : <i className="bx bxs-music"></i>}
                  </div>
                  <div className="song-list-info">
                    <div className="song-list-title" style={{ color: isActive ? 'var(--accent)' : 'inherit', fontWeight: isActive ? '700' : '500' }}>
                      {song.title}
                    </div>
                    <div className="song-list-artist">
                      <Link href={`/singer/${song.singer?.id}`} onClick={(e) => e.stopPropagation()}>
                        {song.singer?.fullName || 'Unknown'}
                      </Link>
                    </div>
                  </div>
                  <div className="song-list-stats">
                    ▶ {formatListens(song.listenCount)}
                  </div>
                  <div className="song-list-duration">
                    {formatDuration(song.duration)}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {!loading && topSongsHasMore && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              className="btn btn-outline"
              onClick={loadMoreTopSongs}
              disabled={loadingMore}
              style={{ minWidth: '120px' }}
            >
              {loadingMore ? 'Đang tải...' : 'Tải thêm'}
            </button>
          </div>
        )}
      </section>

      {/* New Releases */}
      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '180px', height: '24px' }}></div>
          ) : (
            <>
              <h2 className="section-title">Mới phát hành</h2>
              <Link href="/new-releases" className="section-link">Xem tất cả →</Link>
            </>
          )}
        </div>
        <div className="song-list">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="song-list-item">
                <div className="skeleton" style={{ width: '30px', height: '20px' }}></div>
                <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)' }}></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ width: '20%', height: '12px' }}></div>
                </div>
                <div className="skeleton" style={{ width: '60px', height: '16px' }}></div>
              </div>
            ))
          ) : (
            newSongs.map((song: any, i: number) => {
              const isActive = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className="song-list-item"
                  onClick={() => handlePlaySong(song, newSongs)}
                  style={{ 
                    background: isActive ? 'rgba(233, 69, 96, 0.1)' : 'transparent',
                    paddingLeft: '16px',
                  }}
                >
                  <div className={`song-list-rank ${i < 3 ? 'top-3' : ''}`} style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>
                    {isActive && isPlaying ? <i className="bx bx-equalizer bx-tada" style={{ color: 'var(--accent)' }}></i> : i + 1}
                  </div>
                  <div className="song-list-img">
                    {song.avatar ? <img src={song.avatar} alt="" loading="lazy" /> : <i className="bx bxs-music"></i>}
                  </div>
                  <div className="song-list-info">
                    <div className="song-list-title" style={{ color: isActive ? 'var(--accent)' : 'inherit', fontWeight: isActive ? '700' : '500' }}>
                      {song.title}
                    </div>
                    <div className="song-list-artist">
                      <Link href={`/singer/${song.singer?.id}`} onClick={(e) => e.stopPropagation()}>
                        {song.singer?.fullName || 'Unknown'}
                      </Link>
                    </div>
                  </div>
                  <div className="song-list-stats">
                    ▶ {formatListens(song.listenCount)}
                  </div>
                  <div className="song-list-duration">
                    {formatDuration(song.duration)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
