import { ArrowLeft, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ReceiptPrint from '../../components/ReceiptPrint';
import { api, errorMessage } from '../../services/api';

export default function ReceiptPage() {
  const { id } = useParams(); const [order, setOrder] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get(`/orders/${id}`).then(r => setOrder(r.data.data)).catch(e => setError(errorMessage(e))); }, [id]);
  return <><Navbar/><main className="min-h-[calc(100vh-64px)] bg-canvas p-8"><div className="no-print mx-auto mb-5 flex max-w-xl items-center justify-between"><Link to="/pos" className="btn-secondary"><ArrowLeft size={17}/> Kembali ke kasir</Link><button className="btn-primary" onClick={() => window.print()} disabled={!order}><Printer size={17}/> Cetak struk</button></div>{error ? <p className="mx-auto max-w-xl rounded-xl bg-red-50 p-4 text-red-700">{error}</p> : !order ? <p className="text-center text-slate-400">Memuat struk...</p> : <ReceiptPrint order={order}/>}</main></>;
}
