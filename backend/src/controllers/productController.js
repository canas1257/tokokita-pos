import { z } from 'zod';
import { prisma } from '../config/database.js';
import { asyncHandler, ok, AppError } from '../utils/http.js';
import { broadcast } from '../socket/socketHandler.js';

const money = z.coerce.number().nonnegative('Harga tidak boleh negatif').max(999999999999);
export const productIdSchema = z.object({ body: z.any(), query: z.object({}).passthrough(), params: z.object({ id: z.string().uuid('ID produk tidak valid') }) });
export const priceSchema = z.object({
  body: z.object({ selling_price: money, cost_price: money }), query: z.object({}).passthrough(), params: z.object({ id: z.string().uuid() })
});

const serializeProduct = (p) => ({
  id: p.id, barcode: p.barcode, name: p.name, cost_price: Number(p.costPrice),
  selling_price: Number(p.sellingPrice), stock: p.stock, min_stock_alert: p.minStockAlert,
  stock_status: p.stock === 0 ? 'OUT' : p.stock <= p.minStockAlert ? 'LOW' : 'OK', updated_at: p.updatedAt
});

export const getProducts = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').slice(0, 100);
  const products = await prisma.product.findMany({
    where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { barcode: { contains: search } }] } : undefined,
    orderBy: { name: 'asc' }, take: 500
  });
  return ok(res, products.map(serializeProduct));
});

export const updatePrice = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const { selling_price: sellingPrice, cost_price: costPrice } = req.validated.body;
  const product = await prisma.$transaction(async (tx) => {
    const current = await tx.product.findUnique({ where: { id } });
    if (!current) throw new AppError('Produk tidak ditemukan', 404);
    const updated = await tx.product.update({ where: { id }, data: { sellingPrice, costPrice } });
    await tx.priceHistory.create({ data: {
      productId: id, oldSellingPrice: current.sellingPrice, newSellingPrice: sellingPrice,
      oldCostPrice: current.costPrice, newCostPrice: costPrice, changedBy: req.user.id
    } });
    return updated;
  });
  const data = serializeProduct(product);
  broadcast(req, 'product:price-updated', data);
  return ok(res, data);
});
