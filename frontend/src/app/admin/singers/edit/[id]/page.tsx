/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { singersApi } from '@/lib/api';
import FileUpload from '@/components/admin/FileUpload';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function EditSingerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState({ fullName: '', avatar: '', status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSinger = async () => {
      try {
        const data = await singersApi.getById(id);
        setForm({ fullName: data.fullName || '', avatar: data.avatar || '', status: data.status || 'ACTIVE' });
      } catch { setError('Không tìm thấy ca sĩ.'); }
      finally { setLoading(false); }
    };
    fetchSinger();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    setSaving(true);
    try {
      await singersApi.update(id, form, getToken());
      router.push('/admin/singers');
    } catch { setError('Lỗi khi cập nhật ca sĩ.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">Sửa Ca sĩ</h1>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên ca sĩ <span style={{ color: '#e74c3c' }}>*</span></label>
            <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <FileUpload type="image" value={form.avatar} onChange={(url) => setForm({ ...form, avatar: url })} label="Ảnh đại diện" />
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Trạng thái</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">Hoạt động (ACTIVE)</option>
              <option value="INACTIVE">Ẩn (INACTIVE)</option>
            </select>
          </div>
          {error && <div style={{ color: '#e74c3c', fontSize: 13 }}>{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => router.push('/admin/singers')}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
