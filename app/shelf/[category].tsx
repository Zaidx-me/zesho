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
import { searchGutendex, getGutendexByTopic } from '../../src/services/gutendexApi';
import { searchOpenLibrary } from '../../src/services/openLibraryApi';

const PAGE_SIZE = 20;

export default function ShelfCategoryScreen() {
  const { category, title, parentTitle, query } = useLocalSearchParams<{
    category: string;
    title: string;
    parentTitle?: string;
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

  const isUrduCategory = category?.startsWith('urdu_') || category === 'urdu';
  const isPD = category?.startsWith('pd_');
  const isGeneral = category?.startsWith('gen_');

  const getUrduSubQuery = (cat: string): string => {
    const map: Record<string, string> = {
      urdu_novels: 'Urdu Novels',
      urdu_poetry: 'Poetry Books',
      urdu_islamic: 'Islamic Books',
      urdu_history: 'History Books',
      urdu_biography: 'Biography',
      urdu_translate: 'Translate Books',
      urdu_humor: 'Funny Books',
      urdu_tasawwaf: 'Tasawwaf',
      urdu_travelogue: 'Travelogue',
      urdu_imran: 'Imran Series',
    };
    return map[cat] || 'Urdu Books';
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
      } else if (isUrduCategory || category === 'urdu') {
        const subQuery = query || getUrduSubQuery(category || '');
        const results = getUrduBooksByCategory(subQuery, PAGE_SIZE);
        if (mountedRef.current) setBooks(results);
      } else if (isPD) {
        const topic = query || 'fiction';
        const results = await getGutendexByTopic(topic, PAGE_SIZE);
        if (mountedRef.current) setBooks(results);
      } else if (isGeneral) {
        const topic = query || 'general';
        const results = await searchOpenLibrary(topic, PAGE_SIZE);
        if (mountedRef.current) setBooks(results);
      } else {
        const results = await searchOpenLibrary(title || 'books', PAGE_SIZE);
        if (mountedRef.current) setBooks(results);
      }
    } catch {
      if (mountedRef.current) setError('Failed to load books');
    }

    if (mountedRef.current) setLoading(false);
  };

  const performSearch = async (q: string): Promise<Book[]> => {
    if (isUrduCategory || category === 'urdu') {
      return searchUrduBooks(q, PAGE_SIZE);
    }
    const [ol, gd] = await Promise.all([
      searchOpenLibrary(q, PAGE_SIZE),
      searchGutendex(q, PAGE_SIZE),
    ]);
    return [...gd, ...ol].slice(0, PAGE_SIZE);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || searchMode) return;
    setLoadingMore(true);

    try {
      let moreBooks: Book[] = [];
      const offset = (books.length / PAGE_SIZE + 1) * PAGE_SIZE;

      if (isUrduCategory || category === 'urdu') {
        const subQuery = query || getUrduSubQuery(category || '');
        moreBooks = getUrduBooksByCategory(subQuery, offset).slice(books.length);
      } else {
        setHasMore(false);
      }

      if (!mountedRef.current) return;
      if (moreBooks.length === 0) {
        setHasMore(false);
      } else {
        setBooks(prev => [...prev, ...moreBooks]);
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
          {parentTitle && <Text style={[styles.parentTitle, { color: colors.coolSlate }]}>{parentTitle}</Text>}
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSearchMode(!searchMode)}>
          <Ionicons name={searchMode ? 'close' : 'search'} size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {searchMode && (
        <View style={[styles.searchBar, { borderBottomColor: colors.border }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search..."
            placeholderTextColor={colors.coolSlate}
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
          keyExtractor={(item) => item.id}
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
  parentTitle: {
    fontSize: FontSize.micro,
    fontWeight: '500',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: FontSize.heading5,
    fontWeight: '400',
    letterSpacing: -0.9,
    lineHeight: 24,
  },
  searchBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  searchInput: {
    fontSize: FontSize.bodyMd,
    fontWeight: '400',
    letterSpacing: -0.16,
    paddingVertical: Spacing.xs,
  },
  grid: {
    padding: Spacing.xl,
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
    letterSpacing: -0.16,
  },
  retryText: {
    fontSize: FontSize.bodyMd,
    fontWeight: '600',
    letterSpacing: -0.16,
  },
});
