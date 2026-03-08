/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { topicsApi } from '@/lib/api';
import FileUpload from '@/components/admin/FileUpload';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function EditTopicPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState({ title: '', description: '', avatar: '', position: 0, status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await topicsApi.getById(id);
        setForm({ title: data.title || '', description: data.description || '', avatar: data.avatar || '', position: data.position || 0, status: data.status || 'ACTIVE' });
      } catch { setError('Không tìm thấy chủ đề.'); }
      finally { setLoading(false); }
    };
    fetchTopic();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await topicsApi.update(id, form, getToken());
      router.push('/admin/topics');
    } catch { setError('Lỗi khi cập nhật chủ đề.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">Sửa Chủ đề</h1>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề <span style={{ color: '#e74c3c' }}>*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <FileUpload type="image" value={form.avatar} onChange={(url) => setForm({ ...form, avatar: url })} label="Ảnh đại diện" />
          <div className="form-group">
            <label>Vị trí</label>
            <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">Hoạt động (ACTIVE)</option>
              <option value="INACTIVE">Ẩn (INACTIVE)</option>
            </select>
          </div>
          {error && <div style={{ color: '#e74c3c', fontSize: 13 }}>{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => router.push('/admin/topics')}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
