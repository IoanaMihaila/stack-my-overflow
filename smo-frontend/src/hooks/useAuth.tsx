import { useEffect, useState } from "react";
import { request } from "../lib/api"; 

interface User {
  id: string;
  username: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('smo_user');
    const token = localStorage.getItem('smo_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // MODIFICAT: Schimbat parametrul în usernameOrEmail
  const login = async (usernameOrEmail: string, password: string) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }) // Trimitem cheia nouă spre backend
    });
    
    localStorage.setItem('smo_token', data.accessToken);
    localStorage.setItem('smo_refresh', data.refreshToken);
    localStorage.setItem('smo_user', JSON.stringify(data.user)); 
    
    setUser(data.user);
    return data;
  };

  const register = async (email: string, password: string, username: string) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username })
    });
    
    localStorage.setItem('smo_token', data.accessToken);
    localStorage.setItem('smo_refresh', data.refreshToken);
    localStorage.setItem('smo_user', JSON.stringify(data.user));
    
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Eroare la informarea serverului despre logout:", err);
    } finally {
      localStorage.removeItem('smo_token');
      localStorage.removeItem('smo_refresh');
      localStorage.removeItem('smo_user');
      setUser(null);
    }
  };

  return { user, loading, login, register, logout };
}