import React, { useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Modal, Keyboard, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '../theme/colors';
import { supermarkets } from '../data/mockData';
import { AlertsContext } from '../context/AlertsContext';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';

export default function AlertsScreen() {
  const { alerts, removeAlert, updateAlertTarget } = useContext(AlertsContext);
  const { products: dbProducts, loading: dbLoading } = useSupabaseProducts();
  
  const colors = useAppColors();
  const styles = getStyles(colors);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [targetPriceInput, setTargetPriceInput] = useState('');
  const [selectedStores, setSelectedStores] = useState(supermarkets.map(s => s.id));

  // Autocomplete
  const searchSuggestions = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    return dbProducts
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [searchQuery]);

  const handleSelectProduct = (product) => {
    Keyboard.dismiss();
    setSelectedProduct(product);
    setSearchQuery('');
    
    // Auto sugerir precio objetivo (10% de descuento sobre el mejor actual)
    const minPrice = Math.min(...product.prices.map(p => p.price));
    setTargetPriceInput(Math.round(minPrice * 0.9).toString());
  };

  const toggleStoreSelection = (id) => {
    setSelectedStores(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleEditOpen = (alert) => {
    const product = dbProducts.find(p => p.id === alert.productId);
    setEditingAlertId(alert.id);
    setSelectedProduct(product);
    setTargetPriceInput(alert.targetPrice.toString());
    setSelectedStores(alert.stores);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setSelectedProduct(null);
    setTargetPriceInput('');
    setSelectedStores(supermarkets.map(s => s.id));
    setSearchQuery('');
    setEditingAlertId(null);
  };

  const handleSaveAlert = () => {
    if (!selectedProduct || !targetPriceInput || selectedStores.length === 0) {
      Alert.alert("Error", "Debes seleccionar un producto, ingresar un precio y elegir al menos un supermercado.");
      return;
    }
    
    if (editingAlertId) {
      updateAlert(editingAlertId, selectedProduct.id, targetPriceInput, selectedStores);
    } else {
      addAlert(selectedProduct.id, selectedProduct.name, targetPriceInput, selectedStores);
    }
    
    closeModal();
  };

  // Computar el estado real de cada alerta
  const computedAlerts = useMemo(() => {
    return alerts.map(alert => {
      const product = dbProducts.find(p => p.id === alert.productId);
      
      // Si aùn no carga la DB
      if(!product) return { ...alert, triggered: false, currentBestPrice: 0 };

      // Filtrar a las tiendas de la alerta que tengan stock
      const validPrices = product.prices.filter(p => alert.stores.includes(p.supermarketId) && p.stock);
      
      const currentBestPrice = validPrices.length > 0 
        ? Math.min(...validPrices.map(p => p.price)) 
        : NaN;
      
      const triggered = alert.active && currentBestPrice <= alert.targetPrice;
      const bestStoreId = validPrices.find(p => p.price === currentBestPrice)?.supermarketId;
      const bestStoreName = supermarkets.find(s => s.id === bestStoreId)?.name || '';

      return {
        ...alert,
        currentBestPrice,
        triggered,
        bestStoreName
      };
    });
  }, [alerts, dbProducts]);


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Mis Alertas</Text>
              <Text style={styles.headerSubtitle}>Vigilancia de precios Automática</Text>
            </View>
            <TouchableOpacity style={styles.addAlertBtn} onPress={() => { setEditingAlertId(null); setShowCreateModal(true); }}>
              <Ionicons name="add" size={24} color={colors.card} />
            </TouchableOpacity>
          </View>

          {computedAlerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color={colors.border} />
              <Text style={styles.emptyText}>No tienes alertas configuradas.</Text>
            </View>
          ) : (
            computedAlerts.map((alert) => (
              <View key={alert.id} style={[styles.alertCard, alert.triggered && styles.alertCardTriggered]}>
                <View style={styles.alertHeader}>
                  <View style={styles.alertStatus}>
                    {alert.triggered ? (
                      <Ionicons name="notifications-circle" size={24} color={colors.success} />
                    ) : alert.active ? (
                      <Ionicons name="search" size={20} color={colors.secondary} />
                    ) : (
                      <Ionicons name="pause-circle" size={24} color={colors.textMuted} />
                    )}
                    <Text style={[
                        styles.statusText, 
                        alert.triggered && {color: colors.success},
                        (!alert.triggered && alert.active) && {color: colors.secondary}
                      ]}>
                      {alert.triggered ? `¡Bajó en ${alert.bestStoreName}!` : alert.active ? 'Buscando bajadas...' : 'Pausada'}
                    </Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => handleEditOpen(alert)} style={{marginRight: 12}}>
                      <Ionicons name="pencil" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => togglePause(alert.id)} style={{marginRight: 12}}>
                      <Ionicons name={alert.active ? "pause" : "play"} size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeAlert(alert.id)}>
                      <Ionicons name="trash" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.alertProductName}>{alert.name}</Text>
                
                <View style={styles.pricesCompare}>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Objetivo</Text>
                    <Text style={styles.targetPrice}>${alert.targetPrice}</Text>
                  </View>
                  <View style={styles.priceDivider} />
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Mejor Actual</Text>
                    <Text style={[styles.currentPrice, alert.triggered && {color: colors.success}]}>
                      {isNaN(alert.currentBestPrice) ? 'Sin Stock' : `$${alert.currentBestPrice}`}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Modal de Creación */}
        <Modal visible={showCreateModal} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingAlertId ? "Editar Alerta" : "Nueva Alerta"}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              {!selectedProduct ? (
                <>
                  <Text style={styles.label}>1. Busca un producto</Text>
                  <View style={styles.searchInputWrapper}>
                    <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                    <TextInput 
                      style={styles.searchInput}
                      placeholder="Ej: Pan, Leche..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoFocus
                    />
                  </View>
                  {searchSuggestions.map(item => (
                    <TouchableOpacity key={item.id} style={styles.suggestionRow} onPress={() => handleSelectProduct(item)}>
                      <Text style={styles.suggestionText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <>
                  <View style={styles.selectedProductCard}>
                    <Text style={styles.label}>Producto Seleccionado</Text>
                    <Text style={styles.selectedName}>{selectedProduct.name}</Text>
                    <TouchableOpacity onPress={() => {setSelectedProduct(null); setSearchQuery(''); }}>
                      <Text style={styles.changeProductText}>Cambiar</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>2. Precio Objetivo (CLP)</Text>
                  <TextInput 
                    style={styles.priceInput}
                    keyboardType="numeric"
                    value={targetPriceInput}
                    onChangeText={setTargetPriceInput}
                    placeholder="Ej: 1500"
                  />

                  <Text style={styles.label}>3. Supermercados a Vigilar</Text>
                  <View style={styles.storesWrap}>
                    {supermarkets.map(store => {
                      const isActive = selectedStores.includes(store.id);
                      return (
                        <TouchableOpacity 
                          key={store.id} 
                          style={[styles.storeBtn, isActive && { backgroundColor: store.color, borderColor: store.color }]}
                          onPress={() => toggleStoreSelection(store.id)}
                        >
                          <Text style={[styles.storeText, isActive && { color: colors.card }]}>{store.name}</Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>

                  <TouchableOpacity style={[styles.saveAlertFinalBtn, { marginBottom: 40 }]} onPress={handleSaveAlert}>
                    <Text style={styles.saveAlertFinalText}>{editingAlertId ? "Guardar Cambios" : "Guardar Alerta"}</Text>
                  </TouchableOpacity>
                </>
              )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  headerSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  addAlertBtn: { backgroundColor: colors.primary, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: colors.textMuted, marginTop: 12, fontSize: 16 },
  alertCard: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  alertCardTriggered: { borderColor: colors.success, borderWidth: 2, backgroundColor: colors.success + '08' },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  alertStatus: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 13, fontWeight: 'bold', color: colors.textMuted, marginLeft: 6 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  alertProductName: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 12 },
  pricesCompare: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.background, borderRadius: 10, padding: 8 },
  priceCol: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 8 },
  priceLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 2 },
  targetPrice: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  currentPrice: { fontSize: 16, fontWeight: 'bold', color: colors.textMuted },
  bottomSpacer: { height: 40 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  label: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 8 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, height: 48 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  suggestionRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestionText: { fontSize: 16, color: colors.text },
  
  selectedProductCard: { backgroundColor: colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  selectedName: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginVertical: 4 },
  changeProductText: { color: colors.danger, fontWeight: '600', marginTop: 4 },
  
  priceInput: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, fontSize: 20, height: 56, fontWeight: 'bold', color: colors.text },
  
  storesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  storeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  storeText: { fontSize: 14, fontWeight: '500', color: colors.text },
  
  saveAlertFinalBtn: { backgroundColor: colors.primary, marginTop: 32, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  saveAlertFinalText: { color: colors.card, fontSize: 18, fontWeight: 'bold' }
});
