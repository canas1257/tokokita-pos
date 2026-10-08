import { z } from 'zod';
import { prisma } from '../config/database.js';
import { AppError, asyncHandler, ok } from '../utils/http.js';
import { broadcast } from '../socket/socketHandler.js';

export const stockInSchema = z.object({
  body: z.object({ product_id: z.string().uuid('Produk tidak valid'), quantity: z.coerce.number().int().positive('Jumlah harus lebih dari 0').max(100000), notes: z.string().trim().max(500).optional().default('Barang masuk') }),
  query: z.object({}).passthrough(), params: z.object({}).passthrough()
});

export const stockIn = asyncHandler(async (req, res) => {
  const { product_id: productId, quantity, notes } = req.validated.body;
  const product = await prisma.$transaction(async (tx) => {
    const exists = await tx.product.findUnique({ where: { id: productId } });
    if (!exists) throw new AppError('Produk tidak ditemukan', 404);
    const updated = await tx.product.update({ where: { id: productId }, data: { stock: { increment: quantity } } });
    await tx.stockMovement.create({ data: { productId, type: 'IN', quantity, notes, userId: req.user.id } });
    return updated;
  });
  const data = { product_id: product.id, stock: product.stock, updated_at: product.updatedAt };
  broadcast(req, 'inventory:stock-updated', data);
  return ok(res, data, 201);
});
