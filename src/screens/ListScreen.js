import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supermarkets } from '../data/mockData';
import { ListContext } from '../context/ListContext';

export default function ListScreen({ navigation }) {
  const { 
    listItems, updateQuantity, togglePurchased, removeItem, clearList, clearPurchased, 
    savedCarts, saveCurrentCart, loadCart, deleteSavedCart 
  } = useContext(ListContext);

  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [cartNameInput, setCartNameInput] = useState('');

  const totals = useMemo(() => {
    if (listItems.length === 0) return [];
    
    const computed = supermarkets.map(store => {
      const sum = listItems.reduce((acc, item) => {
        const p = item.prices.find(priceObj => priceObj.supermarketId === store.id);
        const val = p ? p.price : 0;
        return acc + (val * item.quantity);
      }, 0);
      return { ...store, total: sum };
    });
    
    return computed.sort((a, b) => a.total - b.total);
  }, [listItems]);

  const handleClear = () => {
    Alert.alert(
      "Vaciar Carrito",
      "¿Qué deseas hacer?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Limpiar ya comprados", onPress: clearPurchased },
        { text: "Vaciar Todo", onPress: clearList, style: "destructive" }
      ]
    );
  };

  const handleSaveSubmit = () => {
    if (!cartNameInput.trim()) {
      Alert.alert("Error", "Ingresa un nombre para el carrito");
      return;
    }
    saveCurrentCart(cartNameInput);
    setSaveModalVisible(false);
    setCartNameInput('');
    Alert.alert("Éxito", "Carrito guardado en tu colección");
  };

  const handleLoadCart = (cart) => {
    Alert.alert("Cargar Carrito", `Sobreescribirá tu lista actual con '${cart.name}'. ¿Continuar?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Cargar", onPress: () => {
          loadCart(cart.id);
          setHistoryModalVisible(false);
      }}
    ])
  };

  const renderItem = ({ item }) => {
    const isPurchased = item.purchased;

    return (
      <View style={[styles.card, isPurchased && styles.cardPurchased]}>
        <TouchableOpacity style={styles.checkBtn} onPress={() => togglePurchased(item.id)}>
          <Ionicons 
            name={isPurchased ? "checkmark-circle" : "ellipse-outline"} 
            size={28} 
            color={isPurchased ? colors.success : colors.border} 
          />
        </TouchableOpacity>
        
        <Image 
          source={item.source || { uri: item.image }} 
          style={[styles.image, isPurchased && styles.imagePurchased]} 
        />
        
        <View style={styles.infoContainer}>
          <Text style={[styles.name, isPurchased && styles.textPurchased]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.brand, isPurchased && styles.textPurchased]}>{item.brand}</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
              <Ionicons name="remove" size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
              <Ionicons name="add" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.trashBtn} onPress={() => removeItem(item.id)}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>Mi Carrito</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setHistoryModalVisible(true)} style={styles.actionBtn}>
              <Ionicons name="folder-open" size={22} color={colors.primary} />
            </TouchableOpacity>
            {listItems.length > 0 && (
              <TouchableOpacity onPress={() => setSaveModalVisible(true)} style={styles.actionBtn}>
                <Ionicons name="save" size={22} color={colors.success} />
              </TouchableOpacity>
            )}
            {listItems.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={[styles.actionBtn, {borderColor: colors.danger}]}>
                <Ionicons name="trash-bin" size={22} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {listItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={80} color={colors.border} />
            <Text style={styles.emptyTitle}>Tu lista está vacía</Text>
            <Text style={styles.emptySub}>Añade productos individuales o carga un carrito pre-guardado.</Text>
            
            <View style={{flexDirection: 'row', gap: 12, marginTop: 12}}>
              <TouchableOpacity style={styles.goSearchBtn} onPress={() => navigation.navigate('Buscar')}>
                <Text style={styles.goSearchText}>Cotizar Ítems</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.goSearchBtn, {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary}]} onPress={() => setHistoryModalVisible(true)}>
                <Text style={[styles.goSearchText, {color: colors.primary}]}>Mis Carritos</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={listItems}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Resumen Inteligente */}
        {listItems.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Costo Total Estimado</Text>
            {totals.map((storeResult, index) => {
              const isBest = index === 0;
              return (
                <View key={storeResult.id} style={[styles.summaryRow, isBest && styles.summaryRowBest]}>
                  <View style={styles.summaryStoreInfo}>
                    <View style={[styles.colorDot, { backgroundColor: storeResult.color }]} />
                    <Text style={[styles.summaryStoreName, isBest && styles.summaryStoreNameBest]}>
                      {storeResult.name}
                    </Text>
                  </View>
                  <View style={styles.summaryPriceArea}>
                    {isBest && <Text style={styles.bestBadge}>Más Conveniente</Text>}
                    <Text style={[styles.summaryTotal, isBest && styles.summaryTotalBest]}>
                      ${storeResult.total.toLocaleString('es-CL')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Modal: Guardar Carrito */}
        <Modal visible={saveModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlayCentered}>
            <View style={styles.modalContentSmall}>
              <Text style={styles.modalTitle}>Guardar Carrito</Text>
              <Text style={styles.modalSub}>Guarda los {listItems.length} ítems actuales de tu lista para reusarlos después sin buscarlos de vuelta.</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="Nombre del Carrito (ej. Despensa Mes)"
                value={cartNameInput}
                onChangeText={setCartNameInput}
                autoFocus
              />
              <View style={styles.modalButtonsStack}>
                <TouchableOpacity style={styles.modalSaveBigBtn} onPress={handleSaveSubmit}>
                  <Text style={styles.modalSaveBigText}>Confirmar Guardado</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSaveModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Historial de Carritos */}
        <Modal visible={historyModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentFull}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Carritos Guardados ({savedCarts.length})</Text>
                <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {savedCarts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-outline" size={60} color={colors.border} />
                  <Text style={styles.emptyTitle}>Ningún archivo</Text>
                  <Text style={styles.emptySub}>Cuando armes una lista y la guardes con el botón verde superior, aparecerá aquí.</Text>
                </View>
              ) : (
                <FlatList 
                  data={savedCarts}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={styles.historyCard}>
                      <View style={styles.historyCardLeft}>
                        <Text style={styles.historyCardName}>{item.name}</Text>
                        <Text style={styles.historyCardMeta}>
                          {item.items.length} productos • Grabado el {new Date(item.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.historyCardActions}>
                        <TouchableOpacity style={styles.playBtn} onPress={() => handleLoadCart(item)}>
                          <Ionicons name="play" size={16} color={colors.card} style={{marginRight: 4}} />
                          <Text style={styles.playBtnText}>Cotizar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.delBtn} onPress={() => deleteSavedCart(item.id)}>
                          <Ionicons name="trash" size={20} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: { paddingTop: 16, paddingBottom: 16, paddingLeft: 16, paddingRight: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, flex: 1, marginRight: 10 },
  headerActions: { flexDirection: 'row', gap: 12, marginRight: 4 },
  actionBtn: { padding: 8, backgroundColor: colors.card, borderRadius: 8, elevation: 1, borderWidth: 1, borderColor: colors.border },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 16 },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  goSearchBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  goSearchText: { color: colors.card, fontWeight: 'bold', fontSize: 14 },

  listContainer: { paddingHorizontal: 12, paddingBottom: 12 },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 8, padding: 6, paddingRight: 8, marginBottom: 6, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cardPurchased: { opacity: 0.6, backgroundColor: '#f9f9f9' },
  checkBtn: { marginRight: 6 },
  image: { width: 32, height: 32, borderRadius: 6, resizeMode: 'contain' },
  imagePurchased: { opacity: 0.5 },
  infoContainer: { flex: 1, marginLeft: 8 },
  name: { fontSize: 12, fontWeight: '600', color: colors.text },
  brand: { fontSize: 10, color: colors.textMuted, marginTop: 0 },
  textPurchased: { textDecorationLine: 'line-through', color: colors.textMuted },
  quantityControls: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  qtyBtn: { backgroundColor: colors.background, padding: 0, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: colors.border },
  qtyText: { marginHorizontal: 8, fontSize: 12, fontWeight: '600', color: colors.text },
  trashBtn: { padding: 4 },

  summaryContainer: { backgroundColor: colors.card, borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 8, paddingHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 10 },
  summaryTitle: { fontSize: 11, fontWeight: 'bold', color: colors.textMuted, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.background },
  summaryRowBest: { backgroundColor: colors.success + '10', paddingHorizontal: 8, borderRadius: 6, marginHorizontal: -8, borderBottomWidth: 0 },
  summaryStoreInfo: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  summaryStoreName: { fontSize: 12, color: colors.text },
  summaryStoreNameBest: { fontWeight: 'bold' },
  summaryPriceArea: { flexDirection: 'row', alignItems: 'center' },
  summaryTotal: { fontSize: 12, fontWeight: '600', color: colors.text },
  summaryTotalBest: { fontSize: 14, fontWeight: 'bold', color: colors.success },
  bestBadge: { backgroundColor: colors.success, color: colors.card, fontSize: 8, fontWeight: 'bold', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8, marginRight: 4, overflow: 'hidden' },

  // Modals
  modalOverlayCentered: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContentSmall: { width: '85%', backgroundColor: colors.card, borderRadius: 20, padding: 24, elevation: 5 },
  modalSub: { color: colors.textMuted, fontSize: 14, marginVertical: 8, lineHeight: 20 },
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 16, marginTop: 12, marginBottom: 24, color: colors.text },
  modalButtonsStack: { gap: 12 },
  modalSaveBigBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  modalSaveBigText: { color: colors.card, fontWeight: 'bold', fontSize: 16 },
  modalCancelBtn: { padding: 12, alignItems: 'center' },
  modalCancelText: { color: colors.danger, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContentFull: { backgroundColor: colors.background, minHeight: '60%', maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  historyCard: { backgroundColor: colors.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyCardLeft: { flex: 1 },
  historyCardName: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  historyCardMeta: { fontSize: 12, color: colors.textMuted },
  historyCardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  playBtnText: { color: colors.card, fontSize: 14, fontWeight: 'bold' },
  delBtn: { padding: 8 },
});
