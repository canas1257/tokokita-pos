import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';
import { calculateChange, generateInvoiceNumber } from '../utils/calculations.js';
import { broadcast } from '../socket/socketHandler.js';

export const orderSchema = z.object({
  body: z.object({
    items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.coerce.number().int().positive().max(10000), unit_price: z.coerce.number().positive() })).min(1, 'Keranjang masih kosong').max(100),
    paid_amount: z.coerce.number().nonnegative()
  }), query: z.object({}).passthrough(), params: z.object({}).passthrough()
});
export const orderIdSchema = z.object({ body: z.any(), query: z.object({}).passthrough(), params: z.object({ id: z.string().uuid('ID transaksi tidak valid') }) });

const serializeOrder = (order) => ({
  id: order.id, invoice_number: order.invoiceNumber, total_amount: Number(order.totalAmount), paid_amount: Number(order.paidAmount),
  change_amount: Number(order.changeAmount), status: order.status, created_at: order.createdAt,
  cashier: order.cashier && { id: order.cashier.id, name: order.cashier.name },
  items: order.items?.map(i => ({ id: i.id, product_id: i.productId, product_name: i.product?.name, barcode: i.product?.barcode, quantity: i.quantity, unit_price: Number(i.unitPrice), subtotal: Number(i.subtotal) }))
});

export const createOrder = asyncHandler(async (req, res) => {
  const input = req.validated.body;
  const ids = [...new Set(input.items.map(i => i.product_id))];
  if (ids.length !== input.items.length) throw new AppError('Produk duplikat harus digabungkan dalam satu item');

  const order = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({ where: { id: { in: ids } } });
    if (products.length !== ids.length) throw new AppError('Satu atau lebih produk tidak ditemukan', 404);
    const productMap = new Map(products.map(p => [p.id, p]));
    let total = 0;
    for (const item of input.items) {
      const product = productMap.get(item.product_id);
      if (product.stock < item.quantity) throw new AppError(`Stok ${product.name} tidak cukup (tersisa ${product.stock})`, 409);
      if (Number(product.sellingPrice) !== Number(item.unit_price)) throw new AppError(`Harga ${product.name} berubah. Muat ulang produk.`, 409);
      total += item.quantity * Number(product.sellingPrice);
    }
    const change = calculateChange(total, input.paid_amount);
    const created = await tx.order.create({ data: {
      invoiceNumber: generateInvoiceNumber(), totalAmount: total, paidAmount: input.paid_amount, changeAmount: change,
      cashierId: req.user.id, items: { create: input.items.map(item => ({
        productId: item.product_id, quantity: item.quantity, unitPrice: item.unit_price,
        costPrice: productMap.get(item.product_id).costPrice, subtotal: item.quantity * item.unit_price
      })) }
    } });
    for (const item of input.items) {
      const changed = await tx.product.updateMany({ where: { id: item.product_id, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (changed.count !== 1) throw new AppError('Stok berubah saat checkout. Silakan ulangi.', 409);
      await tx.stockMovement.create({ data: { productId: item.product_id, type: 'OUT', quantity: item.quantity, notes: `Penjualan ${created.invoiceNumber}`, userId: req.user.id } });
    }
    return tx.order.findUnique({ where: { id: created.id }, include: { cashier: { select: { id: true, name: true } }, items: { include: { product: true } } } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  broadcast(req, 'order:created', { order_id: order.id, invoice_number: order.invoiceNumber, total_amount: Number(order.totalAmount), created_at: order.createdAt });
  broadcast(req, 'inventory:refresh', { product_ids: ids });
  return ok(res, serializeOrder(order), 201);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.validated.params.id }, include: { cashier: { select: { id: true, name: true } }, items: { include: { product: true } } } });
  if (!order) throw new AppError('Transaksi tidak ditemukan', 404);
  return ok(res, serializeOrder(order));
});
