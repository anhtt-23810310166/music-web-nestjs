/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { singersApi, songsApi } from '@/lib/api';
import { usePlayer } from '@/context/PlayerContext';
import SongList from '@/components/SongList';

export default function SingerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [singer, setSinger] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { play, setPlaylist } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [singerData, songsData] = await Promise.all([
          singersApi.getById(id),
          songsApi.getBySinger(id),
        ]);
        setSinger(singerData);
        setSongs(songsData?.data || (Array.isArray(songsData) ? songsData : []));
      } catch (err) {
        console.error('Error fetching singer details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (!loading && !singer) return <div className="loading">Không tìm thấy ca sĩ</div>;

  return (
    <div className="fade-in">
      <div className="hero-banner" style={{ marginBottom: 32, padding: '40px', display: 'flex', gap: '32px', alignItems: 'center' }}>
        {loading ? (
          <>
            <div className="skeleton" style={{ width: '180px', height: '180px', borderRadius: 'var(--radius-xl)', flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '250px', height: '40px', marginBottom: '16px' }}></div>
              <div className="skeleton" style={{ width: '80%', height: '20px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '24px' }}></div>
              <div className="skeleton" style={{ width: '150px', height: '45px', borderRadius: 'var(--radius-full)' }}></div>
            </div>
          </>
        ) : (
          <>
            <div style={{ 
              width: '180px', height: '180px', borderRadius: 'var(--radius-xl)', 
              overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              {singer.avatar ? (
                <img src={singer.avatar} alt={singer.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bx bxs-user" style={{ fontSize: '72px', color: 'var(--text-muted)' }}></i>
                </div>
              )}
            </div>
            <div>
              <h1 className="hero-title" style={{ marginBottom: '8px' }}>{singer.fullName}</h1>
              <p className="hero-subtitle" style={{ marginBottom: '24px', maxWidth: '600px' }}>
                {singer.description || `Khám phá các bài hát của ${singer.fullName}`}
              </p>
              {songs.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => { setPlaylist(songs); play(songs[0]); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <i className="bx bx-play" style={{ fontSize: '20px' }}></i>
                  Phát tất cả
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <section className="section">
        <div className="section-header">
          {loading ? (
            <div className="skeleton" style={{ width: '200px', height: '28px' }}></div>
          ) : (
            <h2 className="section-title">Danh sách bài hát</h2>
          )}
        </div>
        
        <SongList songs={songs} loading={loading} />

        {!loading && songs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Chưa có bài hát nào từ nghệ sĩ này.
          </div>
        )}
      </section>
    </div>
  );
}
