'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [keyword, setKeyword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkLog = () => setLoggedIn(!!localStorage.getItem('accessToken'));
    checkLog();
    window.addEventListener('auth-change', checkLog);
    return () => window.removeEventListener('auth-change', checkLog);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('auth-change'));
    setLoggedIn(false);
    router.refresh(); // Refresh to clear specific protected parts
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '24px', cursor: 'pointer', display: 'none' }}
        >
          <i className="bx bx-menu"></i>
        </button>
        <form className="search-bar" onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <i className="bx bx-search search-icon"></i>
          </button>
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>
      </div>
      <div className="header-actions">
        {loggedIn ? (
          <button className="btn btn-outline" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="bx bx-log-out"></i> Đăng xuất
          </button>
        ) : (
          <>
            <Link href="/login">
              <button className="btn btn-outline">Đăng nhập</button>
            </Link>
            <Link href="/register">
              <button className="btn btn-primary">Đăng ký</button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
