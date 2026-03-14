/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { topicsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import SongList from '@/components/SongList';

export default function TopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist } = usePlayer();

  useEffect(() => {
    if (!slug) return;
    topicsApi.getBySlug(slug).then(setTopic).catch(console.error).finally(() => setLoading(false));

    const handleListen = (e: any) => {
      const { songId } = e.detail;
      setTopic((prev: any) => {
        if (!prev) return prev;
        const updatedSongs = prev.songs.map((s: any) => s.id === songId ? { ...s, listenCount: (s.listenCount || 0) + 1 } : s);
        return { ...prev, songs: updatedSongs };
      });
    };

    window.addEventListener('song-listen', handleListen);
    return () => window.removeEventListener('song-listen', handleListen);
  }, [slug]);

  if (!loading && !topic) return <div className="loading">Không tìm thấy thể loại</div>;

  const songs = topic?.songs || [];

  return (
    <div className="fade-in">
      <div className="hero-banner" style={{ marginBottom: 24, padding: '32px 40px' }}>
        {loading ? (
          <>
            <div className="skeleton" style={{ width: '300px', height: '40px', marginBottom: '16px' }}></div>
            <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '24px' }}></div>
            <div className="skeleton" style={{ width: '150px', height: '45px', borderRadius: 'var(--radius-full)' }}></div>
          </>
        ) : (
          <>
            <h1 className="hero-title">{topic.title}</h1>
            <p className="hero-subtitle">{topic.description || `Khám phá nhạc ${topic.title}`}</p>
            {songs.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={() => { setPlaylist(songs); play(songs[0]); }}
              >
                ▶ Phát tất cả ({songs.length} bài)
              </button>
            )}
          </>
        )}
      </div>

      <SongList songs={songs} loading={loading} />
    </div>
  );
}
