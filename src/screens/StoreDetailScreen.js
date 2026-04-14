import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, TouchableOpacity, ScrollView, Image, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '../theme/colors';
import { fullProductsDatabase } from '../data/mockData';

const { height } = Dimensions.get('window');

export default function StoreDetailScreen({ visible, store, onClose, onSearchInStore }) {
  const panY = useRef(new Animated.Value(height)).current;
  const colors = useAppColors();
  const styles = getStyles(colors);

  if (!store) return null;

  // Seleccionar 4 productos para simular "Mejores Ofertas Locales"
  const localOffers = useMemo(() => {
    const available = fullProductsDatabase.filter(p => p.prices.some(pr => pr.supermarketId === store.id && pr.stock));
    const randomStart = parseInt(store.id) * 2; // Offset simple
    return available.slice(randomStart, randomStart + 4).map(p => {
      const priceObj = p.prices.find(pr => pr.supermarketId === store.id);
      const discount = 15; // Simulado
      return { ...p, currentPrice: priceObj.price, oldPrice: Math.round(priceObj.price / 0.85), discount };
    });
  }, [store]);

  const mostSearched = useMemo(() => {
    const available = fullProductsDatabase.filter(p => p.prices.some(pr => pr.supermarketId === store.id && pr.stock));
    return available.slice(available.length - 6, available.length).reverse();
  }, [store]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: store.color }]}>
        
        {/* Cabecera Temática */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="close" size={26} color={colors.card} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.navTitle}>{store.name}</Text>
            <Text style={styles.navSub}>Sucursal Oficial</Text>
          </View>
          <View style={{width: 40}}/>
        </View>

        <View style={styles.body}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.marketingBanner}>
              <Ionicons name="bag-check" size={40} color={store.color} />
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerTitle}>Promesas {store.name}</Text>
                <Text style={styles.bannerSub}>Precios monitoreados en tiempo real contra los competidores garantizando conveniencia.</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>💣 Bombazos del Día</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={{gap: 12}}>
              {localOffers.map(offer => (
                <View key={`offer-${offer.id}`} style={styles.offerCard}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{offer.discount}%</Text>
                  </View>
                  <Image source={offer.source || { uri: offer.image }} style={styles.offerImg} />
                  <Text style={styles.offerName} numberOfLines={2}>{offer.name}</Text>
                  <Text style={styles.oldPrice}>${offer.oldPrice.toLocaleString()}</Text>
                  <Text style={[styles.newPrice, { color: store.color }]}>${offer.currentPrice.toLocaleString()}</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>🔥 Más Buscados Aquí</Text>
            <View style={styles.mostSearchedGrid}>
              {mostSearched.map(item => (
                <View key={`ms-${item.id}`} style={styles.msCard}>
                   <Image source={item.source || { uri: item.image }} style={styles.msImg} />
                   <View style={styles.msTextSide}>
                     <Text style={styles.msBrand}>{item.brand}</Text>
                     <Text style={styles.msName} numberOfLines={2}>{item.name}</Text>
                   </View>
                </View>
              ))}
            </View>

            <View style={{height: 100}}/>
          </ScrollView>

          {/* Floater inferior para buscar */}
          <View style={styles.floatingBox}>
            <TouchableOpacity 
              style={[styles.floatingBtn, { backgroundColor: store.color }]}
              onPress={() => onSearchInStore(store.id)}
            >
              <Ionicons name="search" size={24} color={colors.card} style={{marginRight: 12}} />
              <Text style={styles.floatingBtnText}>Buscar catálogo en {store.name}</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 20, paddingBottom: 20 },
  backBtn: { padding: 4, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 20 },
  headerTitleWrap: { alignItems: 'center' },
  navTitle: { fontSize: 24, fontWeight: '900', color: colors.card },
  navSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  
  body: { flex: 1, backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  scrollContent: { padding: 16, paddingTop: 24 },
  
  marketingBanner: { flexDirection: 'row', backgroundColor: '#f0f5ff', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  bannerTextCol: { flex: 1, marginLeft: 16 },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  bannerSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  hScroll: { marginBottom: 32 },
  
  offerCard: { width: 140, backgroundColor: colors.card, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, zIndex: 2 },
  discountText: { color: colors.card, fontSize: 10, fontWeight: 'bold' },
  offerImg: { width: '100%', height: 90, resizeMode: 'contain', marginBottom: 12 },
  offerName: { fontSize: 13, fontWeight: '600', color: colors.text, height: 36, marginBottom: 6 },
  oldPrice: { fontSize: 11, color: colors.textMuted, textDecorationLine: 'line-through' },
  newPrice: { fontSize: 18, fontWeight: '900' },

  mostSearchedGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  msCard: { width: '48%', backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  msImg: { width: 40, height: 40, resizeMode: 'contain', marginRight: 10 },
  msTextSide: { flex: 1 },
  msBrand: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' },
  msName: { fontSize: 12, fontWeight: '600', color: colors.text },

  floatingBox: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
  floatingBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, elevation: 4, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.2, shadowRadius: 4 },
  floatingBtnText: { color: colors.card, fontSize: 18, fontWeight: 'bold' }
});
