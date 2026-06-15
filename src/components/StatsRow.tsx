import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface StatsRowProps {
  rating: number;
  pageCount: number;
  status?: string;
}

export function StatsRow({ rating, pageCount, status }: StatsRowProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.glassLight }]}>
      <View style={styles.stat}>
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{rating > 0 ? rating.toFixed(1) : 'N/A'}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.stat}>
        <Ionicons name="document-text" size={20} color={colors.primary} />
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{pageCount || 'N/A'}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pages</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.stat}>
        <Ionicons name="bookmark" size={20} color={colors.success} />
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{status || 'New'}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Status</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
  },
});
