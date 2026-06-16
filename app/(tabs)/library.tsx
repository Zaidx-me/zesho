import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  ActivityIndicator, TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { Book } from '../../src/types';
import { getAllUrduBooks } from '../../src/services/urduBooks';
import { getAllPdfBooks } from '../../src/services/pdfBooksFree';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { BookCoverPlaceholder } from '../../src/components/BookCoverPlaceholder';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';

const PAGE_SIZE = 80;

function LibraryBookCard({ book }: { book: Book }) {
  const router = useRouter();
  const { colors } = useTheme();
  const W = 160;
  const H = W * 1.35;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/book/${book.id}`)}
      activeOpacity={0.7}
    >
      <View style={[styles.cardImg, { width: W, height: H, borderRadius: BorderRadius.md }]}>
        {book.thumbnail ? (
          <Image source={{ uri: book.thumbnail }} style={styles.cardImgInner} />
        ) : (
          <BookCoverPlaceholder title={book.title} width={W} height={H} />
        )}
      </View>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
        {book.title}
      </Text>
    </TouchableOpacity>
  );
}

const MemoCard = React.memo(LibraryBookCard);

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const nav = useNavigation();
  const listRef = useRef<FlatList>(null);
  const lastTapRef = useRef(0);

  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsub = (nav as any).addListener('tabPress', () => {
      const now = Date.now();
      if (now - lastTapRef.current < 400) {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    });
    return unsub;
  }, [nav]);

  useEffect(() => {
    const seen = new Set<string>();
    const urdu = getAllUrduBooks().filter(b => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return !!b.thumbnail;
    });
    const pdf = getAllPdfBooks().filter(b => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return !!b.thumbnail;
    });
    setAllBooks([...urdu, ...pdf]);
    setLoading(false);
  }, []);

  const filteredBooks = useMemo(() => {
    if (!query.trim()) return allBooks;
    const q = query.toLowerCase();
    return allBooks.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.authors?.some(a => a.toLowerCase().includes(q))
    );
  }, [allBooks, query]);

  const displayedBooks = useMemo(() => {
    return filteredBooks.slice(0, page * PAGE_SIZE);
  }, [filteredBooks, page]);

  const hasMore = displayedBooks.length < filteredBooks.length;

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setPage(1);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore) setPage(p => p + 1);
  }, [hasMore]);

  const keyExtractor = useCallback((item: Book, index: number) => `${item.id}_${index}`, []);

  const renderItem = useCallback(({ item }: { item: Book }) => (
    <View style={styles.bookWrap}>
      <MemoCard book={item} />
    </View>
  ), []);

  const header = useMemo(() => (
    <View style={{ paddingTop: insets.top + Spacing.lg }}>
      <View style={[styles.headerRow, { paddingHorizontal: Spacing.xxl }]}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Library</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {filteredBooks.length.toLocaleString()} books
          </Text>
        </View>
      </View>
      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search all books..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [insets, colors, filteredBooks.length, query, handleSearch, handleClear]);

  const footer = useMemo(() => {
    if (!hasMore) return <View style={{ height: 100 }} />;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.textPrimary} />
      </View>
    );
  }, [hasMore, colors]);

  const empty = useMemo(() => (
    <View style={styles.emptyWrap}>
      <Ionicons name="search-outline" size={48} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        {query ? `No books match "${query}"` : 'No books available'}
      </Text>
    </View>
  ), [query, colors]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {header}
        <ActivityIndicator size="large" color={colors.textPrimary} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={listRef}
        data={displayedBooks}
        keyExtractor={keyExtractor}
        numColumns={2}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.gridRow}
        renderItem={renderItem}
        ListEmptyComponent={empty}
        ListFooterComponent={footer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },

  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.heading2, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: FontSize.xs, marginTop: 2 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg, height: 46,
    gap: Spacing.sm, borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchInput: { flex: 1, fontSize: FontSize.bodyMd },

  gridRow: {
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  bookWrap: {
    flex: 1,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  card: {
    alignItems: 'center',
  },
  cardImg: {
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  cardImgInner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardTitle: {
    fontSize: FontSize.bodySm,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: -0.1,
    textAlign: 'center',
  },

  footer: { paddingVertical: Spacing.xl, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FontSize.bodyMd, fontWeight: '600', marginTop: Spacing.md },
});
