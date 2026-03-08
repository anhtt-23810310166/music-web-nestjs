# 🎵 Music Web - NestJS Backend

Hệ thống backend cho ứng dụng nghe nhạc trực tuyến, được xây dựng với NestJS, PostgreSQL, Redis và Prisma ORM.

![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-v7-DC382D?logo=redis&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-v5-2D3748?logo=prisma&logoColor=white)

---

## ✨ Tính Năng

### 🔐 Authentication & Authorization
- JWT-based authentication (Access Token + Refresh Token)
- Role-based access control (USER, ADMIN)
- Email verification
- Password reset functionality
- Rate limiting cho security

### 🎶 Music Management
- **Songs**: CRUD, search (title, lyrics, description), pagination
- **Singers/Artists**: CRUD, pagination
- **Topics/Genres**: CRUD, position management
- **Audio Upload**: Cloudinary integration với auto duration extraction

### 📊 Analytics & Statistics
- **Listening History**: Track user listening activity
- **Charts & Trends**: 
  - Top songs (daily/weekly/monthly/all-time)
  - Trending songs (growth-based)
  - Top artists
  - Top genres
- Listen count, like count tracking

### 🎧 User Features
- **Playlists**: Create, edit, batch operations, reorder songs
- **Favorites**: Like/unlike songs
- **Profile Management**: Update profile, change password, change email
- **Recently Played**: Quick access to listening history

### ⚡ Performance & Security
- Redis caching cho frequently accessed data
- Global exception filters
- Request validation với class-validator
- CORS configuration
- Graceful shutdown
- Health check endpoints

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 5 |
| **Cache** | Redis 7 |
| **Auth** | JWT + Passport |
| **File Storage** | Cloudinary |
| **API Docs** | Swagger UI |
| **Validation** | class-validator, class-transformer |
| **Email** | Nodemailer |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- PostgreSQL v16+
- Redis v7+
- Docker (optional)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd music-web-nestjs

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
docker compose up -d  # Start PostgreSQL & Redis
npx prisma generate
npx prisma db push

# Build & Run
npm run build
npm run start:prod
```

### First Admin Account

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

## 📡 API Endpoints

### Base URL
```
http://localhost:3002/api/v1
```

### Swagger Documentation
```
http://localhost:3002/docs
```

### Health Checks
```bash
GET /health    # Health check
GET /ready     # Readiness check
```

### Main Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | ❌ | Register new user |
| `/auth/login` | POST | ❌ | Login |
| `/auth/refresh` | POST | ✅ | Refresh token |
| `/auth/logout` | POST | ✅ | Logout |
| `/users/profile` | GET/PATCH | ✅ | User profile |
| `/users/change-password` | POST | ✅ | Change password |
| `/songs` | GET | ❌ | Get songs (public) |
| `/songs/admin/list` | GET | ✅ | Get all songs (admin) |
| `/songs/:id/listen` | PATCH | ❌ | Increment listen count |
| `/singers` | GET | ❌ | Get singers |
| `/topics` | GET | ❌ | Get topics |
| `/playlists` | GET/POST | ✅ | Manage playlists |
| `/favorites` | GET/POST | ✅ | Manage favorites |
| `/listening-history` | GET/POST | ✅ | Listening history |
| `/charts/songs` | GET | ❌ | Top songs chart |
| `/charts/trending` | GET | ❌ | Trending songs |
| `/charts/artists` | GET | ❌ | Top artists |
| `/upload/audio` | POST | ✅ | Upload audio file |
| `/upload/image` | POST | ✅ | Upload image |

---

## 📁 Project Structure

```
music-web-nestjs/
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── songs/             # Songs CRUD & search
│   ├── singers/           # Artists management
│   ├── topics/            # Genres/Topics management
│   ├── playlists/         # Playlists management
│   ├── favorites/         # Favorite songs
│   ├── listening-history/ # Listening analytics
│   ├── charts/            # Charts & trending
│   ├── upload/            # File upload (Cloudinary)
│   ├── email/             # Email service
│   ├── throttler/         # Rate limiting config
│   ├── filters/           # Exception filters
│   ├── prisma/            # Prisma service
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma      # Database schema
├── frontend/              # Next.js frontend
├── Dockerfile             # Production build
├── docker-compose.yml     # Docker services
├── .env.example           # Environment template
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
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

## 🌐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# JWT
JWT_ACCESS_SECRET="your-secret"
JWT_REFRESH_SECRET="your-secret"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Cloudinary
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="xxx"
SMTP_PASS="xxx"

# App
PORT=3002
NODE_ENV="development"
```

---

## 🚢 Deployment

### Option 1: Deploy với Docker

```bash
# Build image
docker build -t music-web-api .

# Run container
docker run -d \
  -p 3002:3002 \
  --env-file .env.production \
  --name music-api \
  music-web-api

# Check logs
docker logs -f music-api

# Health check
curl http://localhost:3002/health
```

### Option 2: Deploy lên Render.com (Free)

1. Truy cập: https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Config:
   - **Build Command**: `npm run build`
   - **Start Command**: `node dist/main.js`
   - **Environment Variables**:
     ```
     DATABASE_URL=your-neon-db-url
     REDIS_URL=your-upstash-url
     JWT_ACCESS_SECRET=your-secret
     JWT_REFRESH_SECRET=your-secret
     CLOUDINARY_CLOUD_NAME=xxx
     CLOUDINARY_API_KEY=xxx
     CLOUDINARY_API_SECRET=xxx
     NODE_ENV=production
     ```
5. Deploy!

### Option 3: Deploy lên Railway.app (Free)

1. Truy cập: https://railway.app
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy!

### Option 4: Deploy Frontend lên Vercel (Free)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Environment variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```

---

## 🆓 Free Tier Deployment Guide

### Combo miễn phí 100%:

| Service | Provider | Free Tier | Link |
|---------|----------|-----------|------|
| **Backend** | Render | 750hrs/tháng | render.com |
| **Frontend** | Vercel | Unlimited | vercel.com |
| **Database** | Neon | 500MB | neon.tech |
| **Redis** | Upstash | 10K commands/day | upstash.com |
| **Storage** | Cloudinary | 25GB | cloudinary.com |

### Các bước deploy:

1. **Tạo Database (Neon)**:
   - Sign up tại https://neon.tech
   - Create project → Copy connection string
   - `DATABASE_URL=xxx`

2. **Tạo Redis (Upstash)**:
   - Sign up tại https://upstash.com
   - Create Redis → Copy URL
   - `REDIS_URL=xxx`

3. **Deploy Backend (Render)**:
   - Connect GitHub
   - Add environment variables
   - Deploy!

4. **Deploy Frontend (Vercel)**:
   - Import repository
   - Set `NEXT_PUBLIC_API_URL`
   - Deploy!

---

## 🔒 Security Features

- ✅ Rate limiting (3 req/10s for register, 10 req/min for login)
- ✅ JWT token expiration
- ✅ Password hashing với bcrypt
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection protection (Prisma ORM)
- ✅ Graceful shutdown
- ✅ Health check endpoints

---

## 📊 Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │   Singer    │     │    Topic    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ email       │     │ fullName    │     │ title       │
│ password    │     │ avatar      │     │ description │
│ fullName    │     │ status      │     │ slug        │
│ role        │     └──────┬──────┘     │ status      │
│ status      │            │            └──────┬──────┘
└──────┬──────┘            │                   │
       │                   │                   │
       │            ┌──────▼──────┐            │
       │            │    Song     │◄───────────┘
       │            ├─────────────┤
       │            │ id          │
       │            │ title       │
       │            │ audio       │
       │            │ duration    │
       │            │ listenCount │
       │            │ likeCount   │
       │            │ singerId    │
       │            │ topicId     │
       │            └──────┬──────┘
       │                   │
       ├───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Playlist   │    │  Favorite   │    │  Listening  │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

UNLICENSED - Private project

---

## 📞 Support

- **API Documentation**: http://localhost:3002/docs
- **Health Check**: http://localhost:3002/health
- **Email**: support@musicweb.com

---

## 🎯 Roadmap

- [ ] Podcast support
- [ ] Lyrics synchronization
- [ ] Social features (follow, share)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] High-quality audio (FLAC)

---

**Made with ❤️ by MusicWeb Team**
