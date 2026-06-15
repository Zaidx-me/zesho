import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { BookCard } from './BookCard';
import { Book } from '../types';
import { Spacing, FontSize } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface BookRowProps {
  title: string;
  books: Book[];
  loading?: boolean;
  bookSize?: number;
}

export function BookRow({ title, books, loading, bookSize = 140 }: BookRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {books.map((book) => (
            <View key={book.id} style={[styles.bookWrapper, { width: bookSize }]}>
              <BookCard book={book} size={bookSize} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  bookWrapper: {
    marginRight: Spacing.sm,
  },
  loader: {
    height: 220,
  },
});
