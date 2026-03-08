'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt?: string;
};

export default function AdminProfilePage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const adminStr = localStorage.getItem('adminUser');
    if (adminStr) {
      try {
        const user = JSON.parse(adminStr);
        setAdminUser(user);
        setFormData({ fullName: user.fullName || '', email: user.email || '' });
      } catch {
        router.push('/admin/login');
      }
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const updatedUser = { ...adminUser, ...formData };
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      setAdminUser(updatedUser);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!adminUser) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      <div className="section-header">
        <h1 className="section-title">Thông Tin Admin</h1>
      </div>

      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '40px 48px',
        border: '1px solid var(--border)',
        width: '100%',
      }}>
        {message.text && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: 24,
            fontSize: 14,
            background: message.type === 'success' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
            color: message.type === 'success' ? '#2ecc71' : '#e74c3c',
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input 
              type="text" 
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input 
              type="text" 
              value={adminUser.role || 'ADMIN'}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>

          {adminUser.createdAt && (
            <div className="form-group">
              <label>Ngày tạo tài khoản</label>
              <input 
                type="text" 
                value={new Date(adminUser.createdAt).toLocaleDateString('vi-VN')}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1, padding: '12px 24px' }}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="btn btn-outline"
              style={{ flex: 1, padding: '12px 24px' }}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
