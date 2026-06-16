import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { BookCard } from '../../src/components/BookCard';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { Book } from '../../src/types';
import { getAllUrduBooks, searchUrduBooks, getUrduBooksByCategory } from '../../src/services/urduBooks';
import { getAllPdfBooks, searchPdfBooks, getPdfBooksByMainCategory } from '../../src/services/pdfBooksFree';
import { searchBooks } from '../../src/services/googleBooks';

const PAGE_SIZE = 30;

const CATEGORY_MAP: Record<string, { source: 'urdu_cat' | 'pdf_cat' | 'google'; urduCat?: string; pdfCat?: string; googleQuery: string }> = {
  famous: { source: 'google', googleQuery: 'famous classic books' },
  trending_now: { source: 'google', googleQuery: 'trending now 2025' },
  islamic: { source: 'urdu_cat', urduCat: 'Islamic Books', pdfCat: 'Islamic Books', googleQuery: 'Islamic books' },
  urdu_novels: { source: 'urdu_cat', urduCat: 'Urdu Novels', googleQuery: 'Urdu novels' },
  history: { source: 'urdu_cat', urduCat: 'History Books', pdfCat: 'History', googleQuery: 'history biography' },
  poetry: { source: 'urdu_cat', urduCat: 'Poetry Books', googleQuery: 'poetry literature' },
  funny: { source: 'urdu_cat', urduCat: 'Funny Books', googleQuery: 'funny humor' },
  pdf_novels: { source: 'pdf_cat', pdfCat: 'Urdu Novels', googleQuery: 'Urdu novels PDF' },
  biography: { source: 'urdu_cat', urduCat: 'Biography', googleQuery: 'biography' },
  tasawwaf: { source: 'urdu_cat', urduCat: 'Tasawwaf', googleQuery: 'tasawwaf sufi' },
  travelogue: { source: 'urdu_cat', urduCat: 'Travelogue', googleQuery: 'travelogue' },
  imran: { source: 'urdu_cat', urduCat: 'Imran Series', googleQuery: 'Imran Series' },
  translate: { source: 'urdu_cat', urduCat: 'Translate Books', googleQuery: 'translated books' },
};

export default function ShelfCategoryScreen() {
  const { category, title, query } = useLocalSearchParams<{
    category: string;
    title: string;
    query?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    loadInitial();
  }, [category, query]);

  const catConfig = CATEGORY_MAP[category || ''] || null;

  const loadBooksForCategory = (limit: number): Book[] => {
    if (!catConfig) return [];

    if (catConfig.source === 'urdu_cat') {
      const seen = new Set<string>();
      const result: Book[] = [];
      if (catConfig.urduCat) {
        for (const b of getUrduBooksByCategory(catConfig.urduCat, limit * 2)) {
          if (!seen.has(b.id)) { seen.add(b.id); result.push(b); }
        }
      }
      if (catConfig.pdfCat) {
        for (const b of getAllPdfBooks().filter(b => b.categories?.includes(catConfig.pdfCat!))) {
          if (result.length >= limit) break;
          if (!seen.has(b.id)) { seen.add(b.id); result.push(b); }
        }
      }
      return result.slice(0, limit);
    }

    if (catConfig.source === 'pdf_cat') {
      const seen = new Set<string>();
      const result: Book[] = [];
      if (catConfig.pdfCat) {
        for (const b of getAllPdfBooks().filter(b => b.categories?.includes(catConfig.pdfCat!))) {
          if (!seen.has(b.id)) { seen.add(b.id); result.push(b); }
        }
      }
      return result.slice(0, limit);
    }

    return [];
  };

  const loadInitial = async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    setBooks([]);
    setHasMore(true);
    setError(null);

    try {
      if (searchMode && searchQuery) {
        const results = await performSearch(searchQuery);
        if (mountedRef.current) setBooks(results);
      } else if (catConfig) {
        if (catConfig.source === 'google') {
          const q = query || catConfig.googleQuery;
          const results = await searchBooks(q, PAGE_SIZE);
          if (mountedRef.current) setBooks(results.filter(b => b.thumbnail));
        } else {
          const results = loadBooksForCategory(PAGE_SIZE);
          if (mountedRef.current) setBooks(results);
          setHasMore(results.length >= PAGE_SIZE);
        }
      } else if (query) {
        const results = await searchBooks(query, PAGE_SIZE);
        if (mountedRef.current) setBooks(results.filter(b => b.thumbnail));
      } else if (title) {
        const results = await searchBooks(title, PAGE_SIZE);
        if (mountedRef.current) setBooks(results.filter(b => b.thumbnail));
      } else {
        if (mountedRef.current) setBooks([]);
      }
    } catch {
      if (mountedRef.current) setError('Failed to load books');
    }

    if (mountedRef.current) setLoading(false);
  };

  const performSearch = async (q: string): Promise<Book[]> => {
    if (catConfig?.source === 'urdu_cat') {
      const urduResults = searchUrduBooks(q, PAGE_SIZE);
      const pdfResults = catConfig.pdfCat
        ? getAllPdfBooks().filter(b => b.categories?.includes(catConfig.pdfCat!) && (
            b.title.toLowerCase().includes(q.toLowerCase()) ||
            b.authors?.some(a => a.toLowerCase().includes(q.toLowerCase()))
          )).slice(0, PAGE_SIZE)
        : [];
      const seen = new Set<string>();
      const merged: Book[] = [];
      for (const b of [...urduResults, ...pdfResults]) {
        if (!seen.has(b.id)) { seen.add(b.id); merged.push(b); }
      }
      return merged.slice(0, PAGE_SIZE);
    }
    return searchBooks(q, PAGE_SIZE);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || searchMode) return;
    setLoadingMore(true);

    try {
      if (catConfig && catConfig.source !== 'google') {
        const moreBooks = loadBooksForCategory(books.length + PAGE_SIZE).slice(books.length);
        if (!mountedRef.current) return;
        if (moreBooks.length === 0) {
          setHasMore(false);
        } else {
          setBooks(prev => [...prev, ...moreBooks]);
        }
      } else {
        setHasMore(false);
      }
    } catch {}

    if (mountedRef.current) setLoadingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitial();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchMode(false);
      loadInitial();
      return;
    }
    setSearchMode(true);
    setLoading(true);
    const results = await performSearch(searchQuery);
    if (mountedRef.current) {
      setBooks(results);
      setLoading(false);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.coolSlate} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: colors.coolSlate }]}>{error}</Text>
          <TouchableOpacity onPress={loadInitial}>
            <Text style={[styles.retryText, { color: colors.textPrimary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="book-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.coolSlate }]}>No books found</Text>
      </View>
    );
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <View style={styles.bookItem}>
      <BookCard book={item} size={110} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
          {!loading && <Text style={[styles.count, { color: colors.textMuted }]}>{books.length} books</Text>}
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSearchMode(!searchMode)}>
          <Ionicons name={searchMode ? 'close' : 'search'} size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {searchMode && (
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search in this category..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
        </View>
      )}

      {loading ? (
        <View style={styles.loadingWrap}>
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View key={i} style={styles.skeletonItem}>
                <View style={[styles.skeletonCard, { backgroundColor: colors.surfaceElevated }]} />
              </View>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={books}
          numColumns={3}
          keyExtractor={(item, i) => `${item.id}_${i}`}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={renderBookItem}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.coolSlate}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.heading5,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  count: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 40,
    gap: Spacing.xs,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.bodySm,
  },
  grid: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  bookItem: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: Spacing.lg,
  },
  loadingWrap: {
    flex: 1,
    padding: Spacing.xl,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonItem: {
    width: '30%',
    marginBottom: Spacing.lg,
  },
  skeletonCard: {
    width: '100%',
    aspectRatio: 0.69,
    borderRadius: BorderRadius.sm,
  },
  footer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.bodyMd,
    fontWeight: '400',
  },
  retryText: {
    fontSize: FontSize.bodyMd,
    fontWeight: '600',
  },
});
