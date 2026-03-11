# 🎵 MusicBox - Fullstack Music Streaming Platform

[![NestJS](https://img.shields.io/badge/backend-NestJS%2011-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2015-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/orm-Prisma%205-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%2016-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/cache-Redis%207-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript%205-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

MusicBox là một nền tảng nghe nhạc trực tuyến hiện đại, được xây dựng với kiến trúc hướng microservices-ready, hiệu suất cao và giao diện người dùng tối ưu.

---

## 🌟 Tính Năng Nổi Bật

### 🎧 Trải Nghiệm Người Dùng
- **Phát nhạc chất lượng cao**: Trình phát nhạc mượt mà với đầy đủ tính năng (Play/Pause, Seek, Volume, Shuffle, Repeat).
- **Quản lý danh sách phát**: Tạo và tùy chỉnh Playlists cá nhân.
- **Yêu thích & Lịch sử**: Lưu lại các bài hát yêu thích và theo dõi lịch sử nghe nhạc.
- **Tìm kiếm thông minh**: Tìm kiếm bài hát, ca sĩ, chủ đề nhanh chóng.
- **Bảng xếp hạng & Xu hướng**: Cập nhật những bài hát hot nhất theo thời gian thực.

### 🛡️ Hệ Thống Backend
- **Xác thực đa tầng**: JWT Access & Refresh Token, phân quyền người dùng và quản trị viên.
- **Tối ưu hóa hiệu suất**: Caching với Redis, giới hạn lưu lượng (Throttling).
- **Quản lý tệp tin**: Tích hợp Cloudinary để lưu trữ ảnh và âm thanh.
- **Email Service**: Tự động gửi thông báo qua Nodemailer.
- **Swagger Documentation**: Tài liệu API tự động và trực quan.

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án tuân thủ các tiêu chuẩn nghiêm ngặt được quy định trong `GEMINI.md`:

- **Backend**: NestJS (v11), Prisma ORM, PostgreSQL.
- **Frontend**: Next.js (App Router), React 19, Vanilla CSS (Không Tailwind).
- **UI/UX**: Skeleton loading, lazy loading images, Boxicons.

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Yêu Cầu Hệ Thống
- Node.js >= 20.x
- Docker & Docker Compose
- Tài khoản Cloudinary (để upload file)

### 2. Cấu Hình Biến Môi Trường

Tại thư mục gốc (`music-web-nestjs/`):
```bash
cp .env.example .env
```
Cập nhật các thông số: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `EMAIL_*`.

### 3. Triển Khai Cơ Sở Dữ Liệu (Docker)
```bash
docker compose up -d
```

### 4. Thiết Lập Backend
```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed # Để khởi tạo dữ liệu mẫu
npm run start:dev
```
*API sẽ chạy tại: `http://localhost:3002/api/v1`*

### 5. Thiết Lập Frontend
```bash
cd frontend
npm install
npm run dev
```
*Giao diện sẽ chạy tại: `http://localhost:3000`*

---

## 📁 Cấu Trúc Thư Mục

```
music-web-nestjs/
├── src/                # NestJS Backend source
│   ├── auth/           # Xác thực & Phân quyền
│   ├── songs/          # Quản lý bài hát
│   ├── singers/        # Quản lý nghệ sĩ
│   ├── topics/         # Quản lý chủ đề/thể loại
│   ├── playlists/      # Quản lý danh sách phát
│   ├── charts/         # Thống kê & Bảng xếp hạng
│   └── ...
├── prisma/             # Database Schema & Seeds
├── frontend/           # Next.js Frontend
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # Reusable components
│   │   └── context/    # React Context (PlayerContext...)
│   └── public/         # Static assets
└── docker-compose.yml  # Docker services (Postgres, Redis)
```

---

## 🛠 Lệnh CLI Hữu Ích

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run build` | Build dự án cho production |
| `npm run lint` | Kiểm tra và sửa lỗi coding style |
| `npx prisma studio` | Mở giao diện quản lý database trực quan |
| `npm run test` | Chạy unit tests |
| `npm run test:e2e` | Chạy end-to-end tests |

---

## 📞 Liên Hệ & Hỗ Trợ

- **API Documentation**: [http://localhost:3002/docs](http://localhost:3002/docs)
- **Health Check**: [http://localhost:3002/health](http://localhost:3002/health)

---
**Developed by MusicBox Team ❤️**
