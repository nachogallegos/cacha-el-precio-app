import React, { useState, useMemo, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert, Keyboard, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supermarkets } from '../data/mockData';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { ListContext } from '../context/ListContext';
import { AlertsContext } from '../context/AlertsContext';
import { ActivityContext } from '../context/ActivityContext';
import ProductDetailScreen from './ProductDetailScreen';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function SearchScreen({ route }) {
  const { products: supabaseProducts, loading: dbLoading, searchProducts } = useSupabaseProducts();
  
  // Mezclar productos de Supabase con los de mockData (fallback)
  const fullProductsDatabase = supabaseProducts.length > 0 ? supabaseProducts : [];
  const availableCategories = useMemo(() => {
    return ['Despensa', 'Lácteos', 'Carnes', 'Fiambrería', 'Aseo Personal', 'Aseo Hogar', 'Mascotas', 'Bebidas', 'Frutas y Verduras', 'Snacks'];
  }, [fullProductsDatabase]);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [activeCategory, setActiveCategory] = useState('Lácteos'); // Por defecto para evitar ver "Todos" mezclados
  const [activeStores, setActiveStores] = useState(supermarkets.map(s => s.id));
  const [catalogSortOption, setCatalogSortOption] = useState('relevance');
  const [sortAscending, setSortAscending] = useState(true);
  const [detailItem, setDetailItem] = useState(null); 
  const [touchStartX, setTouchStartX] = useState(0);
  const [isCratingDelay, setIsCratingDelay] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  
  const { addToList } = useContext(ListContext);
  const { addAlert } = useContext(AlertsContext);
  const { addSavings, addRecentSearch } = useContext(ActivityContext);

  useEffect(() => {
    if (route?.params?.autoProduct) {
      const product = fullProductsDatabase.find(p => p.id === route.params.autoProduct);
      if (product) {
        handleSelectProduct(product);
      }
    }
    
    if (route?.params?.focusStore) {
      setActiveStores([route.params.focusStore]);
      setSelectedProduct(null); // Obligar a ir al catálogo general pre-filtrado por esa tienda
    }
  }, [route?.params]);

  const searchSuggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return fullProductsDatabase.filter(
      p => p.name.toLowerCase().includes(lowerQuery) || p.brand.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }, [query]);

  const handleSelectProduct = (product) => {
    Keyboard.dismiss();
    setQuery('');
    
    // Fake Network Delay (Realidad)
    setIsCratingDelay(true);
    setTimeout(() => {
      setSelectedProduct(product);
      setIsCratingDelay(false);
      
      addRecentSearch(product);
      const validPrices = product.prices.filter(p => p.stock);
      if(validPrices.length > 1) {
        const max = Math.max(...validPrices.map(p => p.price));
        const min = Math.min(...validPrices.map(p => p.price));
        addSavings(max - min);
      }
    }, 600);
  };

  const openScanner = async () => {
    if (!permission) {
      // Cargando permisos...
      return;
    }
    if (!permission.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert("Permiso denegado", "Necesitamos acceso a la cámara para escanear los productos.");
        return;
      }
    }
    setShowScanner(true);
  };

  const handleBarcodeScanned = ({ type, data }) => {
    setShowScanner(false);
    
    // En produccion se haria: const matched = fullProductsDatabase.find(p => p.id === data)
    // Para no bloquear la demostracion MVP si escanea algo que no tenemos, forzaremos mostrar el producto Aleatorio:
    const randomPro = fullProductsDatabase[Math.floor(Math.random() * fullProductsDatabase.length)];
    handleSelectProduct(randomPro);
  };

  const toggleStore = (id) => {
    setActiveStores(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  // Comparador de Precios para el producto seleccionado
  const displayPrices = useMemo(() => {
    if (!selectedProduct) return [];
    // Extraer solo 1 precio (el más bajo) por supermercado para no repetir logos
    const uniqueMap = {};
    selectedProduct.prices.forEach(p => {
      if (!uniqueMap[p.supermarketId] || p.price < uniqueMap[p.supermarketId].price) {
        uniqueMap[p.supermarketId] = p;
      }
    });

    let prices = Object.values(uniqueMap);
    prices.sort((a, b) => sortAscending ? a.price - b.price : b.price - a.price);
    return prices;
  }, [selectedProduct, sortAscending]);

  // Lista de Categoría para el modo exploración
  const categoryProducts = useMemo(() => {
    let list = activeCategory ? fullProductsDatabase.filter(p => p.category === activeCategory) : [...fullProductsDatabase];
    
    // Función auxiliar para extraer el mejor precio disponible considerando los supermercados activos
    const getMinPrice = (p) => {
      const validPrices = p.prices.filter(pr => activeStores.includes(pr.supermarketId) && pr.stock);
      return validPrices.length > 0 ? Math.min(...validPrices.map(pr => pr.price)) : 9999999;
    };

    if (catalogSortOption === 'price_asc') {
      list.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    } else if (catalogSortOption === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [activeCategory, fullProductsDatabase, catalogSortOption, activeStores]);

  const handleAddToList = (priceItem) => {
    addToList(selectedProduct);
    const store = supermarkets.find(s => s.id === priceItem.supermarketId);
    Alert.alert("Agregado a Mi Lista", `Añadiste ${selectedProduct.name} a tu carrito de compras global.`);
  };

  const handleCreateAlert = () => {
    const minPrice = displayPrices.length > 0 ? Math.min(...displayPrices.map(p => p.price)) : 1000;
    const target = Math.round(minPrice * 0.9); 
    addAlert(selectedProduct.id, selectedProduct.name, target, activeStores);
    Alert.alert("Alerta Creada", `Te avisaremos cuando el precio de ${selectedProduct.name} baje de \$${target}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* CABECERA ALTA: Buscador y Filtros Globales (Tiendas) */}
        <View style={{zIndex: 10, backgroundColor: colors.background, elevation: 2, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8, flexDirection: 'row', alignItems: 'center'}}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ej: Pan, Leche, Omo..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.scannerBtnInner} onPress={openScanner}>
             <Ionicons name="barcode-outline" size={22} color={colors.card} />
          </TouchableOpacity>
        </View>

        {query.length >= 2 && !selectedProduct && searchSuggestions.length > 0 && (
            <View style={styles.autocompleteContainer}>
              {searchSuggestions.map(item => (
                <TouchableOpacity key={item.id} style={styles.suggestionItem} onPress={() => handleSelectProduct(item)}>
                  <Ionicons name="search-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.suggestionText}>{item.name} <Text style={styles.suggestionBrand}>({item.brand})</Text></Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Filtros Activos de Tiendas - Siempre visibles para gobernar Catálogo y Comparador */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={{paddingRight: 16}}>
            {supermarkets.map((store) => {
              const isActive = activeStores.includes(store.id);
              return (
                <TouchableOpacity 
                  key={store.id} 
                  style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                  onPress={() => toggleStore(store.id)}
                >
                  <View style={[styles.filterLogoWrap, isActive && { borderColor: store.color }]}>
                    <Image source={{uri: store.logoUrl}} style={styles.filterLogo} />
                  </View>
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{store.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

        {isCratingDelay ? (
          <View style={{flex: 1, padding: 16, marginTop: 20}}>
            <Text style={{fontSize: 16, color: colors.primary, marginBottom: 24, textAlign: 'center', fontWeight: 'bold'}}>Conectando con supermercados...</Text>
            <View style={{height: 70, backgroundColor: colors.border, borderRadius: 12, opacity: 0.3, marginBottom: 16}} />
            <View style={{height: 40, width: '60%', backgroundColor: colors.border, borderRadius: 8, opacity: 0.3, marginBottom: 24}} />
            <View style={{height: 90, backgroundColor: colors.border, borderRadius: 12, opacity: 0.3, marginBottom: 12}} />
            <View style={{height: 90, backgroundColor: colors.border, borderRadius: 12, opacity: 0.3}} />
          </View>
        ) : !selectedProduct ? (
          <View style={{flex: 1}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesLine} contentContainerStyle={{paddingHorizontal: 16, alignItems: 'center'}}>
              {availableCategories.map(cat => {
                const isActive = activeCategory === cat;
                return (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.catBtn, isActive && styles.catBtnActive]}
                    onPress={() => setActiveCategory(cat)}
                  >
                    <Text style={[styles.catText, isActive && styles.catTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.catalogGrid}>
              <View style={[styles.catalogHeader, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                  <Text style={styles.catalogTitle}>
                    {activeCategory ? `Catálogo de ${activeCategory}` : 'Todos los productos'}
                  </Text>
                  {dbLoading && <ActivityIndicator size="small" color={colors.primary} style={{marginLeft: 8}} />}
                </View>
                
                {/* Selector de Orden */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight: 16}}>
                  <Text style={{color: colors.textMuted, fontSize: 12, marginRight: 8, alignSelf: 'center'}}>Ordenar por:</Text>
                  
                  <TouchableOpacity 
                    style={[styles.sortChip, catalogSortOption === 'relevance' && styles.sortChipActive]} 
                    onPress={() => setCatalogSortOption('relevance')}
                  >
                    <Text style={[styles.sortChipText, catalogSortOption === 'relevance' && styles.sortChipTextActive]}>Relevancia</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.sortChip, catalogSortOption === 'price_asc' && styles.sortChipActive]} 
                    onPress={() => setCatalogSortOption('price_asc')}
                  >
                    <Text style={[styles.sortChipText, catalogSortOption === 'price_asc' && styles.sortChipTextActive]}>Menor Precio</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.sortChip, catalogSortOption === 'name_asc' && styles.sortChipActive]} 
                    onPress={() => setCatalogSortOption('name_asc')}
                  >
                    <Text style={[styles.sortChipText, catalogSortOption === 'name_asc' && styles.sortChipTextActive]}>A-Z</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              <View style={styles.gridWrap}>
                {categoryProducts.map(p => {
                  const validPrices = p.prices.filter(pr => activeStores.includes(pr.supermarketId) && pr.stock);
                  const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map(pr => pr.price)) : 0;

                  return (
                    <TouchableOpacity key={`cat-${p.id}`} style={styles.gridItemCard} onPress={() => handleSelectProduct(p)}>
                      <Image source={p.source || {uri: p.image}} style={styles.gridImg} />
                      <Text style={styles.gridBrand}>{p.brand}</Text>
                      <Text style={styles.gridName} numberOfLines={2}>{p.name}</Text>
                      
                      {minPrice > 0 ? (
                        <View style={styles.gridPriceBox}>
                           <Text style={styles.gridDesde}>Desde</Text>
                           <Text style={styles.gridPrice}>${minPrice}</Text>
                        </View>
                      ) : (
                        <Text style={styles.gridOOS}>Sin Stock</Text>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>
          </View>

        ) : (
          
          /* MODO COMPARADOR DETALLADO */
          <View style={{flex: 1}}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsContainer} keyboardShouldPersistTaps="handled">
              
              <View style={styles.comparadorHeader}>
              <TouchableOpacity onPress={() => setSelectedProduct(null)} style={styles.backToCatBtn}>
                 <Ionicons name="arrow-back" size={20} color={colors.primary} />
                 <Text style={styles.backToCatText}>Volver a Categorías</Text>
              </TouchableOpacity>
              <Text style={styles.resultsHeader}>
                Cotizando <Text style={{fontWeight: 'bold'}}>"{selectedProduct.name}"</Text>
              </Text>
            </View>

            <View style={styles.productBaseInfo}>
              <Image source={selectedProduct.source || { uri: selectedProduct.image }} style={styles.productImage} />
              <View style={styles.productTextInfo}>
                <Text style={styles.productBrand}>{selectedProduct.brand}</Text>
                <Text style={styles.productName}>{selectedProduct.name}</Text>
                <TouchableOpacity style={styles.createAlertLink} onPress={handleCreateAlert}>
                  <Ionicons name="notifications" size={16} color={colors.primaryLight} />
                  <Text style={styles.createAlertText}>Crear Alerta de Precio</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sortToggleRow}>
              <TouchableOpacity style={[styles.filterBtn, styles.filterBtnSort, {marginBottom: 0}]} onPress={() => setSortAscending(!sortAscending)}>
                <Ionicons name={sortAscending ? "arrow-up" : "arrow-down"} size={16} color={colors.card} style={styles.filterIcon} />
                <Text style={styles.filterTextActive}>Ordenar: {sortAscending ? 'Más baratos' : 'Más caros'}</Text>
              </TouchableOpacity>
            </View>

            {displayPrices.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay supermercados seleccionados para comparar.</Text>
              </View>
            ) : (
              <View style={styles.pricesList}>
                {displayPrices.map((result, index) => {
                  const sm = supermarkets.find(s => s.id === result.supermarketId) || { name: result.supermarketId, color: '#999' };
                  const isBestPrice = index === 0 && sortAscending; 

                  return (
                    <TouchableOpacity 
                      key={`${result.supermarketId}-${index}`} 
                      style={[styles.priceCard, isBestPrice && styles.bestPriceCard]}
                      activeOpacity={0.7}
                      onPress={() => setDetailItem(result)}
                    >
                      {isBestPrice && (
                        <View style={styles.bestPriceBadge}>
                          <Text style={styles.bestPriceText}>Mejor Precio</Text>
                        </View>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View style={[styles.colorDot, { backgroundColor: sm.color }]} />
                          <View>
                            <Text style={styles.supermarketName}>{sm.name}</Text>
                            {!result.stock && <Text style={styles.noStockText}>(Sin stock)</Text>}
                          </View>
                        </View>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={styles.priceValue}>${result.price}</Text>
                          <TouchableOpacity 
                            style={[styles.addBtn, !result.stock && { backgroundColor: colors.textMuted }]}
                            onPress={() => handleAddToList(result)}
                          >
                            <Ionicons name="add" size={14} color={colors.card} style={{marginRight:2}} />
                            <Text style={styles.addBtnText}>Lista</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            
            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* SENSOR INVISIBLE PARA DESLIZAR A LA IZQUIERDA (VOLVER) */}
          <View 
            style={styles.swipeBackZone}
            onTouchStart={(e) => setTouchStartX(e.nativeEvent.pageX)}
            onTouchEnd={(e) => {
              // Si tocó el borde izquierdo y arrastró más de 30px a la derecha...
              if (e.nativeEvent.pageX - touchStartX > 30) {
                setSelectedProduct(null);
              }
            }}
          />
        </View>
        )}
      </View>

      <ProductDetailScreen 
        visible={detailItem !== null} 
        onClose={() => setDetailItem(null)} 
        product={selectedProduct} 
        storeResult={detailItem} 
      />

      {/* Escáner Cámara Real */}
      <Modal visible={showScanner} animationType="slide" transparent={false}>
        <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
          {showScanner && (
            <CameraView 
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "upc_a", "qr"],
              }}
              onBarcodeScanned={handleBarcodeScanned}
            >
              <View style={styles.scannerOverlay}>
                <Text style={styles.scannerText}>Apunta al código de barras</Text>
                <View style={styles.scannerFrame}>
                  <View style={styles.laserLine} />
                </View>
                <TouchableOpacity style={styles.scannerCancelBtn} onPress={() => setShowScanner(false)}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>Cancelar Escaneo</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  
  // Search + Filters
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 12, borderRadius: 24, flex: 1, elevation: 2, height: 44, borderWidth: 1, borderColor: colors.border },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  autocompleteContainer: { position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: colors.card, borderRadius: 12, elevation: 5, zIndex: 20, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: colors.border },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestionText: { marginLeft: 12, fontSize: 16, color: colors.text },
  suggestionBrand: { color: colors.textMuted, fontSize: 14 },
  
  filtersScroll: { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 0 },
  filterBtn: { alignItems: 'center', marginRight: 16, opacity: 0.5 },
  filterBtnActive: { opacity: 1 },
  filterIcon: { marginRight: 4 },
  filterText: { color: colors.textMuted, fontWeight: '600', fontSize: 10, marginTop: 4 },
  filterTextActive: { color: colors.primary, fontWeight: 'bold' },
  filterLogoWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  filterLogo: { width: 28, height: 28, resizeMode: 'contain' },

  categoriesLine: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 4, marginVertical: 0, marginTop: 12, height: 48, flexGrow: 0 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  catBtnActive: { backgroundColor: colors.primary + '20' },
  catText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  catTextActive: { color: colors.primary, fontWeight: 'bold' },
  
  swipeBackZone: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 35, zIndex: 999 },

  // Escáner Real
  scannerBtnInner: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, marginLeft: 8, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  scannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  scannerText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 40, textShadowColor: '#000', textShadowRadius: 10 },
  scannerFrame: { width: 250, height: 150, borderWidth: 2, borderColor: colors.primary, borderRadius: 12, overflow: 'hidden', justifyContent: 'center', backgroundColor: 'transparent' },
  laserLine: { width: '100%', height: 2, backgroundColor: colors.success, shadowColor: colors.success, shadowOffset: {width: 0, height: 0}, shadowOpacity: 1, shadowRadius: 10, elevation: 5 },
  scannerCancelBtn: { marginTop: 40, padding: 12, paddingHorizontal: 24, backgroundColor: colors.danger, borderRadius: 8 },

  // Grilla de Catálogo
  catalogGrid: { padding: 12 },
  catalogHeader: { marginBottom: 16 },
  catalogTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.border, marginRight: 8 },
  sortChipActive: { backgroundColor: colors.primary },
  sortChipText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  sortChipTextActive: { color: colors.card, fontWeight: 'bold' },
  
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItemCard: { width: '31.5%', backgroundColor: colors.card, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  gridImg: { width: 50, height: 50, resizeMode: 'contain', marginBottom: 8 },
  gridBrand: { fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', alignSelf: 'flex-start' },
  gridName: { fontSize: 11, fontWeight: '600', color: colors.text, height: 32, lineHeight: 14, alignSelf: 'flex-start', marginTop: 2 },
  gridPriceBox: { alignSelf: 'flex-start', marginTop: 6 },
  gridDesde: { fontSize: 9, color: colors.textMuted },
  gridPrice: { fontSize: 14, fontWeight: '900', color: colors.text },
  gridOOS: { alignSelf: 'flex-start', marginTop: 8, fontSize: 10, color: colors.danger, fontWeight: 'bold' },

  // Comparador Específico
  resultsContainer: { padding: 12 },
  comparadorHeader: { marginBottom: 12 },
  backToCatBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backToCatText: { fontSize: 13, fontWeight: '600', color: colors.primary, marginLeft: 4 },
  resultsHeader: { fontSize: 16, color: colors.text },
  productBaseInfo: { flexDirection: 'row', backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 16, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05 },
  productImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, resizeMode: 'contain' },
  productTextInfo: { flex: 1 },
  productBrand: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase' },
  productName: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginTop: 2 },
  createAlertLink: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  createAlertText: { marginLeft: 4, color: colors.primaryLight, fontWeight: '600', fontSize: 13 },
  sortToggleRow: { marginBottom: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: colors.textMuted, fontSize: 16 },
  
  pricesList: { gap: 8 },
  priceCard: { backgroundColor: colors.card, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  bestPriceCard: { borderColor: colors.success, borderWidth: 2, marginTop: 4 },
  bestPriceBadge: { position: 'absolute', top: -10, left: 12, backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  bestPriceText: { color: colors.card, fontSize: 10, fontWeight: 'bold' },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  supermarketName: { fontSize: 14, fontWeight: 'bold', color: colors.text },
  noStockText: { color: colors.danger, fontSize: 10, marginTop: 2 },
  priceValue: { fontSize: 17, fontWeight: '900', color: colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  addBtnText: { color: colors.card, fontWeight: 'bold', fontSize: 12 },
  bottomSpacer: { height: 40 }
});
