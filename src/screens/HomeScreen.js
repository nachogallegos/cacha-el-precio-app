import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supermarkets, fullProductsDatabase } from '../data/mockData';
import { ActivityContext } from '../context/ActivityContext';
import { AuthContext } from '../context/AuthContext';
import StoreDetailScreen from './StoreDetailScreen';

export default function HomeScreen({ navigation }) {
  const { user, profile } = useContext(AuthContext);
  const { totalSavings, recentSearches } = useContext(ActivityContext);
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const offers = fullProductsDatabase.slice(0, 5).map((p, i) => {
    const bestPriceObj = p.prices.find(pr => pr.stock);
    const superm = supermarkets.find(s => s.id === (bestPriceObj ? bestPriceObj.supermarketId : supermarkets[0].id));
    const price = bestPriceObj ? bestPriceObj.price : 1990;
    const discount = 15 + (i * 5);
    const oldPrice = Math.round(price / (1 - (discount/100)));
    return { ...p, superm, discount, price, oldPrice };
  });
  const mostViewed = fullProductsDatabase.slice(5, 10).map((p) => {
     const priceObj = p.prices.find(pr => pr.stock) || p.prices[0];
     const superm = supermarkets.find(s => s.id === priceObj.supermarketId);
     return { ...p, price: priceObj.price, superm };
  });
  const handleStorePress = (store) => {
    setSelectedStore(store);
    setStoreModalVisible(true);
  };
  const navigateToSearch = (productId) => {
    navigation.navigate('Buscar', { autoProduct: productId });
  };
  const handleSearchInStore = (storeId) => {
    setStoreModalVisible(false);
    navigation.navigate('Buscar', { focusStore: storeId });
  };
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Comprador';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Perfil')} style={styles.profileBtn}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.savingsCard}>
          <View style={styles.savingsInfo}>
            <Text style={styles.savingsLabel}>Tu Ahorro Inteligente</Text>
            <Text style={styles.savingsAmount}>${totalSavings.toLocaleString('es-CL')}</Text>
          </View>
          <View style={styles.savingsIconWrap}>
            <Ionicons name="trending-down" size={32} color={colors.card} />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Explorar Tiendas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storesScroll}>
          {supermarkets.map(store => (
            <TouchableOpacity 
              key={store.id} 
              style={styles.storeCircleBtn}
              onPress={() => handleStorePress(store)}
            >
              <View style={[styles.storeCircle, { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }]}>
                <Image source={{uri: store.logoUrl}} style={{width: 32, height: 32, resizeMode: 'contain'}} />
              </View>
              <Text style={styles.storeCircleName}>{store.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {recentSearches.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Tus Búsquedas Recientes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
              {recentSearches.map((item, index) => (
                <TouchableOpacity 
                  key={`hs-${item.id}-${index}`} 
                  style={styles.recentChip}
                  onPress={() => navigateToSearch(item.id)}
                >
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} style={{marginRight: 6}} />
                  <Text style={styles.recentChipText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
        <Text style={[styles.sectionTitle, { marginTop: recentSearches.length > 0 ? 8 : 24 }]}>Ofertas del Día</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScrollGrid}>
          {offers.map(offer => (
            <TouchableOpacity 
              key={`of-${offer.id}`} 
              style={styles.offerCard}
              onPress={() => navigateToSearch(offer.id)}
            >
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{offer.discount}%</Text>
              </View>
              <Image source={offer.source || {uri: offer.image}} style={styles.offerImage} />
              <Text style={styles.offerBrand}>{offer.brand}</Text>
              <Text style={styles.offerName} numberOfLines={2}>{offer.name}</Text>
              <View style={styles.offerPriceRow}>
                <Text style={styles.offerOldPrice}>${offer.oldPrice.toLocaleString()}</Text>
                <Text style={styles.offerPrice}>${offer.price.toLocaleString()}</Text>
              </View>
              <View style={[styles.offerStoreTag, { backgroundColor: offer.superm.color }]}>
                <Text style={styles.offerStoreText}>{offer.superm.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Productos Más Vistos */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Más Vistos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScrollGrid}>
          {mostViewed.map(item => (
            <TouchableOpacity 
              key={`mv-${item.id}`} 
              style={styles.offerCard} // Reutilizamos el estilo base pero sin los badges de descuento
              onPress={() => navigateToSearch(item.id)}
            >
              <Image source={item.source || {uri: item.image}} style={styles.offerImage} />
              <Text style={styles.offerBrand}>{item.brand}</Text>
              <Text style={styles.offerName} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.offerPrice, { marginTop: 8, color: colors.text }]}>Desde ${item.price.toLocaleString()}</Text>
              <View style={[styles.offerStoreTag, { backgroundColor: item.superm.color, marginTop: 'auto' }]}>
                <Text style={styles.offerStoreText}>{item.superm.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={{height: 40}} />
      </ScrollView>

      <StoreDetailScreen 
        visible={storeModalVisible} 
        store={selectedStore} 
        onClose={() => setStoreModalVisible(false)} 
        onSearchInStore={handleSearchInStore} 
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 16 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  greeting: { fontSize: 28, color: colors.text, fontWeight: 'bold' },
  profileBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  
  savingsCard: { backgroundColor: colors.success, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 4, shadowColor: colors.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 16 },
  savingsInfo: { flex: 1 },
  savingsLabel: { color: colors.card, fontSize: 12, fontWeight: '600', opacity: 0.9 },
  savingsAmount: { color: colors.card, fontSize: 28, fontWeight: 'bold', marginTop: 2 },
  savingsIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12, marginTop: 4 },
  
  storesScroll: { marginBottom: 16, paddingBottom: 4 },
  storeCircleBtn: { alignItems: 'center', marginRight: 16 },
  storeCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  storeCircleInitial: { color: colors.card, fontSize: 24, fontWeight: 'bold' },
  storeCircleName: { marginTop: 6, fontSize: 11, fontWeight: '600', color: colors.text },
  
  recentScroll: { marginBottom: 16, paddingBottom: 4, gap: 8 },
  recentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  recentChipText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  
  hScrollGrid: { gap: 10, paddingBottom: 8 },
  offerCard: { width: 105, backgroundColor: colors.card, borderRadius: 10, padding: 6, borderWidth: 1, borderColor: colors.border, elevation: 1 },
  discountBadge: { position: 'absolute', top: 4, left: 4, zIndex: 2, backgroundColor: colors.danger, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6 },
  discountText: { color: colors.card, fontSize: 9, fontWeight: 'bold' },
  offerImage: { width: '100%', height: 48, resizeMode: 'contain', marginBottom: 6 },
  offerBrand: { fontSize: 8, color: colors.textMuted, textTransform: 'uppercase' },
  offerName: { fontSize: 11, fontWeight: '600', color: colors.text, height: 28, marginTop: 2, lineHeight: 14 },
  offerPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'space-between' },
  offerOldPrice: { fontSize: 9, color: colors.textMuted, textDecorationLine: 'line-through' },
  offerPrice: { fontSize: 13, fontWeight: 'bold', color: colors.success },
  offerStoreTag: { alignSelf: 'flex-start', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, marginTop: 6 },
  offerStoreText: { color: colors.card, fontSize: 8, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  modalPromoBox: { backgroundColor: colors.background, padding: 20, borderRadius: 12, alignItems: 'center', marginVertical: 20 },
  modalPromoText: { fontSize: 15, color: colors.text, textAlign: 'center', marginTop: 16, lineHeight: 22 },
  modalActionBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  modalActionText: { color: colors.card, fontSize: 16, fontWeight: 'bold' }
});
