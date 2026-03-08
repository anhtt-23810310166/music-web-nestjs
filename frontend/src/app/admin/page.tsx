/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { topicsApi, singersApi, songsApi } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ songs: 0, singers: 0, topics: 0, listens: 0 });

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [topicsData, singersData, songsData] = await Promise.all([
        topicsApi.getAll(),
        singersApi.getAll(),
        songsApi.getAll('limit=1000'),
      ]);
      const songList = songsData.data || [];
      const totalListens = songList.reduce((sum: number, s: any) => sum + (s.listenCount || 0), 0);
      setStats({
        topics: topicsData.length,
        singers: (singersData.data || []).length,
        songs: songList.length,
        listens: totalListens,
      });
    } catch { /* ignore */ }
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">Dashboard Tổng Quan</h1>
      </div>

      <div className="topics-grid" style={{ marginBottom: 40 }}>
        {[
          { value: stats.songs, label: 'Bài hát', icon: 'bx-music' },
          { value: stats.singers, label: 'Ca sĩ', icon: 'bx-group' },
          { value: stats.topics, label: 'Chủ đề', icon: 'bx-category' },
          { value: formatNumber(stats.listens), label: 'Lượt nghe', icon: 'bx-play-circle' },
        ].map((item, i) => (
          <div key={i} className="topic-card" style={{ background: 'var(--gradient-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--text-primary)' }}>{item.value}</div>
                <div className="topic-card-title" style={{ marginTop: 8 }}>{item.label}</div>
              </div>
              <i className={`bx ${item.icon}`} style={{ fontSize: 36, color: 'var(--accent)', opacity: 0.6 }}></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
