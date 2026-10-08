import Navbar from './Navbar';
export default function PageLayout({ children }) { return <><Navbar/><main className="min-h-[calc(100vh-64px)] bg-canvas p-6">{children}</main></>; }
