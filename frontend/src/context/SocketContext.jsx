import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSocket } from '../services/socket';
import { useAuth } from './AuthContext';
const SocketContext = createContext(null);
export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth(); const [connected, setConnected] = useState(false);
  const socket = useMemo(() => createSocket(), []);
  useEffect(() => { if (!isAuthenticated) { socket.disconnect(); return; } socket.connect(); const onConnect = () => setConnected(true); const onDisconnect = () => setConnected(false); socket.on('connect', onConnect); socket.on('disconnect', onDisconnect); return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); socket.disconnect(); }; }, [isAuthenticated, socket]);
  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
}
export const useSocket = () => useContext(SocketContext);
