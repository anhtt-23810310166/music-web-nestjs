/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { songsApi } from '@/lib/api';
import SongList from '@/components/SongList';

export default function NewReleasesPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 10;

  useEffect(() => {
    songsApi.getAll(`page=1&limit=${limit}`).then(res => {
      setSongs(res.data || []);
      setHasMore(res.meta?.page < res.meta?.totalPages);
    }).catch(console.error).finally(() => setLoading(false));

    const handleListen = (e: any) => {
      const { songId } = e.detail;
      setSongs(prev => prev.map(s => s.id === songId ? { ...s, listenCount: (s.listenCount || 0) + 1 } : s));
    };

    window.addEventListener('song-listen', handleListen);
    return () => window.removeEventListener('song-listen', handleListen);
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await songsApi.getAll(`page=${nextPage}&limit=${limit}`);
      if (res && res.data) {
        setSongs(prev => [...prev, ...res.data]);
        setPage(nextPage);
        setHasMore(res.meta.page < res.meta.totalPages);
      }
    } catch (e) {
      console.error('Failed to load more new songs', e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '200px', height: '32px' }}></div>
          ) : (
            <h1 className="section-title">Mới phát hành</h1>
          )}
        </div>
        <SongList 
          songs={songs} 
          loading={loading} 
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
      </section>
    </div>
  );
}
