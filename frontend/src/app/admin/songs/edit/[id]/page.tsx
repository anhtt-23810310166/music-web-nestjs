/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { songsApi, topicsApi, singersApi } from '@/lib/api';
import FileUpload from '@/components/admin/FileUpload';

function getToken() { return localStorage.getItem('accessToken') || ''; }

export default function EditSongPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [topics, setTopics] = useState<any[]>([]);
  const [singers, setSingers] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', avatar: '', description: '', audio: '', lyrics: '', singerId: '', topicId: '', status: 'ACTIVE', position: 0, duration: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [song, topicData, singerData] = await Promise.all([
          songsApi.getById(id), topicsApi.getAll(), singersApi.getAll(),
        ]);
        setTopics(topicData);
        setSingers(singerData.data || []);
        setForm({
          title: song.title || '', avatar: song.avatar || '', description: song.description || '',
          audio: song.audio || '', lyrics: song.lyrics || '', singerId: song.singerId || '', topicId: song.topicId || '',
          status: song.status || 'ACTIVE', position: song.position || 0, duration: song.duration || 0
        });
      } catch { setError('Không tìm thấy bài hát.'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (form.audio && (form.duration === 0 || isNaN(form.duration))) {
      const audio = new Audio(form.audio);
      const handleLoaded = () => {
        setForm(prev => ({ ...prev, duration: Math.floor(audio.duration) }));
      };
      audio.addEventListener('loadedmetadata', handleLoaded);
      return () => audio.removeEventListener('loadedmetadata', handleLoaded);
    }
  }, [form.audio, form.duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (!payload.singerId) delete payload.singerId;
      if (!payload.topicId) delete payload.topicId;
      await songsApi.update(id, payload, getToken());
      router.push('/admin/songs');
    } catch (err: any) { setError('Lỗi khi cập nhật: ' + (err.message || String(err))); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="section-header">
        <h1 className="section-title">Sửa Bài hát</h1>
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
          <form className="admin-form" onSubmit={handleSubmit} id="songForm">
            <div className="form-group">
              <label>Tên bài hát <span style={{ color: '#e74c3c' }}>*</span></label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
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
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
              <textarea value={form.lyrics} onChange={(e) => setForm({ ...form, lyrics: e.target.value })} style={{ minHeight: 120 }} />
            </div>
            {error && <div style={{ color: '#e74c3c', fontSize: 13 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => router.push('/admin/songs')}>Huỷ</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>

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
            }} label="File nhạc" />
          </div>
        </div>
      </div>
    </div>
  );
}
