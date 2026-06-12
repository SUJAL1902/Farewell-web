import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('fw_token') || null);
  const [role, setRole] = useState(localStorage.getItem('fw_role') || null);

  const login = (tkn, rl) => {
    setToken(tkn);
    setRole(rl);
    localStorage.setItem('fw_token', tkn);
    localStorage.setItem('fw_role', rl);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('fw_token');
    localStorage.removeItem('fw_role');
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAdmin: role === 'admin', isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
