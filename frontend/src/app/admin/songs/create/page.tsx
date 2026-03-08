/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { songsApi, topicsApi, singersApi } from '@/lib/api';
import FileUpload from '@/components/admin/FileUpload';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function CreateSongPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<any[]>([]);
  const [singers, setSingers] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', avatar: '', description: '', audio: '', lyrics: '', singerId: '', topicId: '', status: 'ACTIVE', position: 0, duration: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [topicData, singerData] = await Promise.all([topicsApi.getAll(), singersApi.getAll()]);
        setTopics(topicData);
        setSingers(singerData.data || []);
      } catch { /* ignore */ }
    };
    fetchDropdowns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.audio.trim()) { setError('Tên bài hát và file audio là bắt buộc.'); return; }
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (!payload.singerId) delete payload.singerId;
      if (!payload.topicId) delete payload.topicId;
      await songsApi.create(payload, getToken());
      router.push('/admin/songs');
    } catch { setError('Lỗi khi tạo bài hát.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">Thêm Bài hát mới</h1>
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Left column — main fields */}
        <div style={{ flex: '1 1 400px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
          <form className="admin-form" onSubmit={handleSubmit} id="songForm">
            <div className="form-group">
              <label>Tên bài hát <span style={{ color: '#e74c3c' }}>*</span></label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Em Của Ngày Hôm Qua" required />
            </div>
            <div className="form-group">
              <label>Ca sĩ</label>
              <select value={form.singerId} onChange={(e) => setForm({ ...form, singerId: e.target.value })}>
                <option value="">-- Chọn ca sĩ --</option>
                {singers.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Chủ đề</label>
              <select value={form.topicId} onChange={(e) => setForm({ ...form, topicId: e.target.value })}>
                <option value="">-- Chọn chủ đề --</option>
                {topics.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn..." />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="INACTIVE">Ẩn (INACTIVE)</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label>Vị trí</label>
                <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Thời lượng (giây)</label>
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} placeholder="VD: 215" />
              </div>
            </div>
            <div className="form-group">
              <label>Lời bài hát</label>
              <textarea value={form.lyrics} onChange={(e) => setForm({ ...form, lyrics: e.target.value })} placeholder="Nhập lời bài hát..." style={{ minHeight: 120 }} />
            </div>
            {error && <div style={{ color: '#e74c3c', fontSize: 13 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => router.push('/admin/songs')}>Huỷ</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Tạo Bài hát'}
              </button>
            </div>
          </form>
        </div>

        {/* Right column — file uploads */}
        <div style={{ flex: '0 0 280px' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16 }}>
            <FileUpload type="image" value={form.avatar} onChange={(url) => setForm({ ...form, avatar: url })} label="Ảnh bìa" />
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <FileUpload type="audio" value={form.audio} onChange={(url) => {
              setForm(prev => ({ ...prev, audio: url }));
              if (url) {
                const audio = new Audio(url);
                audio.addEventListener('loadedmetadata', () => {
                  setForm(prev => ({ ...prev, duration: Math.floor(audio.duration) }));
                });
              }
            }} label="File nhạc *" />
          </div>
        </div>
      </div>
    </div>
  );
}
