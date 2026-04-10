import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [listItems, setListItems] = useState([]);
  const [savedCarts, setSavedCarts] = useState([]);

  // Cargar al inicio
  useEffect(() => {
    const loadList = async () => {
      try {
        const storedList = await AsyncStorage.getItem('@superAhorro_list');
        if (storedList !== null) setListItems(JSON.parse(storedList));
        
        const storedCarts = await AsyncStorage.getItem('@superAhorro_savedCarts');
        if (storedCarts !== null) setSavedCarts(JSON.parse(storedCarts));
      } catch (e) {
        console.log("Error cargando lista", e);
      }
    };
    loadList();
  }, []);

  // Guardar al cambiar
  useEffect(() => {
    const saveList = async () => {
      try {
        await AsyncStorage.setItem('@superAhorro_list', JSON.stringify(listItems));
      } catch (e) {
        console.log("Error guardando lista", e);
      }
    };
    saveList();
  }, [listItems]);

  useEffect(() => {
    const storeCarts = async () => {
      try { await AsyncStorage.setItem('@superAhorro_savedCarts', JSON.stringify(savedCarts)); } 
      catch (e) { console.log("Error guardando carritos", e); }
    };
    storeCarts();
  }, [savedCarts]);

  const addToList = (product, priceItemStore) => {
    setListItems(prev => {
      const existsIndex = prev.findIndex(item => item.id === product.id);
      
      // Si el producto ya está en la lista, simplemente actualizamos sus precios y marcamos como no comprado (si lo estaba)
      if (existsIndex >= 0) {
        const newList = [...prev];
        const existing = newList[existsIndex];
        return newList; // or we can increment quantity. Let's increment.
        // Wait, better to increment if it exists.
      }
      
      // Si no existe, lo agregamos completo 
      return [...prev, {
        ...product,
        quantity: 1,
        purchased: false,
        // We can just keep the whole product with its standard prices array to compare later
      }];
    });
  };

  // Improved Add: Just add the generic Product. We calculate cheapest overall in List.
  const addToListGeneric = (product) => {
    setListItems(prev => {
      const existsIndex = prev.findIndex(item => item.id === product.id);
      if (existsIndex >= 0) {
        const newList = [...prev];
        newList[existsIndex].quantity += 1;
        newList[existsIndex].purchased = false; 
        return newList;
      }
      return [...prev, { ...product, quantity: 1, purchased: false }];
    });
  };

  const updateQuantity = (id, delta) => {
    setListItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQty) }; // Mínimo 1
      }
      return item;
    }));
  };

  const togglePurchased = (id) => {
    setListItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, purchased: !item.purchased };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setListItems(prev => prev.filter(item => item.id !== id));
  };

  const clearList = () => setListItems([]);
  
  const clearPurchased = () => {
    setListItems(prev => prev.filter(item => !item.purchased));
  };

  const saveCurrentCart = (name) => {
    if (listItems.length === 0) return;
    const newCart = {
      id: Date.now().toString(),
      name: name || 'Carrito Personalizado',
      date: new Date().toISOString(),
      items: [...listItems]
    };
    setSavedCarts(prev => [newCart, ...prev]);
  };

  const loadCart = (cartId) => {
    const cart = savedCarts.find(c => c.id === cartId);
    if(cart) setListItems(cart.items);
  };

  const deleteSavedCart = (cartId) => {
    setSavedCarts(prev => prev.filter(c => c.id !== cartId));
  };


  return (
    <ListContext.Provider value={{
      listItems,
      savedCarts,
      addToList: addToListGeneric,
      updateQuantity,
      togglePurchased,
      removeItem,
      clearList,
      clearPurchased,
      saveCurrentCart,
      loadCart,
      deleteSavedCart
    }}>
      {children}
    </ListContext.Provider>
  );
};
