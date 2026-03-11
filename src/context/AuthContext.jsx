// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const AUTH_KEY = 'cdn-auth-user';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedItem = localStorage.getItem(AUTH_KEY);
    
    if (!storedItem) return null;

    try {
      const parsedItem = JSON.parse(storedItem);
      
      if (!parsedItem.timestamp || !parsedItem.data) {
        localStorage.removeItem(AUTH_KEY);
        return null;
      }

      const now = new Date().getTime();
      const isExpired = (now - parsedItem.timestamp) > SEVEN_DAYS_IN_MS;

      if (isExpired) {
        // Se passou de 7 dias, limpa o cache e exige novo login
        localStorage.removeItem(AUTH_KEY);
        console.log("Sessão expirada. Refaça o login.");
        return null;
      }

      // Se ainda estiver no prazo, retorna os dados reais do usuário
      return parsedItem.data;
    } catch (error) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
  });

  // Gravar o usuário no localStorage SEMPRE com a data atual (timestamp)
  useEffect(() => {
    if (user) {
      const itemToStore = {
        data: user,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(itemToStore));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  // Função de Login
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Falha no login');
      }

      setUser(data); 
      navigate('/inicio');
    } catch (err) {
      throw err;
    }
  };

  // Função de Logout
  const logout = () => {
    setUser(null);
    navigate('/'); 
  };

  const value = { user, login, logout, isAuthenticated: !!user };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};