import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import DashboardPage from './pages/admin/dashboard';
import InventoryPage from './pages/admin/inventory';
import RestockPage from './pages/admin/inventory/restock';
import SalesReportPage from './pages/admin/reports/sales';
import LoginPage from './pages/login';
import PosPage from './pages/pos';
import ReceiptPage from './pages/pos/receipt';

export default function App() {
  return <BrowserRouter><AuthProvider><SocketProvider><Routes>
    <Route path="/login" element={<LoginPage/>}/>
    <Route element={<ProtectedRoute roles={['ADMIN', 'CASHIER']}/>}><Route path="/pos" element={<PosPage/>}/><Route path="/pos/receipt/:id" element={<ReceiptPage/>}/></Route>
    <Route element={<ProtectedRoute roles={['ADMIN']}/>}><Route path="/admin/dashboard" element={<DashboardPage/>}/><Route path="/admin/inventory" element={<InventoryPage/>}/><Route path="/admin/inventory/restock" element={<RestockPage/>}/><Route path="/admin/reports/sales" element={<SalesReportPage/>}/></Route>
    <Route path="*" element={<Navigate to="/pos" replace/>}/>
  </Routes></SocketProvider></AuthProvider></BrowserRouter>;
}
