import { BarChart3, Boxes, LayoutDashboard, LogOut, ShoppingCart, Wifi, WifiOff } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth(); const { connected } = useSocket(); const navigate = useNavigate();
  const links = user?.role === 'ADMIN' ? [
    ['/pos', <ShoppingCart size={17}/>, 'Kasir'], ['/admin/dashboard', <LayoutDashboard size={17}/>, 'Ringkasan'], ['/admin/inventory', <Boxes size={17}/>, 'Produk'], ['/admin/reports/sales', <BarChart3 size={17}/>, 'Laporan']
  ] : [['/pos', <ShoppingCart size={17}/>, 'Kasir']];
  return <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div className="flex h-16 items-center px-6">
      <button onClick={() => navigate('/pos')} className="mr-9 flex items-center gap-3 text-left">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-display text-lg font-extrabold text-white">K</span>
        <span><span className="block font-display text-base font-extrabold leading-none">TokoKita</span><span className="text-[10px] font-bold uppercase tracking-[.2em] text-brand-600">Point of Sale</span></span>
      </button>
      <nav className="flex h-full items-center gap-1">{links.map(([to, icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => `flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>{icon}{label}</NavLink>)}</nav>
      <div className="ml-auto flex items-center gap-4">
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${connected ? 'text-emerald-600' : 'text-slate-400'}`}>{connected ? <Wifi size={14}/> : <WifiOff size={14}/>} {connected ? 'Live' : 'Offline'}</span>
        <div className="border-l border-slate-200 pl-4 text-right"><p className="text-sm font-bold leading-tight">{user?.name}</p><p className="text-[11px] font-semibold text-slate-400">{user?.role === 'ADMIN' ? 'Administrator' : 'Kasir'}</p></div>
        <button aria-label="Keluar" onClick={() => { logout(); navigate('/login'); }} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><LogOut size={18}/></button>
      </div>
    </div>
  </header>;
}
