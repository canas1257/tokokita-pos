import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin123!', 12);
  const cashierPassword = await bcrypt.hash(process.env.SEED_CASHIER_PASSWORD || 'Kasir123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@tokokita.id' },
    update: {},
    create: { name: 'Pemilik Toko', email: 'admin@tokokita.id', passwordHash: adminPassword, role: 'ADMIN' }
  });
  await prisma.user.upsert({
    where: { email: 'kasir@tokokita.id' },
    update: {},
    create: { name: 'Kasir Utama', email: 'kasir@tokokita.id', passwordHash: cashierPassword, role: 'CASHIER' }
  });

  const products = [
    ['899999900001', 'Beras Premium 5 kg', 67500, 75000, 12, 5],
    ['899999900002', 'Minyak Goreng 1 L', 15300, 17500, 24, 8],
    ['899999900003', 'Gula Pasir 1 kg', 16000, 18000, 7, 6],
    ['899999900004', 'Mi Instan Goreng', 2800, 3500, 48, 12],
    ['899999900005', 'Air Mineral 600 ml', 2300, 3500, 4, 8],
    ['899999900006', 'Kopi Sachet', 1700, 2500, 0, 10]
  ];
  for (const [barcode, name, costPrice, sellingPrice, stock, minStockAlert] of products) {
    await prisma.product.upsert({
      where: { barcode }, update: {},
      create: { barcode, name, costPrice, sellingPrice, stock, minStockAlert }
    });
  }
  console.log('Seed selesai. Login admin@tokokita.id / Admin123!');
}

main().finally(() => prisma.$disconnect());
