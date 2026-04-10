import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const [totalSavings, setTotalSavings] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const stored = await AsyncStorage.getItem('@superAhorro_activity');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.totalSavings) setTotalSavings(parsed.totalSavings);
          if (parsed.recentSearches) setRecentSearches(parsed.recentSearches);
        }
      } catch (e) {
        console.log("Error cargando actividad", e);
      }
    };
    loadActivity();
  }, []);

  useEffect(() => {
    const saveActivity = async () => {
      try {
        await AsyncStorage.setItem('@superAhorro_activity', JSON.stringify({
          totalSavings,
          recentSearches
        }));
      } catch (e) {
        console.log("Error guardando actividad", e);
      }
    };
    saveActivity();
  }, [totalSavings, recentSearches]);

  const addSavings = (amount) => {
    if (amount > 0) {
      setTotalSavings(prev => prev + amount);
    }
  };

  const addRecentSearch = (product) => {
    if (!product) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(p => p?.id !== product.id);
      filtered.unshift(product);
      return filtered.slice(0, 5); // Keep max 5 recently searched items
    });
  };

  const resetSavings = () => setTotalSavings(0);

  return (
    <ActivityContext.Provider value={{
      totalSavings,
      recentSearches,
      addSavings,
      addRecentSearch,
      resetSavings
    }}>
      {children}
    </ActivityContext.Provider>
  );
};
