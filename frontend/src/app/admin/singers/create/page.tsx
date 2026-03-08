'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { singersApi } from '@/lib/api';
import FileUpload from '@/components/admin/FileUpload';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function CreateSingerPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', avatar: '', status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    setSaving(true);
    try {
      await singersApi.create(form, getToken());
      router.push('/admin/singers');
    } catch { setError('Lỗi khi tạo ca sĩ.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">Thêm Ca sĩ mới</h1>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên ca sĩ <span style={{ color: '#e74c3c' }}>*</span></label>
            <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="VD: Sơn Tùng M-TP" required />
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
              {saving ? 'Đang lưu...' : 'Tạo Ca sĩ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
