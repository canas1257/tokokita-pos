export const calculateSubtotal = (quantity, unitPrice) => Number(quantity) * Number(unitPrice);

export const calculateChange = (total, paid) => {
  const change = Number(paid) - Number(total);
  if (change < 0) throw new Error('Pembayaran kurang');
  return change;
};

export const calculateGrossProfit = (items) => items.reduce(
  (sum, item) => sum + (Number(item.unitPrice) - Number(item.costPrice)) * Number(item.quantity), 0
);

export const generateInvoiceNumber = (now = new Date()) => {
  const stamp = now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `INV-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
};
