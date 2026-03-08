'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Skip auth check for login or init page
  const isPublicPage = pathname === '/admin/login' || pathname === '/admin/init';

  useEffect(() => {
    setTimeout(() => {
      if (isPublicPage) {
        setChecked(true);
        return;
      }
      const token = localStorage.getItem('accessToken');
      const adminStr = localStorage.getItem('adminUser');
      let isAdmin = false;
      try {
        if (adminStr) {
          const user = JSON.parse(adminStr);
          if (user.role === 'ADMIN') isAdmin = true;
        }
      } catch {}

      if (!token || !isAdmin) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('adminUser');
        router.replace('/admin/login');
      } else {
        setChecked(true);
      }
    }, 0);
  }, [isPublicPage, router]);

  if (isPublicPage) return <>{children}</>;
  if (!checked) return null;

  return (
    <div className={`app-layout admin-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <AdminSidebar className={isSidebarOpen ? 'show' : ''} onLinkClick={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="content-scroll admin-content" onClick={() => setIsSidebarOpen(false)}>{children}</main>
      </div>
    </div>
  );
}
