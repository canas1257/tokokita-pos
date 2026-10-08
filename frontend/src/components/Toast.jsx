import { AlertCircle, CheckCircle2, X } from 'lucide-react';
export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border bg-white p-4 shadow-xl ${toast.type === 'error' ? 'border-red-200' : 'border-emerald-200'}`}>
    {toast.type === 'error' ? <AlertCircle className="text-red-500" size={20}/> : <CheckCircle2 className="text-emerald-600" size={20}/>}<p className="text-sm font-semibold text-slate-700">{toast.message}</p><button onClick={onClose}><X size={16}/></button>
  </div>;
}
