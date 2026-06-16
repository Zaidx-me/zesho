import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BookCard } from '../../src/components/BookCard';
import { RequestBookModal } from '../../src/components/RequestBookModal';
import { Book } from '../../src/types';
import { searchBooks } from '../../src/services/googleBooks';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { q: initialQuery } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    if (initialQuery) handleSearch(initialQuery);
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const books = await searchBooks(searchQuery);
      setResults(books);
    } catch {}
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Search</Text>
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search books, authors..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.buttonPrimary} style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.resultsList}
          columnWrapperStyle={results.length > 0 ? styles.resultsRow : undefined}
          renderItem={({ item }) => (
            <View style={styles.bookItem}>
              <BookCard book={item} />
            </View>
          )}
          ListEmptyComponent={
            searched ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No books found</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Try a different search term</Text>
                <TouchableOpacity
                  style={[styles.requestBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                  onPress={() => setShowRequest(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.textPrimary} />
                  <Text style={[styles.requestBtnText, { color: colors.textPrimary }]}>Request This Book</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Search for books</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Find your next great read</Text>
              </View>
            )
          }
        />
      )}

      <RequestBookModal visible={showRequest} onClose={() => setShowRequest(false)} prefilledTitle={query} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.lg },
  title: { fontSize: FontSize.heading3, fontWeight: '800', marginBottom: Spacing.lg },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, gap: Spacing.sm, borderWidth: 1,
  },
  searchInput: { flex: 1, height: 48, fontSize: FontSize.bodyMd },
  loader: { flex: 1, justifyContent: 'center' },
  resultsList: { paddingHorizontal: Spacing.xxl, paddingBottom: 100 },
  resultsRow: { justifyContent: 'space-between' },
  bookItem: { width: '48%' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: FontSize.heading5, fontWeight: '600', marginTop: Spacing.lg },
  emptySubtext: { fontSize: FontSize.bodyMd, marginTop: Spacing.sm },
  requestBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg, borderWidth: 1, marginTop: Spacing.xxl,
  },
  requestBtnText: { fontSize: FontSize.bodyMd, fontWeight: '600' },
});
