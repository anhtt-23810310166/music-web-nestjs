'use client';

import { PlayerProvider } from '@/context/PlayerContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Player from '@/components/Player';

import { useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      </div>
    </PlayerProvider>
  );
}
