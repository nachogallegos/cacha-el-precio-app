import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppColors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Escanea en Segundos',
    description: 'En el supermercado o en tu despensa. Usa tu cámara para escanear el código de barras y descubre la magia al instante.',
    icon: 'barcode-outline',
  },
  {
    id: '2',
    title: 'Ahorra Inteligente',
    description: 'Compara al milisegundo el precio de 5 súpermercados gigantes. Nunca pagues de más por tu leche o detergente.',
    icon: 'cart-outline',
  },
  {
    id: '3',
    title: 'Alertas Ninja',
    description: 'Fija un precio objetivo. Nuestros bots monitorearán las tiendas de madrugada y te avisaremos apenas haya una oferta real.',
    icon: 'notifications-outline',
  }
];

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const colors = useAppColors();
  const styles = getStyles(colors);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.iconCircle}>
        <Ionicons name={item.icon} size={80} color={colors.primary} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Botón Omitir */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onFinish}>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>
      </View>

      {/* Carrusel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      {/* Navegación Inferior */}
      <View style={styles.bottomSection}>
        {renderPagination()}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Empezar a Ahorrar' : 'Siguiente'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'flex-end', padding: 20 },
  skipText: { color: colors.textMuted, fontSize: 16, fontWeight: '600' },
  slide: { width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 24 },
  bottomSection: { padding: 40, alignItems: 'center' },
  paginationContainer: { flexDirection: 'row', marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 4 },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  nextBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, alignItems: 'center', width: '100%', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  nextBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
