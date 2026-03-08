# MusicBox Project Guidelines

Tài liệu này quy định các tiêu chuẩn về kiến trúc, phong cách lập trình và giao diện (UI/UX) cho dự án MusicBox. Mọi tính năng mới hoặc thay đổi phải tuân thủ nghiêm ngặt các quy tắc này.

## 1. Kiến trúc tổng thể
- **Backend**: NestJS, Prisma ORM, JWT Authentication. API versioning `/api/v1`.
- **Frontend**: Next.js (App Router), TypeScript.
- **State Management**: Sử dụng React Context API (Ví dụ: `PlayerContext` cho trình phát nhạc).
- **Styling**: Sử dụng Vanilla CSS và CSS Variables (quy định tại `globals.css`). **KHÔNG** sử dụng TailwindCSS.

## 2. Tiêu chuẩn Giao diện (UI/UX Patterns)

### 2.1. Quy tắc hiển thị dữ liệu
- **Bài hát (Songs)**: Luôn hiển thị ở dạng **Danh sách (List format)**.
  - Sử dụng class `.song-list` và `.song-list-item`.
  - Hiển thị đầy đủ: Số thứ tự (hoặc Equalizer khi active), Ảnh (square), Thông tin (Tên bài - Nghệ sĩ), Lượt nghe, Thời lượng.
- **Nghệ sĩ (Singers)**: Luôn hiển thị ở dạng **Lưới vuông (Square Grid)**.
  - Sử dụng class `.songs-grid`.
  - Ảnh đại diện nghệ sĩ phải sử dụng `borderRadius: var(--radius-lg)` (hoặc `var(--radius-xl)` cho banner).
  - Ở trang danh sách, ưu tiên giao diện tối giản (chỉ hiện avatar, hiện tên khi hover).
- **Chủ đề (Topics)**: Giữ nguyên dạng Grid thẻ bài như thiết kế ban đầu.

### 2.2. Trạng thái bài hát đang phát (Active State)
- Tuyệt đối **KHÔNG** sử dụng viền đỏ (border) ở cạnh trái.
- Cấu hình style active:
  - `background: rgba(233, 69, 96, 0.1)` (Hồng nhạt đặc trưng của dự án).
  - Tên bài hát: `color: var(--accent)` và `fontWeight: 700`.
  - Rank/Số thứ tự: Thay bằng `<i className="bx bx-equalizer bx-tada"></i>`.

### 2.3. Routing & Naming
- Sử dụng danh từ số ít cho các route chi tiết: `/singer/[id]`, `/topic/[slug]`, `/playlist/[id]`.
- API Call: Luôn khai báo và sử dụng thông qua `frontend/src/lib/api.ts`.

## 3. Quy tắc Code (Coding Standards)

### 3.1. Frontend
- **Components**: Chia nhỏ component vào `src/components`. Các trang client-side nằm trong `(client)`.
- **Images**: Sử dụng thẻ `<img>` với `objectFit: 'cover'`. Luôn có placeholder (icon `bx-music` hoặc `bx-user`) khi ảnh bị lỗi hoặc không có.
- **Formatters**: Sử dụng hàm `formatListens` cho số lượt nghe và `formatDuration` cho thời gian bài hát.
- **Icons**: Sử dụng duy nhất bộ thư viện **Boxicons** (`bx`, `bxs`).

### 3.2. Backend
- **Prisma**: Luôn sử dụng `include` để fetch các quan hệ liên quan (singer, topic) nhằm tránh query nhiều lần.
- **DTO**: Luôn định nghĩa DTO cho dữ liệu đầu vào và validate bằng `class-validator`.
- **Soft Delete**: Sử dụng field `deleted: true` thay vì xóa vật lý dữ liệu.

## 4. Nguyên tắc làm việc của AI
1. **Nghiên cứu trước**: Trước khi tạo file mới, phải xem các file tương đương (ví dụ: muốn làm trang Topic thì xem trang Singer).
2. **Đồng nhất style**: Copy các inline-style hoặc class CSS từ các trang đã hoàn thiện để đảm bảo không lệch tone màu hoặc spacing.
3. **Tính năng**: Khi thêm bài hát vào list, phải luôn gán `onClick={() => { setPlaylist(list); play(song); }}` để trình phát nhạc hoạt động.
4. **Link**: Mọi chỗ hiện tên ca sĩ đều phải bọc trong `<Link href={`/singer/${singer.id}`}>`.
