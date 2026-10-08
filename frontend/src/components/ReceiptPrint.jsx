import { formatCurrency, formatDateTime } from '../utils/format';
export default function ReceiptPrint({ order }) {
  if (!order) return null;
  return <article className="receipt mx-auto w-[80mm] bg-white p-6 font-mono text-[12px] leading-relaxed text-black">
    <div className="text-center"><h1 className="font-mono text-lg font-bold">TOKOKITA</h1><p>Belanja mudah, harga bersahabat</p><p>Jl. Toko Mandiri No. 1</p></div>
    <div className="my-3 border-y border-dashed border-black py-2"><div className="flex justify-between"><span>{order.invoice_number}</span><span>{formatDateTime(order.created_at)}</span></div><div className="flex justify-between"><span>Kasir</span><span>{order.cashier?.name}</span></div></div>
    <div className="space-y-2">{order.items?.map(item => <div key={item.id}><p>{item.product_name}</p><div className="flex justify-between"><span>{item.quantity} × {formatCurrency(item.unit_price)}</span><b>{formatCurrency(item.subtotal)}</b></div></div>)}</div>
    <div className="my-3 space-y-1 border-y border-dashed border-black py-2"><div className="flex justify-between font-bold"><span>TOTAL</span><span>{formatCurrency(order.total_amount)}</span></div><div className="flex justify-between"><span>TUNAI</span><span>{formatCurrency(order.paid_amount)}</span></div><div className="flex justify-between"><span>KEMBALI</span><span>{formatCurrency(order.change_amount)}</span></div></div>
    <p className="text-center">Terima kasih sudah berbelanja<br/>Barang yang dibeli tidak dapat dikembalikan</p>
  </article>;
}
