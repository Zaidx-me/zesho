import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  count?: number;
}

export function SkeletonLoader({ count = 6 }: SkeletonLoaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <LinearGradient
            colors={[colors.surface, colors.surfaceElevated, colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.image, { borderRadius: BorderRadius.md }]}
          />
          <View style={[styles.textBlock, { backgroundColor: colors.surfaceElevated }]} />
          <View style={[styles.textBlockSmall, { backgroundColor: colors.surfaceElevated }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: (width - 48) / 2 * 1.4,
    marginBottom: 8,
  },
  textBlock: {
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  textBlockSmall: {
    height: 10,
    borderRadius: 4,
    width: '60%',
  },
});
