'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function InitAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authApi.initFirstAdmin(form);
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(result.user));
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Lỗi khởi tạo hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className="bx bxs-check-shield" style={{ fontSize: 28, color: 'white' }}></i>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Khởi tạo Hệ thống</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>Tạo tài khoản Quản trị đầu tiên</p>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 32, border: '1px solid var(--border)' }}>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên hiển thị</label>
              <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Quản trị viên" required />
            </div>
            <div className="form-group">
              <label>Email Admin</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@domain.com" required />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required minLength={6} />
            </div>
            {error && <div style={{ color: '#e74c3c', fontSize: 13, padding: '8px 12px', background: 'rgba(231,76,60,0.1)', borderRadius: 'var(--radius-md)' }}>{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: 8 }}>
              {loading ? 'Đang tạo...' : 'Khởi tạo Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
