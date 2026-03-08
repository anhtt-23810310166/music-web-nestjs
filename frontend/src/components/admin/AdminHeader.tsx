'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
};

export default function AdminHeader({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const adminStr = localStorage.getItem('adminUser');
    if (adminStr) {
      try {
        setAdminUser(JSON.parse(adminStr));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleClick = () => {
    router.push('/admin/profile');
  };

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
      </div>
      <div className="header-actions">
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={handleClick}
          title="Xem thông tin admin"
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{adminUser?.fullName || 'Administrator'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{adminUser?.email || 'admin@music.com'}</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            <i className="bx bxs-user" style={{ color: 'white' }}></i>
          </div>
        </div>
      </div>
    </header>
  );
}
