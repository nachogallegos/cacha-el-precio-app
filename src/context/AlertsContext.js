import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabaseClient';
import { AuthContext } from './AuthContext';

export const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar
  useEffect(() => {
    const loadAlerts = async () => {
      if (!user) {
        setAlerts([]);
        setIsLoaded(false);
        return;
      }
      try {
        const stored = await AsyncStorage.getItem('@superAhorro_alerts');
        if (stored !== null) setAlerts(JSON.parse(stored));

        // Descarga real de Supabase
        const { data, error } = await supabase.from('user_alerts').select('*').eq('user_id', user.id);
        if (data) {
          // Adaptar formato DB a Formato Frontend
          const formatted = data.map(dbAlert => ({
            id: dbAlert.id,
            productId: dbAlert.product_id,
            name: dbAlert.product_id, // Temporal, se idealmente hace un JOIN o caching de info
            targetPrice: dbAlert.target_price,
            stores: dbAlert.supermarkets,
            active: dbAlert.active,
          }));
          
          // Tratar de inyectar nombres legibles mediante cruzamiento rápido con supabase
          const pIds = data.map(d => d.product_id);
          if (pIds.length > 0) {
            const { data: products, error: pError } = await supabase.from('products').select('ean, name').in('ean', pIds);
            if (products) {
               formatted.forEach(f => {
                 const foundProduct = products.find(p => p.ean === f.productId);
                 if (foundProduct) f.name = foundProduct.name;
               });
            } else if (pError) {
               console.log("Error buscando nombres de productos:", pError);
            }
          }

          setAlerts(formatted);
        }
      } catch (e) {
        console.log("Error cargando alertas desde la nube:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadAlerts();
  }, [user]);

  // Guardar CASTEADO a local (Supabase se maneja por evento individual ahora)
  useEffect(() => {
    if (!user || !isLoaded) return;
    const saveAlerts = async () => {
      try {
        await AsyncStorage.setItem('@superAhorro_alerts', JSON.stringify(alerts));
      } catch (e) {
        console.log("Error guardando alertas locales:", e);
      }
    };
    saveAlerts();
  }, [alerts, user, isLoaded]);

  const addAlert = async (productId, productName, targetPrice, storesArray) => {
    // Front-end instantaneo
    const tempId = Date.now().toString();
    const newAlert = {
      id: tempId,
      productId: productId,
      name: productName || 'Buscando nombre...', 
      targetPrice: parseInt(targetPrice),
      stores: storesArray,
      active: true,
    };
    setAlerts(prev => [newAlert, ...prev]);

    if (!user) return;
    
    // Supabase
    const { data, error } = await supabase.from('user_alerts').insert({
      user_id: user.id,
      product_id: productId,
      target_price: parseInt(targetPrice),
      supermarkets: storesArray,
      active: true
    }).select().single();

    if (data) {
      // Reemplazar tempId por ID real que servirá para Edición/Eliminación
      setAlerts(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id } : a));
    }
  };

  const togglePause = async (id) => {
    const alertTarget = alerts.find(a => a.id === id);
    if (!alertTarget) return;

    const newActiveState = !alertTarget.active;
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: newActiveState } : a));

    if (user && id.includes('-')) { // if it is a real UUID and not a numeric Date.now fake ID
      await supabase.from('user_alerts').update({ active: newActiveState }).eq('id', id);
    }
  };

  const updateAlert = async (id, productId, targetPrice, storesArray) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, productId: productId, targetPrice: parseInt(targetPrice), stores: storesArray } : a
    ));

    if (user && id.includes('-')) {
      await supabase.from('user_alerts').update({
        target_price: parseInt(targetPrice),
        supermarkets: storesArray
      }).eq('id', id);
    }
  };

  const removeAlert = async (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    
    if (user && id.includes('-')) {
      await supabase.from('user_alerts').delete().eq('id', id);
    }
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
