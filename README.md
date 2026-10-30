# WDS Food Delivery

Ứng dụng đặt đồ ăn trực tuyến (Food Delivery) cho khóa học Web Dev Studios (Buổi 1–3).

## Cách chạy dự án

Cài đặt dependencies và khởi chạy môi trường phát triển:

```bash
pnpm i
pnpm dev
```

Hoặc sử dụng câu lệnh đầy đủ:

```bash
pnpm install
pnpm dev
```

Mở trình duyệt tại `http://localhost:3000`.

## Các lệnh kiểm thử & build

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Chạy bằng Docker Compose

Sao chép file biến môi trường mẫu và khởi chạy cả `web` (Next.js production server) cùng `postgres`:

```bash
cp .env.example .env && docker compose up -d
```

Ứng dụng sẽ chạy tại `http://localhost:3000`. Để dừng các container:

```bash
docker compose down
```
