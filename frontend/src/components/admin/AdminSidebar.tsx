'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', icon: 'bx-grid-alt', label: 'Dashboard' },
  { href: '/admin/topics', icon: 'bx-category', label: 'Quản lý Chủ đề' },
  { href: '/admin/singers', icon: 'bx-group', label: 'Quản lý Ca sĩ' },
  { href: '/admin/songs', icon: 'bx-music', label: 'Quản lý Bài hát' },
];

export default function AdminSidebar({ className, onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/admin/login');
  };

  return (
    <aside className={`sidebar admin-sidebar ${className || ''}`}>
      <div className="sidebar-logo">
        <i className="bx bxs-cog" style={{ fontSize: 28, color: 'var(--accent)' }}></i>
        <span className="logo-text">Admin Panel</span>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">QUẢN TRỊ</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={onLinkClick}
            >
              <i className={`bx ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-bottom" style={{ padding: '16px' }}>
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'var(--text-secondary)' }}
        >
          <i className="bx bx-log-out"></i>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
