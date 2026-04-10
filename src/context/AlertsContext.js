import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fullProductsDatabase } from '../data/mockData';

export const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Cargar
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const stored = await AsyncStorage.getItem('@superAhorro_alerts');
        if (stored !== null) {
          setAlerts(JSON.parse(stored));
        }
      } catch (e) {
        console.log("Error cargando alertas", e);
      }
    };
    loadAlerts();
  }, []);

  // Guardar
  useEffect(() => {
    const saveAlerts = async () => {
      try {
        await AsyncStorage.setItem('@superAhorro_alerts', JSON.stringify(alerts));
      } catch (e) {
        console.log("Error guardando alertas", e);
      }
    };
    saveAlerts();
  }, [alerts]);

  const addAlert = (productId, targetPrice, storesArray) => {
    const product = fullProductsDatabase.find(p => p.id === productId);
    if (!product) return;

    const newAlert = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      targetPrice: parseInt(targetPrice),
      stores: storesArray,
      active: true,
    };
    
    // Solo no agregamos duplicados estrictos si queremos, pero lo permitiremos
    setAlerts(prev => [newAlert, ...prev]);
  };

  const togglePause = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const updateAlert = (id, productId, targetPrice, storesArray) => {
    const product = fullProductsDatabase.find(p => p.id === productId);
    if (!product) return;
    
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, productId: product.id, name: product.name, targetPrice: parseInt(targetPrice), stores: storesArray } : a
    ));
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AlertsContext.Provider value={{
      alerts,
      addAlert,
      updateAlert,
      togglePause,
      removeAlert
    }}>
      {children}
    </AlertsContext.Provider>
  );
};
