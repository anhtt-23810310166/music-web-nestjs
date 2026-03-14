/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { topicsApi, songsApi } from '@/lib/api';
import Link from 'next/link';
import SongList from '@/components/SongList';

export default function ExplorePage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [topSongs, setTopSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cats, top] = await Promise.all([
          topicsApi.getAll(),
          songsApi.getTop(1, 50),
        ]);
        setTopics(cats);
        setTopSongs(top?.data || (Array.isArray(top) ? top : []));
      } catch (e) {
        console.error('Explore error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();

    const handleListen = (e: any) => {
      const { songId } = e.detail;
      setTopSongs(prev => prev.map(s => s.id === songId ? { ...s, listenCount: (s.listenCount || 0) + 1 } : s));
    };

    window.addEventListener('song-listen', handleListen);
    return () => window.removeEventListener('song-listen', handleListen);
  }, []);

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '250px', height: '32px' }}></div>
          ) : (
            <h1 className="section-title">Khám phá thể loại</h1>
          )}
        </div>
        <div className="topics-grid">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }}></div>
            ))
          ) : (
            topics.map((t: any) => (
              <Link href={`/topic/${t.slug}`} key={t.id}>
                <div className="topic-card">
                  <div className="topic-card-title">{t.title}</div>
                  <div className="topic-card-count">{t._count?.songs || 0} bài hát</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '280px', height: '28px' }}></div>
          ) : (
            <h2 className="section-title">Tất cả bài hát phổ biến</h2>
          )}
        </div>
        <SongList songs={topSongs} loading={loading} />
      </section>
    </div>
  );
}
