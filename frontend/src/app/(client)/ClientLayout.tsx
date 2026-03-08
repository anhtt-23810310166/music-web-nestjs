'use client';

import { PlayerProvider } from '@/context/PlayerContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Player from '@/components/Player';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleExpired = () => {
      setExpiredMessage(true);
      // Auto redirect after 3 seconds
      setTimeout(() => {
        setExpiredMessage(false);
        router.push('/login');
      }, 3000);
    };

    window.addEventListener('session-expired', handleExpired);
    return () => window.removeEventListener('session-expired', handleExpired);
  }, [router]);

  return (
    <PlayerProvider>
      <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
        <Sidebar className={isSidebarOpen ? 'show' : ''} onLinkClick={() => setIsSidebarOpen(false)} />
        <div className="main-content">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="content-scroll" onClick={() => setIsSidebarOpen(false)}>{children}</main>
        </div>
        <Player />

        {/* Global Session Expired Notification */}
        {expiredMessage && (
          <div style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--accent)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <i className="bx bx-error-circle" style={{ fontSize: '20px' }}></i>
            <span style={{ fontWeight: 600 }}>Phiên đăng nhập hết hạn. Đang chuyển hướng...</span>
          </div>
        )}

        <style jsx>{`
          @keyframes slideDown {
            from { transform: translate(-50%, -50px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
        `}</style>
      </div>
    </PlayerProvider>
  );
}
