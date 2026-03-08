'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register({ email, password, fullName });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 420, margin: '60px auto' }}>
      <h1 className="section-title" style={{ textAlign: 'center', marginBottom: 32 }}>
        Tạo tài khoản
      </h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{
            background: 'rgba(233,69,96,0.15)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            color: 'var(--accent)',
            fontSize: 13,
          }}>
            {error}
          </div>
        )}
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Họ và tên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Nguyễn Văn A"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@example.com"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Tối thiểu 6 ký tự"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 8 }}
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        Đã có tài khoản? <a href="/login" style={{ color: 'var(--accent)' }}>Đăng nhập</a>
      </p>
    </div>
  );
}
