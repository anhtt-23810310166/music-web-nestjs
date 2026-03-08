# 🎵 Music Web - NestJS Backend

Backend API cho ứng dụng nghe nhạc trực tuyến xây dựng với NestJS.

---

## 🚀 Cài Đặt Nhanh

### 1. Clone repository
```bash
git clone <your-repo-url>
cd music-web-nestjs
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
```bash
cp .env.example .env
```

Sửa file `.env` với thông tin của bạn:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/music_streaming"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3002
```

### 4. Khởi tạo database
```bash
# Option A: Dùng Docker (khuyến nghị)
docker compose up -d

# Option B: Dùng PostgreSQL có sẵn
# Tạo database và cập nhật DATABASE_URL trong .env
```

### 5. Setup Prisma
```bash
npx prisma generate
npx prisma db push
```

### 6. Chạy server
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

---

## 📡 Truy Cập API

Sau khi server chạy:

- **API Base URL**: http://localhost:3002/api/v1
- **Swagger Docs**: http://localhost:3002/docs
- **Health Check**: http://localhost:3002/health

---

## 🔑 Tạo Admin Account Đầu Tiên

```bash
curl -X POST http://localhost:3002/api/v1/auth/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@musicweb.com",
    "password": "admin123",
    "fullName": "Admin User"
  }'
```

---

## 📁 Cấu Trúc Project

```
music-web-nestjs/
├── src/
│   ├── auth/           # Authentication
│   ├── users/          # User management
│   ├── songs/          # Songs CRUD
│   ├── singers/        # Artists
│   ├── topics/         # Genres
│   ├── playlists/      # Playlists
│   ├── favorites/      # Favorites
│   ├── charts/         # Charts & trending
│   ├── listening-history/
│   ├── upload/         # File upload
│   └── ...
├── prisma/
│   └── schema.prisma   # Database schema
├── frontend/           # Next.js frontend
├── docker-compose.yml  # Docker services
└── package.json
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🛠 Commands Hữu Ích

```bash
# Build project
npm run build

# Format code
npm run format

# Lint code
npm run lint

# Generate Prisma client
npx prisma generate

# Database migrations
npx prisma migrate dev
npx prisma db push

# Seed database (nếu có)
npx prisma db seed
```

---

## 📦 Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5
- **Cache**: Redis 7
- **Auth**: JWT
- **Storage**: Cloudinary

---

## 🐛 Troubleshooting

**Lỗi database connection:**
```bash
# Kiểm tra PostgreSQL đang chạy
docker ps

# Hoặc khởi động lại
docker compose restart postgres
```

**Lỗi Prisma:**
```bash
npx prisma generate
npx prisma db push
```

**Lỗi port đã sử dụng:**
```bash
# Đổi port trong .env
PORT=3003
```

---

## 📞 Hỗ Trợ

- API Docs: http://localhost:3002/docs
- Health: http://localhost:3002/health

---

**Made with ❤️ by MusicWeb Team**
