import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('kasirUser')); } catch { return null; } });
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('kasirToken', data.data.token); localStorage.setItem('kasirUser', JSON.stringify(data.data.user)); setUser(data.data.user);
    return data.data.user;
  };
  const logout = () => { localStorage.removeItem('kasirToken'); localStorage.removeItem('kasirUser'); setUser(null); };
  const value = useMemo(() => ({ user, login, logout, isAuthenticated: Boolean(user) }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
