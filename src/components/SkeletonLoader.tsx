import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  count?: number;
  columns?: number;
}

export function SkeletonLoader({ count = 6, columns = 2 }: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const cardWidth = (width - Spacing.xl * 2 - Spacing.sm * (columns - 1)) / columns;
  const cardHeight = cardWidth * 1.35;

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.card, { width: cardWidth }]}>
          <View style={[styles.image, { borderRadius: BorderRadius.md, height: cardHeight, backgroundColor: colors.surface }]} />
          <View style={[styles.textBlock, { backgroundColor: colors.surface }]} />
          <View style={[styles.textBlockSmall, { backgroundColor: colors.surface }]} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonRow({ count = 4 }: { count?: number }) {
  const { colors } = useTheme();
  const cardWidth = 130;
  const cardHeight = cardWidth * 1.35;

  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.rowCard, { width: cardWidth }]}>
          <View style={[styles.image, { borderRadius: BorderRadius.md, height: cardHeight, backgroundColor: colors.surface }]} />
          <View style={[styles.textBlock, { backgroundColor: colors.surface }]} />
          <View style={[styles.textBlockSmall, { backgroundColor: colors.surface }]} />
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
    paddingHorizontal: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  rowCard: {
    marginRight: Spacing.sm,
  },
  image: {
    width: '100%',
    marginBottom: Spacing.xs,
  },
  textBlock: {
    height: 12,
    borderRadius: BorderRadius.xs,
    marginBottom: 6,
  },
  textBlockSmall: {
    height: 10,
    borderRadius: BorderRadius.xs,
    width: '60%',
  },
});
