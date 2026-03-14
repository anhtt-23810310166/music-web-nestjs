/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { songsApi, topicsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';
import SongList from '@/components/SongList';

export default function HomePage() {
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [topSongsPage, setTopSongsPage] = useState(1);
  const [topSongsHasMore, setTopSongsHasMore] = useState(false);
  const limit = 10;

  const [newSongs, setNewSongs] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { play, setPlaylist } = usePlayer();

  useEffect(() => {
    async function load() {
      try {
        const [topData, fresh, cats] = await Promise.all([
          songsApi.getTop(1, limit),
          songsApi.getNew(50), // Fetch more for new songs to support load more
          topicsApi.getAll(),
        ]);
        
        if (topData && topData.data) {
          setTopSongs(topData.data);
          setTopSongsHasMore(topData.meta.page < topData.meta.totalPages);
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
                  setPlaylist(topSongs);
                  play(topSongs[randomIdx]);
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
        <SongList 
          songs={topSongs} 
          loading={loading} 
          onLoadMore={loadMoreTopSongs} 
          hasMore={topSongsHasMore} 
          loadingMore={loadingMore} 
        />
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
        <SongList songs={newSongs} loading={loading} />
      </section>
    </div>
  );
}
