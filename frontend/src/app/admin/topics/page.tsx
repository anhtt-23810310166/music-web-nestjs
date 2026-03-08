/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { topicsApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function AdminTopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  useEffect(() => { 
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchTopics(); 
  }, []);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTopics = async () => {
    try { 
      setLoading(true); 
      const token = getToken();
      const data = await topicsApi.getAllAdmin(token); 
      setTopics(data); 
    }
    catch (err: any) {
      if (err.message.includes('Unauthorized') || err.message.includes('Forbidden')) {
        router.push('/admin/login');
      }
    } 
    finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá chủ đề này?')) return;
    try { await topicsApi.remove(id, getToken()); showToast('Đã xoá chủ đề!'); fetchTopics(); }
    catch { showToast('Lỗi khi xoá.', 'error'); }
  };

  return (
    <div className="fade-in">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="section-header">
        <h1 className="section-title">Quản lý Chủ đề</h1>
        <Link href="/admin/topics/create" className="btn btn-primary">
          <i className="bx bx-plus" style={{ marginRight: 6 }}></i>Thêm Chủ đề
        </Link>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)', width: 80 }}>Hình ảnh</th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-muted)' }}>Tiêu đề</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Vị trí</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Trạng thái</th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--gradient-card)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {topic.avatar ? (
                        <Image src={topic.avatar} alt={topic.title} width={44} height={44} style={{ objectFit: 'cover' }} />
                      ) : (
                        <i className="bx bxs-category" style={{ fontSize: 20, color: 'var(--text-secondary)' }}></i>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>
                    <div style={{ fontSize: 14 }}>{topic.title}</div>
                    {topic.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{topic.description.length > 50 ? topic.description.substring(0, 50) + '...' : topic.description}</div>}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>{topic.position || 0}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, background: topic.status === 'ACTIVE' ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)', color: topic.status === 'ACTIVE' ? '#2ecc71' : '#e74c3c' }}>
                      {topic.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <Link href={`/admin/topics/edit/${topic.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 16 }}>
                        <i className="bx bx-edit-alt"></i>
                      </Link>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 16, background: '#e74c3c' }} onClick={() => handleDelete(topic.id)}>
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {topics.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có chủ đề nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
