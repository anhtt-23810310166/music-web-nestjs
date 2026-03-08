'use client';

import { usePlayer } from '@/context/PlayerContext';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { favoritesApi, playlistsApi } from '@/lib/api';

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getToken() {
  return localStorage.getItem('accessToken') || '';
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Player() {
  const { currentSong, isPlaying, progress, duration, volume, toggle, seek, setVolume, next, prev, repeat, shuffle, toggleRepeat, toggleShuffle } =
    usePlayer();
  const [isFav, setIsFav] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const checkFav = useCallback(async (songId: string) => {
    const token = getToken();
    if (!token) { setIsFav(false); return; }
    try {
      const res = await favoritesApi.check(songId, token);
      setIsFav(res.isFavorited);
    } catch { setIsFav(false); }
  }, []);

  useEffect(() => {
    if (currentSong) checkFav(currentSong.id);
    else setIsFav(false);
  }, [currentSong, checkFav]);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPlaylistMenu(false);
      }
    };
    if (showPlaylistMenu) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showPlaylistMenu]);

  const handleToggleFav = async () => {
    if (!currentSong) return;
    const token = getToken();
    if (!token) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }
    try {
      await favoritesApi.toggle(currentSong.id, token);
      setIsFav(!isFav);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi thêm vào yêu thích');
    }
  };

  const openPlaylistMenu = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await playlistsApi.getAll(token);
      setPlaylists(data);
    } catch { /* ignore */ }
    setShowPlaylistMenu(!showPlaylistMenu);
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!currentSong) return;
    const token = getToken();
    setAddingTo(playlistId);
    try {
      await playlistsApi.addSong(playlistId, currentSong.id, token);
      setShowPlaylistMenu(false);
    } catch { /* ignore */ }
    finally { setAddingTo(null); }
  };

  if (!currentSong) return null;

  const repeatActive = repeat !== 'off';

  return (
    <div className="player">
      {/* Song Info */}
      <div className="player-song">
        <div className="player-img">
          {currentSong.avatar ? (
            <img src={currentSong.avatar} alt={currentSong.title} />
          ) : (
            <i className="bx bxs-music" style={{ color: 'var(--text-secondary)' }}></i>
          )}
        </div>
        <div className="player-song-info">
          <div className="player-song-title">{currentSong.title}</div>
          <div className="player-song-artist">
            {currentSong.singer?.fullName || 'Unknown'}
          </div>
        </div>
        <button
          className={`player-btn ${isFav ? 'player-btn-fav' : ''}`}
          onClick={handleToggleFav}
          title={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
          style={{ marginLeft: 8 }}
        >
          <i className={isFav ? 'bx bxs-heart' : 'bx bx-heart'}></i>
        </button>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <div className="player-buttons">
          <button
            className={`player-btn ${shuffle ? 'player-btn-active' : ''}`}
            onClick={toggleShuffle}
            title="Phát ngẫu nhiên"
          >
            <i className="bx bx-shuffle"></i>
          </button>
          <button className="player-btn" onClick={prev}>
            <i className="bx bx-skip-previous"></i>
          </button>
          <button className="player-btn player-btn-play" onClick={toggle}>
            <i className={isPlaying ? "bx bx-pause" : "bx bx-play"}></i>
          </button>
          <button className="player-btn" onClick={next}>
            <i className="bx bx-skip-next"></i>
          </button>
          <button
            className={`player-btn ${repeatActive ? 'player-btn-active' : ''}`}
            onClick={toggleRepeat}
            title={repeat === 'off' ? 'Phát lại: Tắt' : repeat === 'all' ? 'Phát lại: Tất cả' : 'Phát lại: 1 bài'}
            style={{ position: 'relative' }}
          >
            <i className="bx bx-repeat"></i>
            {repeat === 'one' && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                fontSize: 8, fontWeight: 800,
                color: 'var(--accent)',
                lineHeight: 1,
              }}>1</span>
            )}
          </button>
        </div>
        <div className="player-progress">
          <span className="player-time">{formatTime(progress)}</span>
          <div
            className="progress-bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek((e.clientX - rect.left) / rect.width);
            }}
          >
            <div
              className="progress-fill"
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            />
          </div>
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume + Add to playlist + Lyrics */}
      <div className="player-extra">
        {/* Lyrics button */}
        <button
          className={`player-btn ${showLyrics ? 'player-btn-active' : ''}`}
          onClick={() => setShowLyrics(true)}
          title="Lời bài hát"
          disabled={!currentSong.lyrics}
          style={{ opacity: currentSong.lyrics ? 1 : 0.4 }}
        >
          <i className="bx bx-text" style={{ fontSize: 22 }}></i>
        </button>

        {/* Add to playlist button */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="player-btn"
            onClick={openPlaylistMenu}
            title="Thêm vào playlist"
          >
            <i className="bx bx-list-plus" style={{ fontSize: 22 }}></i>
          </button>

          {showPlaylistMenu && (
            <div style={{
              position: 'absolute', bottom: '100%', right: 0,
              marginBottom: 8, width: 220,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-dropdown)',
              overflow: 'hidden', zIndex: 100,
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Thêm vào playlist
              </div>
              {playlists.length === 0 ? (
                <div style={{ padding: '16px 14px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  Chưa có playlist
                </div>
              ) : playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => addToPlaylist(pl.id)}
                  disabled={addingTo === pl.id}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'none', border: 'none',
                    color: 'var(--text-primary)', fontSize: 13,
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <i className="bx bx-music" style={{ color: 'var(--text-muted)' }}></i>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.title}</span>
                  {addingTo === pl.id && <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 14 }}></i>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="volume-control">
          <button className="player-btn" onClick={() => setVolume(volume > 0 ? 0 : 0.8)}>
            <i className={volume === 0 ? "bx bx-volume-mute" : "bx bx-volume-full"}></i>
          </button>
          <div
            className="volume-slider"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
            }}
          >
            <div className="volume-fill" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Lyrics Modal Overlay */}
      {showLyrics && typeof document !== 'undefined' && createPortal(
        <div className="lyrics-overlay" onClick={() => setShowLyrics(false)}>
          <div className="lyrics-container" onClick={(e) => e.stopPropagation()}>
            <button className="lyrics-close" onClick={() => setShowLyrics(false)}>
              <i className="bx bx-x"></i>
            </button>
            <div className="lyrics-header">
              <div className="lyrics-title">{currentSong.title}</div>
              <div className="lyrics-artist">{currentSong.singer?.fullName || 'Unknown'}</div>
            </div>
            <div className="lyrics-content content-scroll">
              {currentSong.lyrics ? (
                currentSong.lyrics.split('\n').map((line: string, i: number) => (
                  <p key={i} className="lyrics-line">{line || '\u00A0'}</p>
                ))
              ) : (
                <p className="lyrics-empty">Bài hát này chưa có lời.</p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
