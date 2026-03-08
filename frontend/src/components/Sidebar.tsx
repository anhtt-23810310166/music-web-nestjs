'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', icon: <i className="bx bx-home-alt"></i>, label: 'Trang chủ' },
  { href: '/explore', icon: <i className="bx bx-compass"></i>, label: 'Khám phá' },
  { href: '/trending', icon: <i className="bx bxs-flame"></i>, label: 'Trending' },
  { href: '/new-releases', icon: <i className="bx bx-star"></i>, label: 'Mới phát hành' },
];

const libraryItems = [
  { href: '/favorites', icon: <i className="bx bx-heart"></i>, label: 'Yêu thích' },
  { href: '/playlists', icon: <i className="bx bx-list-ul"></i>, label: 'Playlist' },
];

export default function Sidebar({ className = '', onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLog = () => setLoggedIn(!!localStorage.getItem('accessToken'));
    checkLog();
    window.addEventListener('auth-change', checkLog);
    return () => window.removeEventListener('auth-change', checkLog);
  }, []);

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-logo">
        <div className="logo-icon"><i className="bx bx-headphone" style={{ color: "white" }}></i></div>
        <span>MusicBox</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Menu</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="nav-section-title">Thư viện</div>
        {libraryItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
            {!loggedIn && (
              <i className="bx bx-lock-alt" style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--text-muted)', opacity: 0.6 }}></i>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
