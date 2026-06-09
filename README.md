# Dogeland — Minecraft Server Web Platform

Website chính thức cho Dogeland Minecraft Server. Bao gồm bảng xếp hạng, diễn đàn, wiki, cửa hàng in-game, hệ thống nạp xu, ticket hỗ trợ và admin panel.

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, shadcn/ui |
| Backend | NestJS 10, Prisma ORM, PostgreSQL |
| Cache / Realtime | Redis, Socket.IO |
| Auth | JWT (access token 15m) + Refresh token (httpOnly cookie) |
| Monorepo | Turborepo + pnpm workspaces |
| Deploy | Docker + Docker Compose + Traefik (TLS tự động) |

---

## Yêu cầu trước khi bắt đầu

| Tool | Phiên bản tối thiểu | Cài đặt |
|------|---------------------|---------|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9+ | `npm install -g pnpm` |
| Docker Desktop | bất kỳ | https://docker.com/products/docker-desktop |
| Git | bất kỳ | https://git-scm.com |

---

## Cài đặt & Chạy local

### Bước 1 — Clone repo

```bash
git clone https://github.com/hieuduong170422/dogeland-website.git
cd dogeland-website
```

### Bước 2 — Cài dependencies

```bash
pnpm install
```

### Bước 3 — Khởi động database (PostgreSQL + Redis)

```bash
docker compose up -d
```

Lệnh này chạy 3 service:
- `dogeland_postgres` — PostgreSQL 16 tại port `5432`
- `dogeland_redis` — Redis 7 tại port `6379`
- `dogeland_authme_mysql` — MySQL 8 tại port `3306` (mock Minecraft AuthMe DB)

Kiểm tra đã chạy xong:

```bash
docker compose ps
```

Tất cả service phải ở trạng thái `healthy`.

### Bước 4 — Tạo file .env cho API

```bash
cp apps/api/.env.example apps/api/.env
```

File `.env` mặc định đã khớp với docker-compose, không cần sửa gì để chạy local. Nếu muốn bật thêm tính năng:

```env
# Email (cần để test verify email / quên mật khẩu)
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password   # Gmail App Password (không phải mật khẩu Gmail)

# Discord OAuth (tùy chọn)
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
```

### Bước 5 — Tạo file .env cho Web

```bash
cp apps/web/.env.example apps/web/.env.local
```

Nội dung mặc định đã sẵn sàng cho local:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

### Bước 6 — Chạy migration database

```bash
pnpm db:migrate
```

Lệnh này tạo toàn bộ bảng trong PostgreSQL và generate Prisma client. Chỉ cần chạy một lần (hoặc mỗi khi có migration mới).

### Bước 7 — Khởi động app

```bash
pnpm dev
```

Turborepo chạy song song API và Web:

| Service | URL |
|---------|-----|
| Web (Next.js) | http://localhost:3000 |
| API (NestJS) | http://localhost:4000/api/v1 |
| Prisma Studio | http://localhost:5555 (chạy riêng bên dưới) |

Mở Prisma Studio để xem/sửa database qua UI:

```bash
pnpm db:studio
```

---

## Tạo tài khoản Admin

Sau khi register tài khoản qua UI, đổi role thành ADMIN:

**Cách 1 — Prisma Studio:**

```bash
pnpm db:studio
```

Vào bảng `User` → tìm user → đổi `role` từ `PLAYER` thành `ADMIN` → Save changes.

**Cách 2 — SQL trực tiếp:**

```bash
docker exec -it dogeland_postgres psql -U dogeland -d dogeland \
  -c "UPDATE \"User\" SET role = 'ADMIN' WHERE username = 'your_username';"
```

---

## Seed dữ liệu mẫu (Shop)

Thêm 3 item mẫu vào cửa hàng:

```bash
docker exec -it dogeland_postgres psql -U dogeland -d dogeland -c "
INSERT INTO \"ShopItem\" (name, description, price, type, \"sortOrder\", \"soldCount\", \"isActive\", \"createdAt\", \"updatedAt\")
VALUES
  ('VIP Rank', 'Rank VIP với đặc quyền 30 ngày: /fly, /heal, 3 home, prefix [VIP]', 5000, 'RANK', 0, 0, true, NOW(), NOW()),
  ('Mystery Crate', 'Hộp bí ẩn chứa item ngẫu nhiên: có thể là weapon rare, potion, hoặc xu thưởng', 1000, 'CRATE', 1, 0, true, NOW(), NOW()),
  ('Netherite Sword', 'Kiếm Netherite +Sharpness V, +Fire Aspect II, +Looting III được enchant sẵn', 2000, 'ITEM', 2, 0, true, NOW(), NOW())
ON CONFLICT DO NOTHING;
"
```

---

## Cấu trúc project

```
dogeland-website/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── migrations/     # Migration history
│   │   └── src/
│   │       ├── modules/        # Feature modules (auth, shop, forum, economy...)
│   │       ├── common/         # Guards, filters, decorators
│   │       └── config/         # App configuration
│   └── web/                    # Next.js frontend
│       └── src/
│           ├── app/            # App Router pages & layouts
│           ├── components/     # UI components
│           └── lib/            # API clients, Zustand stores, hooks
├── packages/
│   ├── tsconfig/               # Shared TypeScript configs
│   └── ui/                     # Shared component package
├── docker-compose.yml          # Dev: PostgreSQL + Redis + MySQL
├── docker-compose.prod.yml     # Prod: full stack + Traefik TLS
└── turbo.json                  # Turborepo pipeline config
```

---

## Scripts thường dùng

```bash
# Chạy toàn bộ (api + web) ở dev mode
pnpm dev

# Build production
pnpm build

# Chạy lint
pnpm lint

# Database
pnpm db:migrate        # Tạo và chạy migration mới
pnpm db:generate       # Regenerate Prisma client (sau khi sửa schema.prisma)
pnpm db:studio         # Mở Prisma Studio GUI tại localhost:5555

# Chỉ chạy API
pnpm --filter api dev

# Chỉ chạy Web
pnpm --filter web dev
```

---

## Deploy lên server (Production)

### Yêu cầu server

- VPS đã cài Docker + Docker Compose
- Domain đã trỏ A record về IP server
- Ports `80` và `443` mở trên firewall

### Bước 1 — Tạo file .env production

```bash
cp .env.example .env
```

Điền đầy đủ các giá trị bắt buộc:

```env
# Đổi tất cả CHANGE_ME thành giá trị thực
DATABASE_URL=postgresql://dogeland:STRONG_PASSWORD@postgres:5432/dogeland
DB_PASSWORD=STRONG_PASSWORD
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# JWT — tạo random string dài ít nhất 32 ký tự
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# URLs — đổi thành domain thực
FRONTEND_URL=https://dogeland.vn
APP_URL=https://api.dogeland.vn
NEXT_PUBLIC_APP_URL=https://dogeland.vn
NEXT_PUBLIC_API_URL=https://api.dogeland.vn/api/v1

# Email nhận TLS cert từ Let's Encrypt
ACME_EMAIL=admin@dogeland.vn

# Email & Discord (bắt buộc cho production)
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
```

### Bước 2 — Chạy production stack

```bash
docker compose -f docker-compose.prod.yml up -d
```

Traefik tự động cấp và gia hạn TLS certificate qua Let's Encrypt.

### Bước 3 — Chạy migration lần đầu

```bash
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

### Bước 4 — Kiểm tra

```bash
# Xem log của tất cả service
docker compose -f docker-compose.prod.yml logs -f

# Xem log riêng API
docker compose -f docker-compose.prod.yml logs -f api
```

---

## Troubleshooting

**`pnpm db:migrate` báo lỗi connection refused**
→ Docker chưa chạy hoặc postgres chưa healthy. Chạy `docker compose ps` để kiểm tra.

**Port 5432 hoặc 6379 bị conflict**
→ Máy đã có PostgreSQL/Redis chạy sẵn. Dừng service đó hoặc đổi port trong `docker-compose.yml`.

**Web không kết nối được API**
→ Kiểm tra `NEXT_PUBLIC_API_URL` trong `apps/web/.env.local` trỏ đúng `http://localhost:4000/api/v1`.

**`Cannot find module` khi chạy API**
→ Chạy lại `pnpm install` ở root, sau đó `pnpm db:generate`.

---

## Tính năng

- **Auth** — Đăng ký, đăng nhập, xác thực email, quên mật khẩu, 2FA, Discord OAuth
- **Kinh tế** — Hệ thống xu, nạp xu, lịch sử giao dịch, gift code
- **Cửa hàng** — Mua rank/item/crate, lịch sử mua hàng, admin quản lý sản phẩm
- **Bảng xếp hạng** — Top player theo game mode và thời gian
- **Diễn đàn** — Tạo thread, bình luận, upvote/downvote
- **Wiki** — Trang hướng dẫn có editor markdown
- **Ticket hỗ trợ** — Gửi ticket, admin reply, đóng ticket
- **Thông báo realtime** — WebSocket push notification
- **Server status** — Trạng thái và số player online
- **Admin panel** — Quản lý user, shop, gift code, audit log

---

## Liên hệ

- Server IP: `play.dogeland.vn`
- GitHub Issues: https://github.com/hieuduong170422/dogeland-website/issues
