import { describe, expect, it } from 'vitest';
import { calculateChange, calculateGrossProfit, calculateSubtotal } from '../src/utils/calculations.js';

describe('kalkulasi transaksi', () => {
  it('menghitung subtotal', () => expect(calculateSubtotal(3, 3500)).toBe(10500));
  it('menghitung kembalian', () => expect(calculateChange(17500, 20000)).toBe(2500));
  it('menolak pembayaran kurang', () => expect(() => calculateChange(21000, 20000)).toThrow('Pembayaran kurang'));
  it('menghitung margin laba', () => expect(calculateGrossProfit([{ unitPrice: 5000, costPrice: 3500, quantity: 4 }])).toBe(6000));
});
