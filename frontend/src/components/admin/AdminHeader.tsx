'use client';

export default function AdminHeader({ toggleSidebar }: { toggleSidebar?: () => void }) {
  return (
    <header className="header admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '24px', cursor: 'pointer', display: 'none' }}
        >
          <i className="bx bx-menu"></i>
        </button>
        <div className="search-bar">
          <i className="bx bx-search search-icon"></i>
          <input type="text" placeholder="Tìm kiếm trong admin..." />
        </div>
      </div>
      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Administrator</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>admin@music.com</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <i className="bx bxs-user" style={{ color: 'white' }}></i>
          </div>
        </div>
      </div>
    </header>
  );
}
