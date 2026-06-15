import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookCard } from '../../src/components/BookCard';
import { Book } from '../../src/types';
import { searchBooks } from '../../src/services/googleBooks';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';

const CATEGORIES = ['All', 'Fiction', 'Science', 'Technology', 'History', 'Romance', 'Education', 'Textbooks'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const books = await searchBooks(searchQuery);
      setResults(books);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = async (category: string) => {
    setSelectedCategory(category);
    const searchQuery = category === 'All' ? 'books' : category.toLowerCase();
    setQuery(searchQuery);
    await handleSearch(searchQuery);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Search</Text>
        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceElevated }]}>
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

      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              { backgroundColor: selectedCategory === cat ? colors.primary : colors.surfaceElevated },
            ]}
            onPress={() => handleCategoryPress(cat)}
          >
            <Text
              style={[styles.categoryText, { color: selectedCategory === cat ? colors.white : colors.textSecondary }]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.resultsList}
          columnWrapperStyle={styles.resultsRow}
          renderItem={({ item }) => (
            <View style={styles.bookItem}>
              <BookCard book={item} />
            </View>
          )}
          ListEmptyComponent={
            searched ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No books found</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Try a different search term</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: FontSize.lg,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  resultsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  resultsRow: {
    justifyContent: 'space-between',
  },
  bookItem: {
    width: '48%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.huge * 2,
  },
  emptyText: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
  },
});
