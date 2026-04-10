import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@superAhorro_auth');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.log("Error loading session:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (provider, userData) => {
    const sessionData = {
      id: Date.now().toString(),
      provider,
      name: userData.name || 'Comprador Anónimo',
      email: userData.email || '',
      zone: 'Región Metropolitana', // Default
      joinedDate: new Date().toISOString()
    };
    try {
      await AsyncStorage.setItem('@superAhorro_auth', JSON.stringify(sessionData));
      setUser(sessionData);
    } catch (e) { }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@superAhorro_auth');
      setUser(null);
    } catch (e) { }
  };

  const updateZone = async (newZone) => {
    if (!user) return;
    const updatedUser = { ...user, zone: newZone };
    try {
      await AsyncStorage.setItem('@superAhorro_auth', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) { }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      updateZone
    }}>
      {children}
    </AuthContext.Provider>
  );
};
