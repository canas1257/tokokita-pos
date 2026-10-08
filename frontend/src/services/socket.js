import { io } from 'socket.io-client';
export const createSocket = () => io(import.meta.env.VITE_WS_URL, { autoConnect: false, transports: ['websocket', 'polling'] });
