import { z } from 'zod';
import { prisma } from '../config/database.js';
import { asyncHandler, ok } from '../utils/http.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus berformat YYYY-MM-DD');
export const reportSchema = z.object({
  body: z.any(), params: z.object({}).passthrough(), query: z.object({ startDate: dateString.optional(), endDate: dateString.optional() })
}).refine(v => !v.query.startDate || !v.query.endDate || v.query.startDate <= v.query.endDate, { message: 'Rentang tanggal tidak valid' });

const range = (query) => {
  const jakartaToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const start = new Date(`${query.startDate || jakartaToday}T00:00:00.000+07:00`);
  const end = new Date(`${query.endDate || jakartaToday}T23:59:59.999+07:00`);
  return { start, end };
};

const loadOrders = (start, end) => prisma.order.findMany({
  where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
  include: { cashier: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' }
});

export const salesSummary = asyncHandler(async (req, res) => {
  const { start, end } = range(req.validated.query);
  const orders = await loadOrders(start, end);
  const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const grossProfit = orders.reduce((sum, o) => sum + o.items.reduce((itemSum, i) => itemSum + (Number(i.unitPrice) - Number(i.costPrice)) * i.quantity, 0), 0);
  return ok(res, {
    start_date: start, end_date: end, order_count: orders.length, revenue, gross_profit: grossProfit,
    average_order: orders.length ? revenue / orders.length : 0,
    orders: orders.map(o => ({ id: o.id, invoice_number: o.invoiceNumber, total_amount: Number(o.totalAmount), cashier_name: o.cashier.name, item_count: o.items.reduce((n, i) => n + i.quantity, 0), created_at: o.createdAt }))
  });
});

const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
export const exportCsv = asyncHandler(async (req, res) => {
  const { start, end } = range(req.validated.query);
  const orders = await loadOrders(start, end);
  const rows = [['Invoice', 'Tanggal', 'Kasir', 'Produk', 'Qty', 'Harga', 'Subtotal']];
  for (const order of orders) for (const item of order.items) rows.push([
    order.invoiceNumber, order.createdAt.toISOString(), order.cashier.name, item.product.name, item.quantity, Number(item.unitPrice), Number(item.subtotal)
  ]);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="laporan-${start.toISOString().slice(0, 10)}-${end.toISOString().slice(0, 10)}.csv"`);
  res.send(`\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\n')}`);
});
