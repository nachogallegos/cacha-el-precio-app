import React, { useMemo, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supermarkets } from '../data/mockData';
import { ListContext } from '../context/ListContext';
import { AlertsContext } from '../context/AlertsContext';

export default function ProductDetailScreen({ visible, onClose, product, storeResult }) {
  const { addToList } = useContext(ListContext);
  const { addAlert } = useContext(AlertsContext);

  // Derivar de dependencias condicionalmente para no crashear
  const { storeDef, historyData, minPrice, maxPrice, avgPrice, isGoodDeal } = useMemo(() => {
    if (!product || !storeResult) return {};
    const sDef = supermarkets.find(s => s.id === storeResult.supermarketId);
    
    let currentPrice = storeResult.price;
    const array = [];
    // Generar últimos 30 días con variaciones
    for(let i=0; i<30; i++) {
        // variación salvaje entre -15% y +15%
        let variation = 1 + ((Math.random() - 0.5) * 0.30);
        array.unshift(Math.round(currentPrice * variation));
    }
    array[29] = currentPrice; // Fijar hoy al precio oficial

    const min = Math.min(...array);
    const max = Math.max(...array);
    const avg = Math.round(array.reduce((a,b)=>a+b, 0) / 30);
    const goodDeal = currentPrice <= avg;

    return { storeDef: sDef, historyData: array, minPrice: min, maxPrice: max, avgPrice: avg, isGoodDeal: goodDeal };
  }, [product, storeResult]);

  if (!product || !storeResult) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Nav Header */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-down" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Análisis de Mercado</Text>
          <View style={{width: 32}} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Card Principal de Producto */}
          <View style={styles.productCard}>
            <Image 
              source={product.source || { uri: product.image }} 
              style={styles.mainImage} 
            />
            <View style={styles.productIdentifiers}>
              <View style={[styles.storePill, { backgroundColor: storeDef.color + '20' }]}>
                <Text style={[styles.storePillText, { color: storeDef.color }]}>{storeDef.name}</Text>
              </View>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.name}>{product.name}</Text>
              
              <View style={styles.currentPriceRow}>
                <Text style={styles.currentPriceLabel}>A Hoy:</Text>
                <Text style={styles.currentPrice}>${storeResult.price.toLocaleString('es-CL')}</Text>
              </View>
              <Text style={styles.updateTime}>Actualizado hace {Math.floor(Math.random() * 20 + 2)} mins</Text>
            </View>
          </View>

          {/* Veredicto */}
          <View style={[styles.verdictBox, isGoodDeal ? styles.verdictGood : styles.verdictBad]}>
            <Ionicons name={isGoodDeal ? "happy" : "warning"} size={32} color={isGoodDeal ? colors.success : colors.warning} />
            <View style={styles.verdictTextCol}>
              <Text style={styles.verdictTitle}>
                {isGoodDeal ? "¡Es un buen momento!" : "Precio por sobre el promedio"}
              </Text>
              <Text style={styles.verdictSub}>
                {isGoodDeal 
                  ? "El valor actual está por debajo de la media mensual de los últimos 30 días."
                  : "Considera esperar. El costo está más elevado de lo usual en este supermercado."}
              </Text>
            </View>
          </View>

          {/* Gráfico de Barras Vectorial Simulado */}
          <Text style={styles.sectionTitle}>Evolución 30 Días</Text>
          <View style={styles.chartContainer}>
            <Text style={styles.avgLineLabel}>Promedio Prom. ${avgPrice}</Text>
            <View style={styles.chartArea}>
              
              {/* Línea horizontal del Promedio (Proporcional visual) */}
              <View style={[styles.avgLine, { bottom: '50%' }]} />
              
              {/* Columnas */}
              {historyData.map((val, index) => {
                // calculamos un porcentaje simple usando diferencias min, max, e inflando la base para que no quede vacía
                const range = maxPrice - minPrice;
                const paddedRange = range === 0 ? 1 : range;
                const normalize = ((val - minPrice) / paddedRange) * 100; // De 0 a 100% de la altitud
                // Ajustamos para que la más chica tenga al menos 15% de alto y la máxima 100%
                const finalHeight = 15 + (normalize * 0.85);

                const isToday = index === 29;
                return (
                  <View key={`bar-${index}`} style={styles.barWrap}>
                    <View style={[
                      styles.barColumn, 
                      { height: `${finalHeight}%`, backgroundColor: isToday ? storeDef.color : colors.border },
                      isToday && { backgroundColor: isGoodDeal ? colors.success : colors.danger }
                    ]} />
                  </View>
                )
              })}
            </View>
            <View style={styles.chartXAxis}>
              <Text style={styles.axisDate}>Mes Pasado</Text>
              <Text style={[styles.axisDate, { fontWeight: 'bold' }]}>Hoy</Text>
            </View>
          </View>

          {/* Metricas Frias */}
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricTitle}>Costo Máximo</Text>
              <Text style={styles.metricValue}>${maxPrice}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricTitle}>Media Mensual</Text>
              <Text style={[styles.metricValue, {color: colors.primary}]}>${avgPrice}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricTitle}>Piso Histórico</Text>
              <Text style={styles.metricValue}>${minPrice}</Text>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.btnActionLeft} onPress={() => { addToList(product); onClose(); }}>
              <Ionicons name="cart" size={20} color={colors.card} style={{marginRight: 8}}/>
              <Text style={styles.btnActionTextMain}>A Mi Lista</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnActionRight} onPress={() => { 
              const target = Math.round(storeResult.price * 0.9);
              addAlert(product.id, target, [storeResult.supermarketId]);
              onClose(); 
            }}>
              <Ionicons name="notifications" size={20} color={colors.primary} style={{marginRight: 8}}/>
              <Text style={styles.btnActionTextSec}>Avisar si baja</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: 4, backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  navTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  scroll: { flex: 1, padding: 16 },

  productCard: { flexDirection: 'row', backgroundColor: colors.card, padding: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4 },
  mainImage: { width: 100, height: 100, resizeMode: 'contain', marginRight: 16, borderRadius: 12 },
  productIdentifiers: { flex: 1, justifyContent: 'center'},
  storePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  storePillText: { fontSize: 12, fontWeight: 'bold' },
  brand: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase' },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 2, marginBottom: 12 },
  currentPriceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  currentPriceLabel: { fontSize: 14, color: colors.textMuted, marginBottom: 2 },
  currentPrice: { fontSize: 24, fontWeight: '900', color: colors.text },
  updateTime: { fontSize: 11, color: colors.primary, marginTop: 4, fontWeight: '500' },

  verdictBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginTop: 24, borderWidth: 1 },
  verdictGood: { backgroundColor: colors.success + '10', borderColor: colors.success + '40' },
  verdictBad: { backgroundColor: colors.warning + '10', borderColor: colors.warning + '40' },
  verdictTextCol: { flex: 1, marginLeft: 16 },
  verdictTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  verdictSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 32, marginBottom: 16 },
  
  chartContainer: { backgroundColor: colors.card, borderRadius: 16, padding: 16, paddingVertical: 24, borderWidth: 1, borderColor: colors.border },
  avgLineLabel: { position: 'absolute', top: 12, right: 16, fontSize: 12, color: colors.textMuted, zIndex: 2 },
  chartArea: { height: 150, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 },
  avgLine: { position: 'absolute', left: 0, right: 0, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.textMuted, opacity: 0.3, zIndex: 0 },
  barWrap: { flex: 1, marginHorizontal: 2, alignItems: 'center', justifyContent: 'flex-end', height: '100%', zIndex: 1 },
  barColumn: { width: '100%', borderRadius: 4, opacity: 0.85 },
  chartXAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4 },
  axisDate: { fontSize: 12, color: colors.textMuted },

  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginTop: 16 },
  metricBox: { flex: 1, alignItems: 'center' },
  metricTitle: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  metricDivider: { width: 1, height: '80%', alignSelf: 'center', backgroundColor: colors.border },

  actionsContainer: { flexDirection: 'row', marginTop: 32, marginBottom: 50, gap: 12 },
  btnActionLeft: { flex: 1, backgroundColor: colors.primary, flexDirection: 'row', height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 16, elevation: 2 },
  btnActionTextMain: { color: colors.card, fontSize: 16, fontWeight: 'bold' },
  btnActionRight: { flex: 1, backgroundColor: colors.background, flexDirection: 'row', height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: colors.primary },
  btnActionTextSec: { color: colors.primary, fontSize: 16, fontWeight: '600' }
});
