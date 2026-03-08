'use client';

import { useState, useRef } from 'react';
import { uploadApi } from '@/lib/api';
import Image from 'next/image';

interface FileUploadProps {
  type: 'image' | 'audio';
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

function getToken() {
  return localStorage.getItem('accessToken') || '';
}

export default function FileUpload({ type, value, onChange, label }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = type === 'image' ? 'image/jpeg,image/png,image/gif,image/webp' : 'audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/mp4';
  const maxSize = type === 'image' ? 5 : 20; // MB
  const hint = type === 'image'
    ? 'JPG, PNG, GIF, WebP (tối đa 5MB)'
    : 'MP3, WAV, OGG, AAC (tối đa 20MB)';

  const handleFile = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File quá lớn (tối đa ${maxSize}MB)`);
      return;
    }
    setError('');
    setUploading(true);
    try {
      const token = getToken();
      const result = type === 'image'
        ? await uploadApi.image(file, token)
        : await uploadApi.audio(file, token);
      onChange(result.data?.secure_url || result.data?.url || '');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload thất bại.';
      if (msg.toLowerCase().includes('unauthorized') || msg.includes('401')) {
        localStorage.removeItem('accessToken');
        window.location.href = '/admin/login';
        return;
      }
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div
        className="upload-area"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: value ? 12 : 32,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'var(--transition)',
          background: 'var(--bg-input)',
          position: 'relative',
        }}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />

        {uploading ? (
          <div style={{ color: 'var(--accent)', padding: 20 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 28 }}></i>
            <p style={{ marginTop: 8, fontSize: 13 }}>Đang upload...</p>
          </div>
        ) : value ? (
          <div>
            {type === 'image' ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Image src={value} alt="Preview" width={200} height={200} style={{ borderRadius: 'var(--radius-md)', objectFit: 'cover', maxHeight: 200 }} />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(''); }}
                  style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="bx bxs-music" style={{ fontSize: 28, color: 'var(--accent)' }}></i>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>File đã upload</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{value}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(''); }}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>
            )}
            <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Click để thay đổi</p>
          </div>
        ) : (
          <div>
            <i className={`bx ${type === 'image' ? 'bx-image-add' : 'bx-music'}`} style={{ fontSize: 32, color: 'var(--text-muted)' }}></i>
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>Kéo thả hoặc click để chọn file</p>
            <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>{hint}</p>
          </div>
        )}
      </div>
      {error && <p style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}
