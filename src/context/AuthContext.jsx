// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const AUTH_KEY = 'cdn-auth-user';

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(AUTH_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
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
      navigate('/distributions');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Função de Logout
  const logout = () => {
    setUser(null);
    navigate('/'); // Redireciona para a página de login
  };

  // Valor que será compartilhado com todos os componentes filhos
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