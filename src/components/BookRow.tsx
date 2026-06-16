import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BookCard } from './BookCard';
import { SkeletonRow } from './SkeletonLoader';
import { Book } from '../types';
import { Spacing, FontSize } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface BookRowProps {
  title: string;
  books: Book[];
  loading?: boolean;
  bookSize?: number;
  onSeeAll?: () => void;
}

function areBooksEqual(a: Book[], b: Book[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].thumbnail !== b[i].thumbnail) return false;
  }
  return true;
}

function areRowPropsEqual(prev: BookRowProps, next: BookRowProps) {
  return prev.title === next.title
    && prev.loading === next.loading
    && prev.bookSize === next.bookSize
    && prev.onSeeAll === next.onSeeAll
    && areBooksEqual(prev.books, next.books);
}

export const BookRow = React.memo(function BookRow({ title, books, loading, bookSize = 130, onSeeAll }: BookRowProps) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        </View>
        <SkeletonRow />
      </View>
    );
  }

  if (books.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: colors.textSecondary }]}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
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
    </View>
  );
}, areRowPropsEqual);

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.heading4,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: FontSize.bodySm,
    fontWeight: '400',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
  },
  bookWrapper: {
    marginRight: Spacing.xs,
  },
});
