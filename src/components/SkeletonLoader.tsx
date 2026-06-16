import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');

function Shimmer({ style }: { style: any }) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[style, { opacity }]}>
      <LinearGradient
        colors={[colors.surface, colors.surfaceElevated, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

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
          <Shimmer style={[styles.image, { borderRadius: BorderRadius.md, height: cardHeight, backgroundColor: colors.surface }]} />
          <Shimmer style={[styles.textBlock, { backgroundColor: colors.surface }]} />
          <Shimmer style={[styles.textBlockSmall, { backgroundColor: colors.surface }]} />
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
    <View style={styles.rowContainer}>
      <Shimmer style={[styles.rowTitle, { backgroundColor: colors.surface }]} />
      <View style={styles.row}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={[styles.rowCard, { width: cardWidth }]}>
            <Shimmer style={[styles.image, { borderRadius: BorderRadius.md, height: cardHeight, backgroundColor: colors.surface }]} />
            <Shimmer style={[styles.textBlock, { backgroundColor: colors.surface }]} />
            <Shimmer style={[styles.textBlockSmall, { backgroundColor: colors.surface }]} />
          </View>
        ))}
      </View>
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
  rowContainer: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  rowTitle: {
    height: 16,
    width: '40%',
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.xl,
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
    overflow: 'hidden',
  },
  textBlock: {
    height: 12,
    borderRadius: BorderRadius.xs,
    marginBottom: 6,
    overflow: 'hidden',
  },
  textBlockSmall: {
    height: 10,
    borderRadius: BorderRadius.xs,
    width: '60%',
    overflow: 'hidden',
  },
});
