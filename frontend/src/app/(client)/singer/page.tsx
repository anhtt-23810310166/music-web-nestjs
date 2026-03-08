/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { singersApi } from '@/lib/api';
import Link from 'next/link';

export default function SingersListPage() {
  const [singers, setSingers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await singersApi.getAll();
        setSingers(res?.data || (Array.isArray(res) ? res : []));
      } catch (e) {
        console.error('Failed to load singers:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <section className="section">
        <div className="section-header">
          <h1 className="section-title">Nghệ sĩ</h1>
        </div>
        
        <div className="songs-grid"> 
          {singers.map((singer: any) => (
            <Link 
              href={`/singer/${singer.id}`} 
              key={singer.id} 
              className="song-card"
              style={{ background: 'none', border: 'none' }}
              title={singer.fullName}
            >
              <div className="song-card-image" style={{ borderRadius: 'var(--radius-lg)', width: '100%', aspectRatio: '1/1' }}>
                {singer.avatar ? (
                  <img src={singer.avatar} alt={singer.fullName} style={{ borderRadius: 'var(--radius-lg)', width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}>
                    <i className="bx bxs-user" style={{ fontSize: '64px', color: 'var(--text-muted)' }}></i>
                  </div>
                )}
                {/* Overlay name for better UX while keeping it clean */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: '12px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  opacity: 0,
                  transition: 'var(--transition)'
                }} className="singer-name-overlay">
                  {singer.fullName}
                </div>
              </div>
              <style jsx>{`
                .song-card:hover .singer-name-overlay {
                  opacity: 1;
                }
              `}</style>
            </Link>
          ))}
        </div>
        
        {singers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Chưa có nghệ sĩ nào.
          </div>
        )}
      </section>
    </div>
  );
}
