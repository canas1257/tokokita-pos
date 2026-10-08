import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  product: { id: '11111111-1111-4111-8111-111111111111', barcode: '8990001', name: 'Produk Uji', costPrice: 7000, sellingPrice: 10000, stock: 10, minStockAlert: 2, updatedAt: new Date() },
  movements: [], orders: []
}));

vi.mock('../src/config/database.js', () => {
  const tx = {
    product: {
      findUnique: vi.fn(({ where }) => where.id === fixture.product.id ? { ...fixture.product } : null),
      findMany: vi.fn(() => [{ ...fixture.product }]),
      update: vi.fn(({ data }) => { fixture.product.stock += data.stock.increment; fixture.product.updatedAt = new Date(); return { ...fixture.product }; }),
      updateMany: vi.fn(({ where }) => { if (fixture.product.stock < where.stock.gte) return { count: 0 }; fixture.product.stock -= where.stock.gte; return { count: 1 }; })
    },
    stockMovement: { create: vi.fn(({ data }) => { fixture.movements.push(data); return data; }) },
    order: {
      create: vi.fn(({ data }) => { const order = { id: '22222222-2222-4222-8222-222222222222', ...data, status: 'COMPLETED', createdAt: new Date() }; fixture.orders.push(order); return order; }),
      findUnique: vi.fn(() => { const order = fixture.orders.at(-1); return { ...order, cashier: { id: '33333333-3333-4333-8333-333333333333', name: 'Kasir Uji' }, items: order.items.create.map((item, index) => ({ id: String(index), ...item, product: { ...fixture.product } })) }; })
    }
  };
  return { prisma: { ...tx, $transaction: vi.fn(callback => callback(tx)) } };
});

import { app } from '../src/app.js';

describe('integrasi rute mutasi stok', () => {
  let token;
  beforeEach(() => {
    process.env.JWT_SECRET = 'integration-test-secret';
    fixture.product.stock = 10; fixture.movements.length = 0; fixture.orders.length = 0;
    token = jwt.sign({ id: '33333333-3333-4333-8333-333333333333', role: 'ADMIN', name: 'Kasir Uji' }, process.env.JWT_SECRET);
  });

  it('stock-in menambah stok dan membuat movement IN', async () => {
    const response = await request(app).post('/api/inventory/stock-in').set('Authorization', `Bearer ${token}`).send({ product_id: fixture.product.id, quantity: 5, notes: 'Tes masuk' });
    expect(response.status).toBe(201);
    expect(response.body.data.stock).toBe(15);
    expect(fixture.movements[0]).toMatchObject({ type: 'IN', quantity: 5 });
  });

  it('checkout memotong stok dan membuat movement OUT', async () => {
    const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({ items: [{ product_id: fixture.product.id, quantity: 3, unit_price: 10000 }], paid_amount: 50000 });
    expect(response.status).toBe(201);
    expect(fixture.product.stock).toBe(7);
    expect(response.body.data.change_amount).toBe(20000);
    expect(fixture.movements[0]).toMatchObject({ type: 'OUT', quantity: 3 });
  });

  it('checkout menolak jumlah di atas stok tanpa mutasi', async () => {
    const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({ items: [{ product_id: fixture.product.id, quantity: 11, unit_price: 10000 }], paid_amount: 200000 });
    expect(response.status).toBe(409);
    expect(fixture.product.stock).toBe(10);
    expect(fixture.movements).toHaveLength(0);
  });
});
