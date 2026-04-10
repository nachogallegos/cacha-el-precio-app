import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function SupermarketBadge({ name, brandColor }) {
  return (
    <TouchableOpacity style={[styles.badge, { borderColor: brandColor }]} activeOpacity={0.7}>
      <View style={[styles.colorDot, { backgroundColor: brandColor }]} />
      <Text style={styles.text}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  }
});
