import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function ProductCard({ item }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image source={item.source || { uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.discountPrice}>${item.discountPrice}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginRight: 16,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  infoContainer: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginTop: 4,
    minHeight: 40,
  },
  priceContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  discountPrice: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
});
