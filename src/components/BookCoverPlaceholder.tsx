import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BookCoverPlaceholderProps {
  title: string;
  width: number;
  height: number;
}

const CINEMATIC_GRADIENTS: [string, string][] = [
  ['#0a0a0a', '#1a1a1a'],
  ['#0d1117', '#161b22'],
  ['#0f0f0f', '#2d2d2d'],
  ['#0a0a0a', '#1c1c1e'],
  ['#111111', '#222222'],
  ['#080808', '#1a1a1a'],
  ['#0c0c0c', '#1e1e1e'],
  ['#090909', '#191919'],
  ['#0b0b0b', '#1f1f1f'],
  ['#0a0a0a', '#181818'],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function BookCoverPlaceholder({ title, width, height }: BookCoverPlaceholderProps) {
  const idx = hashString(title) % CINEMATIC_GRADIENTS.length;
  const [startColor, endColor] = CINEMATIC_GRADIENTS[idx]!;

  return (
    <LinearGradient
      colors={[startColor, endColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.container, { width, height }]}
    />
  );
}

export function BookSkeleton({ width, height }: { width: number; height: number }) {
  return (
    <LinearGradient
      colors={['#0a0a0a', '#141414', '#0a0a0a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.skeleton, { width, height }]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
  },
  skeleton: {
    borderRadius: 4,
  },
});
