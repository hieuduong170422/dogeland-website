# Dogeland Web — Build Roadmap

> Bám theo file này để build từng bước. Mỗi phase hoàn thành thì check `[x]`.

---

## Base Template

**Clone từ:** [`ejazahm3d/fullstack-turborepo-starter`](https://github.com/ejazahm3d/fullstack-turborepo-starter)
- 577+ stars, production-tested
- Turborepo + NestJS + Next.js + Prisma + PostgreSQL + Tailwind
- Docker + GitHub Actions có sẵn

```bash
git clone https://github.com/ejazahm3d/fullstack-turborepo-starter.git dogeland-web
cd dogeland-web
pnpm install
```

**Tham khảo thêm UI components:** [`mrgmnn/turbo-starter`](https://github.com/mrgmnn/turbo-starter)
- React 19, Tailwind v4, shadcn/ui pre-configured

---

## Stack chính

| Layer | Tech |
|-------|------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15 (App Router) + Tailwind CSS + shadcn/ui |
| 3D Effects | @react-three/fiber + @react-three/drei (hero section only) |
| Animation | Framer Motion |
| State | TanStack Query (server) + Zustand (UI) + Jotai (scoped) |
| Backend | NestJS + Socket.io |
| ORM | Prisma |
| Database | PostgreSQL (main) + Redis (cache/session/realtime) |
| Auth | JWT access (15m) + Refresh token httpOnly cookie (7d) |
| Password | Argon2id |
| 2FA | otplib (TOTP) |
| Validation | Zod (frontend) + class-validator (backend) |
| Payments | Momo API + VietQR |
| Minecraft sync | AuthMe MySQL → PostgreSQL (polling 5 phút) |
| Backup | Cloudflare R2 (WAL + snapshots) |

---

## Phase 0 — Foundation & Setup

> Mục tiêu: Chạy được `pnpm dev` với cả frontend và backend.

- [x] Clone base template, đổi tên project thành `dogeland`
- [x] Cấu hình `turbo.json`, `pnpm-workspace.yaml`
- [x] Tạo `apps/web` (Next.js 15 App Router)
- [x] Tạo `apps/api` (NestJS)
- [ ] Tạo `packages/shared-types` (TypeScript types dùng chung)
- [ ] Tạo `packages/shared-validation` (Zod schemas dùng chung)
- [x] Setup `docker-compose.yml`:
  - PostgreSQL 16
  - Redis 7
  - AuthMe MySQL 8 (dev mock)
- [x] Setup `.env.example` cho cả `apps/web` và `apps/api`
- [x] Cấu hình Prisma schema đầy đủ, generate client thành công
- [ ] ESLint + Prettier + Husky pre-commit hook
- [x] `pnpm install` — zero errors, TypeScript clean cả web lẫn api
- [ ] Verify: `pnpm dev` chạy cả hai app (cần Docker/PostgreSQL)

**Files quan trọng:**
```
dogeland-web/
├── apps/
│   ├── web/          # Next.js 15
│   └── api/          # NestJS
├── packages/
│   ├── shared-types/
│   └── shared-validation/
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Phase 1 — Database Schema

> Mục tiêu: Toàn bộ Prisma schema chuẩn, migrate thành công.

- [ ] `User` — id, username, email, passwordHash, role, status, deletedAt
- [ ] `AuthMeSync` — sync từ AuthMe MySQL (username, lastSynced)
- [ ] `Session` — refresh token storage
- [ ] `TwoFactor` — secret, backupCodes, enabled
- [ ] `EmailVerification` — token, expiresAt
- [ ] `Transaction` — userId, amount, type, reason, approverId
- [ ] `GiftCode` — code, maxUses, usedCount, expiresAt
- [ ] `GiftCodeRedemption` — userId, giftCodeId
- [ ] `ShopItem` — name, description, price, type (item/rank/crate), serverId
- [ ] `Purchase` — userId, shopItemId, quantity, total
- [ ] `Payment` — userId, amount, method, status, reference
- [ ] `ForumCategory` — name, slug, description
- [ ] `ForumThread` — title, authorId, categoryId, isPinned, isLocked
- [ ] `ForumPost` — content, authorId, threadId
- [ ] `ForumReaction` — userId, postId, type
- [ ] `LeaderboardEntry` — userId, gameMode, stat, value, rank, period
- [ ] `Ticket` — userId, title, type, status, priority
- [ ] `TicketMessage` — ticketId, authorId, content
- [ ] `Notification` — userId, type, title, message, isRead
- [ ] `AuditLog` — userId, action, resourceType, resourceId, data, ip
- [ ] `WikiPage` — slug, title, content, authorId, lastEditedBy
- [ ] Run `prisma migrate dev`, verify schema

---

## Phase 2 — Authentication API (Backend)

> Mục tiêu: Toàn bộ auth flow hoạt động qua API.

- [ ] `POST /auth/register` — validate, hash Argon2id, gửi email xác minh
- [ ] `GET /auth/verify-email?token=` — verify token + expiry
- [ ] `POST /auth/login` — CAPTCHA check, validate, check ban/mute, tạo JWT pair
- [ ] `POST /auth/refresh` — đọc httpOnly cookie, rotate refresh token
- [ ] `POST /auth/logout` — clear cookie
- [ ] `POST /auth/forgot-password` — gửi reset email (limit 3 giờ)
- [ ] `POST /auth/reset-password` — validate token, update hash
- [ ] `POST /auth/2fa/setup` — generate TOTP secret + QR code
- [ ] `POST /auth/2fa/verify-setup` — xác nhận mã 6 số, enable 2FA
- [ ] `POST /auth/2fa/validate` — validate TOTP khi login
- [ ] `POST /auth/2fa/disable` — cần verify 2 yếu tố khác
- [ ] `GET /auth/me` — trả về current user
- [ ] Idle timeout 15 phút — invalidate session
- [ ] Remember me — session kéo dài 10 ngày
- [ ] Rate limit: 5 attempts/15min trên auth endpoints
- [ ] Guard: `JwtAuthGuard`, `RolesGuard` (PLAYER / MOD / ADMIN)
- [ ] AuthMe MySQL sync job — polling 5 phút, upsert vào `AuthMeSync`

---

## Phase 3 — Authentication UI (Frontend)

> Mục tiêu: Người dùng đăng ký, login, verify email được trên web.

- [ ] Layout `(auth)` — không có navbar chính
- [ ] Trang `/register` — form + hCaptcha + validation
- [ ] Trang `/login` — form + hCaptcha + remember me checkbox
- [ ] Trang `/verify-email` — hiển thị trạng thái verify
- [ ] Trang `/forgot-password`
- [ ] Trang `/reset-password?token=`
- [ ] Flow 2FA — modal nhập mã 6 số sau login
- [ ] Trang `/settings/2fa` — setup QR code, xem backup codes
- [ ] `useAuth` hook — TanStack Query + Zustand cho auth state
- [ ] Axios interceptor — tự động refresh access token khi 401
- [ ] Protect routes — redirect `/login` nếu chưa auth
- [ ] Toast notifications cho success/error states

---

## Phase 4 — Core Layout & Design System

> Mục tiêu: Layout chuẩn, dark theme, navigation responsive.

- [ ] Install shadcn/ui, cấu hình theme màu Minecraft (xanh/vàng/tối)
- [ ] `components/ui/` — Button, Card, Dialog, Input, Badge, Avatar, Tabs, Tooltip
- [ ] `Header` server component — logo, nav links, user avatar/login button
- [ ] `Navigation` client component — active states, mobile hamburger menu
- [ ] `Footer` — links, social media, server IP
- [ ] Sidebar layout cho account pages
- [ ] Dark mode toggle (Zustand + localStorage persist)
- [ ] Responsive breakpoints: mobile / tablet / desktop
- [ ] Loading skeleton components
- [ ] Error boundary + 404 page
- [ ] Framer Motion page transitions

---

## Phase 5 — Home Page

> Mục tiêu: Landing page ấn tượng, hiển thị server info.

- [ ] Hero section — Three.js particle/terrain effect, server IP nổi bật, CTA "Join Now"
- [ ] Server status widget — realtime online players (WebSocket)
- [ ] Game modes showcase — grid cards với icon + mô tả
- [ ] News/Announcements section — latest 3 bài từ forum
- [ ] Leaderboard preview — top 5 players
- [ ] Store CTA banner
- [ ] Social links (Discord, Facebook, YouTube)
- [ ] SEO: metadata, Open Graph, structured data
- [ ] Optimize: Three.js lazy load, image optimization

---

## Phase 6 — Player Profile & Economy

> Mục tiêu: Profile đầy đủ, xem Dogecoin balance, transaction history.

- [ ] `GET /users/:username` — public profile API
- [ ] `GET /users/me/balance` — current balance
- [ ] `GET /users/me/transactions` — paginated history
- [ ] `POST /economy/transfer` — cần supervisor approve
- [ ] `POST /economy/redeem-giftcode` — validate + redeem
- [ ] Admin: `POST /economy/admin/adjust` — cộng/trừ coin (role: ADMIN)
- [ ] Trang `/profile/:username` — avatar, stats, rank badge
- [ ] Trang `/dashboard` — balance, transaction history, giftcode form
- [ ] Giftcode: tạo trong admin panel, nhập trong dashboard

---

## Phase 7 — Store

> Mục tiêu: Người dùng mua item/rank, trừ Dogecoin.

- [ ] `GET /shop/items` — list items, filter by type/server
- [ ] `POST /shop/purchase` — validate balance, create purchase, trừ coin
- [ ] `GET /shop/purchases/me` — purchase history
- [ ] Admin: `POST /shop/items` — tạo/sửa/xóa items
- [ ] Trang `/store` — grid items, filter sidebar, cart
- [ ] Item detail modal
- [ ] Rank selector — chọn server khi mua rank
- [ ] Purchase confirmation dialog
- [ ] Server log entry sau mỗi purchase

---

## Phase 8 — Payment Integration

> Mục tiêu: Nạp tiền qua Momo và QR banking, cộng Dogecoin tự động.

- [ ] Tích hợp **VietQR API** — generate QR code tự động
- [ ] Tích hợp **Momo Payment API** — link pay
- [ ] Webhook handler — nhận callback, verify signature
- [ ] `Payment` state machine: PENDING → SUCCESS / FAILED
- [ ] Tỉ giá VNĐ → Dogecoin (config trong admin)
- [ ] Trang `/dashboard/deposit` — chọn method, nhập số tiền, hiển thị QR
- [ ] Realtime — WebSocket notify khi payment confirmed
- [ ] Audit log mọi payment transaction
- [ ] Rate limit: 10 requests/minute per user

---

## Phase 9 — Leaderboard

> Mục tiêu: Bảng xếp hạng realtime theo từng game mode.

- [ ] `GET /leaderboard` — query by gameMode, period (weekly/monthly/alltime)
- [ ] Background job — sync stats từ Minecraft server (RCON hoặc plugin API)
- [ ] Redis Sorted Set — cache leaderboard data (DB4)
- [ ] Socket.io — broadcast update khi rank thay đổi
- [ ] Trang `/leaderboards` — filter tabs, animated table
- [ ] Player rank card — avatar, stats, highlight top 3
- [ ] Pagination — infinite scroll

---

## Phase 10 — Forum

> Mục tiêu: Forum cộng đồng đầy đủ.

- [ ] `GET /forum/categories`
- [ ] `GET /forum/threads?categoryId=&page=`
- [ ] `POST /forum/threads` — tạo thread (cần auth)
- [ ] `GET /forum/threads/:id` — chi tiết + posts
- [ ] `POST /forum/posts` — reply
- [ ] `POST /forum/reactions` — react (like/dislike)
- [ ] `PATCH /forum/threads/:id` — pin/lock (MOD role)
- [ ] Trang `/forums` — category list
- [ ] Trang `/forums/:category` — thread list
- [ ] Trang `/forums/thread/:id` — posts, reply editor
- [ ] Rich text editor (Tiptap)
- [ ] Search forum (full-text PostgreSQL)
- [ ] Notification khi có reply

---

## Phase 11 — Wiki & Rules

> Mục tiêu: Wiki editable, Rules page static.

- [ ] `GET /wiki/:slug` — read wiki page
- [ ] `PUT /wiki/:slug` — edit (MOD role)
- [ ] `POST /wiki` — tạo page mới (MOD role)
- [ ] Trang `/wiki` — index page, danh sách articles
- [ ] Trang `/wiki/:slug` — nội dung + edit history
- [ ] Trang `/rules` — static page, versioned
- [ ] Markdown rendering (MDX hoặc Tiptap output)

---

## Phase 12 — Support Tickets

> Mục tiêu: Người chơi tạo ticket, admin reply, track trạng thái.

- [ ] `POST /tickets` — tạo ticket (bug/ban-appeal/billing/general)
- [ ] `GET /tickets/me` — danh sách ticket của user
- [ ] `GET /tickets/:id` — chi tiết + messages
- [ ] `POST /tickets/:id/messages` — gửi tin nhắn
- [ ] `PATCH /tickets/:id/status` — close/open (ADMIN)
- [ ] Admin: `GET /tickets` — all tickets, filter by status/type
- [ ] Trang `/support` — create ticket form, ticket list
- [ ] Trang `/support/:id` — thread chat view
- [ ] Email notification khi có reply mới
- [ ] Auto-assign ticket cho MOD available

---

## Phase 13 — Admin Panel

> Mục tiêu: ADMIN quản lý toàn bộ hệ thống.

- [ ] Layout `/admin` — protected route, ADMIN only
- [ ] Dashboard — stats: tổng users, revenue, active tickets
- [ ] User management — search, ban/mute/unban, reset password, change role
- [ ] Transaction management — view, approve coin adjustments
- [ ] Shop management — CRUD items, set tỉ giá
- [ ] Giftcode management — tạo batch, xem redemption history
- [ ] Payment history — filter, export CSV
- [ ] Server log viewer
- [ ] Audit log viewer — filter by action/user
- [ ] Forum moderation — pin/lock/delete threads

---

## Phase 14 — Realtime & Notifications

> Mục tiêu: Bell notifications, realtime updates khắp site.

- [ ] `NotificationsGateway` — Socket.io namespace `/notifications`
- [ ] JWT auth cho WebSocket connections
- [ ] Events: `notification`, `leaderboard-update`, `server-status`, `payment-confirmed`
- [ ] Bell icon ở header — badge count, dropdown list
- [ ] Mark as read — single + mark all
- [ ] Email notifications — verify email, payment, ticket reply
- [ ] Push notification (optional, sau này)

---

## Phase 15 — Polish & Launch

> Mục tiêu: Production-ready.

- [x] Discord integration — link account, role sync webhook
- [x] Vote system — /vote page với voting sites + phần thưởng
- [x] Server status page — /status với TPS, ping, player count realtime
- [x] SEO audit — sitemap.xml, robots.ts, security headers, meta tags
- [ ] Performance audit — Lighthouse 90+
- [x] Security audit — OWASP headers (X-Frame-Options, CSP, etc.)
- [x] Settings page — /settings/profile, /settings/security
- [x] CI/CD pipeline (GitHub Actions) — ci.yml + deploy.yml
- [x] Dockerfiles — API + Web (multi-stage, pnpm, Node 20)
- [x] docker-compose.prod.yml — Traefik + Let's Encrypt
- [ ] Backup automation — Cloudflare R2 + pg_dump cron
- [ ] Monitoring — Prometheus + Grafana (hoặc BetterUptime)
- [ ] Load testing — k6

---

## Quy tắc khi build

1. **Mỗi phase = 1 PR** — không mix nhiều phase vào 1 commit
2. **API trước, UI sau** — backend endpoint xong mới làm frontend
3. **Test khi làm** — không để dồn test về cuối
4. **Migration cẩn thận** — luôn backup DB trước khi migrate production
5. **Không hardcode** — secrets vào `.env`, không commit `.env`
6. **Immutable data** — không mutate object, luôn return new copy

---

## Quick Commands

```bash
# Dev
pnpm dev                          # chạy cả web + api

# Database
pnpm --filter api prisma:migrate  # tạo migration mới
pnpm --filter api prisma:studio   # mở Prisma Studio

# Docker
docker-compose up -d              # start PostgreSQL + Redis
docker-compose down               # stop

# Build
pnpm build                        # build tất cả apps

# Test
pnpm test                         # chạy tất cả tests
```

---

## Progress

| Phase | Tên | Trạng thái |
|-------|-----|-----------|
| 0 | Foundation & Setup | ✅ Done |
| 1 | Database Schema | ✅ Done — schema push + Prisma client generated |
| 2 | Authentication API | ✅ Done — register, login, 2FA, email verify, JWT rotate |
| 3 | Authentication UI | ✅ Done — login, register, verify-email, forgot/reset, middleware |
| 4 | Core Layout & Design System | ✅ Done — Header, Footer, Navigation, UI primitives, 404, middleware |
| 5 | Home Page | ✅ Done — Hero 3D, server stats, game modes, features, join CTA |
| 6 | Player Profile & Economy | ✅ Done — player profile page, dashboard, transactions, gift code redeem |
| 7 | Store | ⬜ |
| 8 | Payment Integration | ⬜ |
| 9 | Leaderboard | ⬜ |
| 10 | Forum | ⬜ |
| 11 | Wiki & Rules | ⬜ |
| 12 | Support Tickets | ⬜ |
| 13 | Admin Panel | ⬜ |
| 14 | Realtime & Notifications | ⬜ |
| 15 | Polish & Launch | 🟡 In progress |
