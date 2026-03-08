/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

type RequestOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  token?: string;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    console.log(`[API Request] ${method} ${API_URL}${endpoint}`);
    const res = await fetch(`${API_URL}${endpoint}`, config);

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  } catch (error: any) {
    console.error(`[API Error] ${method} ${endpoint}:`, error);
    throw new Error(error.message || 'Network error or Server unreachable');
  }
}

// ─── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  register: (data: { email: string; password: string; fullName: string }) =>
    request<any>('/auth/register', { method: 'POST', body: data }),
  initFirstAdmin: (data: { email: string; password: string; fullName: string }) =>
    request<any>('/auth/init', { method: 'POST', body: data }),
};

// ─── Favorites ─────────────────────────────────────────────
export const favoritesApi = {
  toggle: (songId: string, token: string) =>
    request<any>(`/favorites/${songId}`, { method: 'POST', token }),
  getAll: (token: string) => request<any[]>('/favorites', { token }),
  check: (songId: string, token: string) =>
    request<{ isFavorited: boolean }>(`/favorites/check/${songId}`, { token }),
};

// ─── Songs ─────────────────────────────────────────────────
export const songsApi = {
  getAll: (params?: string) => request<any>(`/songs${params ? `?${params}` : ''}`),
  getAllAdmin: (token: string, params?: string) => request<any>(`/songs/admin/list${params ? `?${params}` : ''}`, { token }),
  getTop: (page = 1, limit = 10) => request<any>(`/songs/top?page=${page}&limit=${limit}`),
  getNew: (limit = 10) => request<any[]>(`/songs/new?limit=${limit}`),
  getById: (id: string) => request<any>(`/songs/${id}`),
  getBySlug: (slug: string) => request<any>(`/songs/slug/${slug}`),
  getBySinger: (singerId: string) => request<any>(`/songs?singerId=${singerId}`),
  listen: (id: string) => request<any>(`/songs/${id}/listen`, { method: 'PATCH' }),
  create: (data: any, token: string) =>
    request<any>('/songs', { method: 'POST', body: data, token }),
  update: (id: string, data: any, token: string) =>
    request<any>(`/songs/${id}`, { method: 'PATCH', body: data, token }),
  remove: (id: string, token: string) =>
    request<any>(`/songs/${id}`, { method: 'DELETE', token }),
};

// ─── Topics ────────────────────────────────────────────────
export const topicsApi = {
  getAll: () => request<any[]>('/topics'),
  getAllAdmin: (token: string) => request<any[]>('/topics/admin/list', { token }),
  getById: (id: string) => request<any>(`/topics/${id}`),
  getBySlug: (slug: string) => request<any>(`/topics/slug/${slug}`),
  create: (data: any, token: string) =>
    request<any>('/topics', { method: 'POST', body: data, token }),
  update: (id: string, data: any, token: string) =>
    request<any>(`/topics/${id}`, { method: 'PATCH', body: data, token }),
  remove: (id: string, token: string) =>
    request<any>(`/topics/${id}`, { method: 'DELETE', token }),
};

// ─── Singers ───────────────────────────────────────────────
export const singersApi = {
  getAll: (params?: string) => request<any>(`/singers${params ? `?${params}` : ''}`),
  getAllAdmin: (token: string, params?: string) => request<any>(`/singers/admin/list${params ? `?${params}` : ''}`, { token }),
  getById: (id: string) => request<any>(`/singers/${id}`),
  create: (data: any, token: string) =>
    request<any>('/singers', { method: 'POST', body: data, token }),
  update: (id: string, data: any, token: string) =>
    request<any>(`/singers/${id}`, { method: 'PATCH', body: data, token }),
  remove: (id: string, token: string) =>
    request<any>(`/singers/${id}`, { method: 'DELETE', token }),
};

// ─── Playlists ─────────────────────────────────────────────
export const playlistsApi = {
  getAll: (token: string) => request<any[]>('/playlists', { token }),
  getById: (id: string, token: string) => request<any>(`/playlists/${id}`, { token }),
  create: (data: any, token: string) =>
    request<any>('/playlists', { method: 'POST', body: data, token }),
  update: (id: string, data: any, token: string) =>
    request<any>(`/playlists/${id}`, { method: 'PATCH', body: data, token }),
  remove: (id: string, token: string) =>
    request<any>(`/playlists/${id}`, { method: 'DELETE', token }),
  addSong: (id: string, songId: string, token: string) =>
    request<any>(`/playlists/${id}/songs`, { method: 'POST', body: { songId }, token }),
  removeSong: (id: string, songId: string, token: string) =>
    request<any>(`/playlists/${id}/songs/${songId}`, { method: 'DELETE', token }),
};

// ─── Upload ────────────────────────────────────────────────
async function uploadToCloudinary(file: File, folder: string, token: string) {
  try {
    console.log(`[API Request] Upload Signature: GET ${API_URL}/upload/signature?folder=${folder}`);
    // 1. Lấy chữ ký từ server
    const sigRes = await fetch(`${API_URL}/upload/signature?folder=${folder}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!sigRes.ok) {
      const errorData = await sigRes.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get upload signature');
    }

    const { signature, timestamp, cloudName, apiKey } = await sigRes.json();
    console.log(`[API Request] Cloudinary Upload Config:`, { cloudName, apiKey, timestamp, folder });
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    console.log(`[API Request] Cloudinary URL: ${cloudinaryUrl}`);
    console.log(`[API Request] File: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`);

    // 2. Upload thẳng lên Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const cloudRes = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!cloudRes.ok) {
      const err = await cloudRes.json().catch(() => ({ error: { message: 'Cloudinary upload failed' } }));
      throw new Error(err.error?.message || 'Cloudinary upload failed');
    }

    const data = await cloudRes.json();

    return {
      message: 'Uploaded successfully',
      data: {
        url: data.secure_url,
        secure_url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes,
        duration: data.duration,
      },
    };
  } catch (error: any) {
    console.error(`[API Error] Upload to ${folder}:`, error);
    throw new Error(error.message || 'Upload failed');
  }
}

export const uploadApi = {
  image: (file: File, token: string) => uploadToCloudinary(file, 'music-app/images', token),
  audio: (file: File, token: string) => uploadToCloudinary(file, 'music-app/audio', token),
};

