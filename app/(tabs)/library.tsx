import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookCard } from '../../src/components/BookCard';
import { useTheme } from '../../src/context/ThemeContext';
import { Book } from '../../src/types';
import { getAllUrduBooks } from '../../src/services/urduBooks';
import { getCachedBooks } from '../../src/services/bookCache';
import { searchBooks } from '../../src/services/googleBooks';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const loadAllBooks = useCallback(async () => {
    try {
      setLoading(true);
      // Load local Urdu books (instant)
      const urduBooks = getAllUrduBooks(2138);
      // Load other categories from cache or API
      const [pop, fic, sci, po, re, sh] = await Promise.allSettled([
        getCachedBooks('popular', 'popular fiction', 10),
        getCachedBooks('fiction', 'classic literature', 10),
        getCachedBooks('science', 'science nature', 10),
        getCachedBooks('poetry', 'poetry anthology', 10),
        getCachedBooks('religion', 'religion spirituality', 10),
        getCachedBooks('self-help', 'self help motivation', 10),
      ]);
      const apiBooks: Book[] = [];
      for (const r of [pop, fic, sci, po, re, sh]) {
        if (r.status === 'fulfilled') apiBooks.push(...r.value);
      }
      // Deduplicate
      const seen = new Set<string>();
      const all: Book[] = [];
      for (const book of [...urduBooks, ...apiBooks]) {
        const key = book.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seen.has(key)) { seen.add(key); all.push(book); }
      }
      setBooks(all);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllBooks(); }, [loadAllBooks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllBooks();
    setRefreshing(false);
  };

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { loadAllBooks(); return; }
    setSearching(true);
    try { const results = await searchBooks(q, 30); setBooks(results); } catch {}
    setSearching(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Library</Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search books..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {(loading || searching) ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />}
          renderItem={({ item }) => (
            <View style={styles.bookItem}>
              <BookCard book={item} size={160} />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="book-outline" size={56} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No books found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.heading3, fontWeight: '800', letterSpacing: -0.5 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.xl, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, height: 44, gap: Spacing.sm, borderWidth: 1, marginBottom: Spacing.md },
  searchInput: { flex: 1, fontSize: FontSize.bodyMd },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between' },
  bookItem: { width: '48%', marginBottom: Spacing.md },
  emptyWrap: { alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: FontSize.heading5, fontWeight: '600', marginTop: Spacing.md },
});
