# TokoKita POS

MVP aplikasi kasir real-time untuk toko kelontong/retail mandiri. Monorepo berisi React SPA, Express API, Socket.IO, Prisma, dan PostgreSQL.

## Fitur

- Login JWT dan pembatasan peran `ADMIN` / `CASHIER`.
- POS cepat dengan pencarian/barcode, keranjang, validasi stok, pembayaran tunai, kembalian, dan shortcut keyboard.
- Checkout atomik dengan isolation level `Serializable`, pencatatan pergerakan stok, dan snapshot harga modal untuk laporan laba yang akurat.
- Struk thermal 80 mm dengan stylesheet cetak khusus.
- Inline edit harga beli/jual beserta audit `price_histories`.
- Stock-in transaksional dengan audit `stock_movements`.
- Dashboard dan laporan omzet/laba kotor real-time; ekspor CSV UTF-8.
- Sinkronisasi stok, harga, dan penjualan melalui Socket.IO.

## Menjalankan secara lokal

Prasyarat: Node.js 20+, npm, Docker/Podman (atau PostgreSQL 16 yang sudah berjalan).

```bash
docker compose up -d

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Pada terminal kedua:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`. Akun seed:

| Peran | Email | Password |
|---|---|---|
| Admin | `admin@tokokita.id` | `Admin123!` |
| Kasir | `kasir@tokokita.id` | `Kasir123!` |

Ganti password seed untuk penggunaan nyata melalui `SEED_ADMIN_PASSWORD` dan `SEED_CASHIER_PASSWORD` sebelum menjalankan seed.

## Shortcut POS

| Tombol | Fungsi |
|---|---|
| `/` | Fokus kolom pencarian |
| `↑` / `↓` | Navigasi hasil produk |
| `Enter` | Tambah produk / buka pembayaran / konfirmasi pembayaran |
| `Esc` | Tutup pembayaran atau kosongkan transaksi |

## Pengujian

```bash
cd backend && npm test
cd ../frontend && npm run lint && npm run build
```

Verifikasi manual yang disarankan:

1. Buka dua tab browser, lakukan checkout di tab pertama, lalu pastikan stok/dashboard tab kedua berubah tanpa refresh.
2. Coba checkout dengan stok melebihi ketersediaan; API harus menolak tanpa mengubah order maupun stok.
3. Edit harga produk, lalu cek bahwa harga baru muncul pada tab lain dan record audit tersimpan.
4. Cetak receipt dan pilih kertas thermal 80 mm; gunakan scale 100% dan margin default/none.

## API

Semua endpoint kecuali login/health membutuhkan `Authorization: Bearer <token>`.

| Method | Endpoint | Peran |
|---|---|---|
| POST | `/api/auth/login` | Publik |
| GET | `/api/products` | Admin, Kasir |
| PATCH | `/api/products/:id/price` | Admin |
| POST | `/api/inventory/stock-in` | Admin |
| POST | `/api/orders` | Admin, Kasir |
| GET | `/api/orders/:id` | Admin, Kasir |
| GET | `/api/reports/sales-summary` | Admin |
| GET | `/api/reports/export-csv` | Admin |

Respons sukses: `{ "success": true, "data": ... }`. Respons gagal: `{ "success": false, "message": "..." }`.

## Deploy ke Railway

Buat satu project Railway dengan PostgreSQL plugin dan dua service dari monorepo ini.

### Backend

- Root directory: `/backend`
- Build/start diambil dari `backend/railway.json`.
- Variabel wajib: `DATABASE_URL` (reference dari PostgreSQL), `JWT_SECRET`, `CORS_ORIGIN` (URL frontend), `NODE_ENV=production`.
- `PORT` disediakan otomatis Railway.

### Frontend

- Root directory: `/frontend`
- Variabel build: `VITE_API_URL=https://<backend-domain>/api` dan `VITE_WS_URL=https://<backend-domain>`.
- Setelah domain frontend terbentuk, masukkan URL persisnya ke `CORS_ORIGIN` backend lalu redeploy backend.

Catatan: variabel `VITE_*` dibundel saat build. Jika URL backend berubah, frontend harus dibangun ulang.

## Struktur

Struktur folder mengikuti PRD: controller, route, middleware, socket, context, services, serta halaman POS dan admin dipisahkan. Field database memakai `snake_case` melalui mapping Prisma, sedangkan kode JavaScript memakai `camelCase`/`PascalCase`.

## Keamanan dan konsistensi data

- Password bcrypt 12 rounds, JWT 12 jam, Helmet, rate limiting login, JSON body limit, dan allowlist CORS.
- Semua mutasi stok/harga dibungkus `prisma.$transaction`.
- Checkout membaca harga server, memvalidasi harga kiriman, dan decrement stok bersyarat dalam transaksi serializable.
- Harga modal disalin ke `order_items.cost_price`, sehingga laba historis tidak berubah ketika modal produk diedit kemudian.
- Jangan commit `.env`; seluruh secret dan URL berasal dari environment variables.
