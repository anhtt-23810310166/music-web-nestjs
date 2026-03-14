/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePlayer } from '@/context/PlayerContext';

interface SongListProps {
  songs: any[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  renderActions?: (song: any) => React.ReactNode;
  showRank?: boolean;
  limit?: number;
}

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

export default function SongList({
  songs,
  loading,
  onLoadMore,
  hasMore,
  loadingMore,
  renderActions,
  showRank = true,
  limit = 10,
}: SongListProps) {
  const { play, setPlaylist, currentSong, isPlaying } = usePlayer();
  const [internalLimit, setInternalLimit] = useState(limit);

  // If onLoadMore is provided, we use server-side "Load More"
  // Otherwise, we use client-side "Show More" if songs.length > limit
  const isServerSide = !!onLoadMore;
  const canLoadMore = isServerSide ? hasMore : songs.length > internalLimit;

  const handleLoadMore = () => {
    if (isServerSide) {
      onLoadMore?.();
    } else {
      setInternalLimit(prev => prev + 10);
    }
  };

  const displayedSongs = isServerSide ? songs : songs.slice(0, internalLimit);

  if (loading) {
    return (
      <div className="song-list">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="song-list-item">
            <div className="skeleton" style={{ width: '30px', height: '20px' }}></div>
            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)' }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ width: '20%', height: '12px' }}></div>
            </div>
            <div className="skeleton" style={{ width: '60px', height: '16px' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="song-list">
        {displayedSongs.map((song: any, i: number) => {
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
              {showRank && (
                <div className={`song-list-rank ${i < 3 ? 'top-3' : ''}`} style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>
                  {isActive && isPlaying ? <i className="bx bx-equalizer bx-tada" style={{ color: 'var(--accent)' }}></i> : i + 1}
                </div>
              )}
              <div className="song-list-img">
                {song.avatar ? <img src={song.avatar} alt="" loading="lazy" /> : <i className="bx bxs-music"></i>}
              </div>
              <div className="song-list-info">
                <div className="song-list-title" style={{ color: isActive ? 'var(--accent)' : 'inherit', fontWeight: isActive ? '700' : '500' }}>
                  {song.title}
                </div>
                <div className="song-list-artist">
                  <Link href={`/singer/${song.singer?.id || song.singerId}`} onClick={(e) => e.stopPropagation()}>
                    {song.singer?.fullName || 'Unknown'}
                  </Link>
                </div>
              </div>
              <div className="song-list-stats">
                ▶ {formatListens(song.listenCount || 0)}
              </div>
              <div className="song-list-duration">
                {renderActions ? renderActions(song) : formatDuration(song.duration)}
              </div>
            </div>
          );
        })}
      </div>
      {canLoadMore && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="btn btn-outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{ minWidth: '120px' }}
          >
            {loadingMore ? 'Đang tải...' : 'Tải thêm'}
          </button>
        </div>
      )}
    </>
  );
}
