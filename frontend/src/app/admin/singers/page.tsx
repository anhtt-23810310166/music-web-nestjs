/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { singersApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function AdminSingersPage() {
  const [singers, setSingers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  useEffect(() => { fetchSingers(); }, []);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSingers = async () => {
    try { setLoading(true); const data = await singersApi.getAllAdmin(getToken(), 'limit=100'); setSingers(data.data || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá ca sĩ này?')) return;
    try { await singersApi.remove(id, getToken()); showToast('Đã xoá ca sĩ!'); fetchSingers(); }
    catch { showToast('Lỗi khi xoá.', 'error'); }
  };

  return (
    <div className="fade-in">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="section-header">
        <h1 className="section-title">Quản lý Ca sĩ</h1>
        <Link href="/admin/singers/create" className="btn btn-primary">
          <i className="bx bx-plus" style={{ marginRight: 6 }}></i>Thêm Ca sĩ
        </Link>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', width: 80 }}>Avatar</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Tên ca sĩ</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Trạng thái</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {singers.map((singer) => (
                <tr key={singer.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-card)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {singer.avatar ? (
                        <Image src={singer.avatar} alt={singer.fullName} width={44} height={44} style={{ objectFit: 'cover' }} />
                      ) : (
                        <i className="bx bxs-user" style={{ fontSize: 20, color: 'var(--text-secondary)' }}></i>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{singer.fullName}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, background: singer.status === 'ACTIVE' ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)', color: singer.status === 'ACTIVE' ? '#2ecc71' : '#e74c3c' }}>
                      {singer.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <Link href={`/admin/singers/edit/${singer.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 16 }}>
                        <i className="bx bx-edit-alt"></i>
                      </Link>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 16, background: '#e74c3c' }} onClick={() => handleDelete(singer.id)}>
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {singers.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có ca sĩ nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
