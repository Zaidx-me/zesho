import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BookCard } from '../../src/components/BookCard';
import { Book } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';
import { getCachedBooks } from '../../src/services/bookCache';
import { getDismissedNotifications } from '../../src/services/localDb';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

const CATEGORIES = [
  { label: 'All', key: 'popular', query: 'popular fiction' },
  { label: 'Novels', key: 'fiction', query: 'classic literature' },
  { label: 'Self Help', key: 'self-help', query: 'self help motivation' },
  { label: 'Science', key: 'science', query: 'science nature' },
  { label: 'Poetry', key: 'poetry', query: 'poetry anthology' },
  { label: 'Urdu', key: 'urdu', query: 'urdu' },
  { label: 'History', key: 'history', query: 'history' },
  { label: 'Religion', key: 'religion', query: 'religion spirituality' },
];

const CategoryTabs = React.memo(function CategoryTabs({
  activeCategory,
  onSelect,
  colors,
}: {
  activeCategory: string;
  onSelect: (label: string) => void;
  colors: any;
}) {
  const flatListRef = useRef<FlatList>(null);

  return (
    <FlatList
      ref={flatListRef}
      horizontal
      data={CATEGORIES}
      keyExtractor={(item) => item.label}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabContent}
      renderItem={({ item: cat }) => (
        <TouchableOpacity
          style={[styles.tab, { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
            activeCategory === cat.label && { backgroundColor: colors.textPrimary }]}
          onPress={() => onSelect(cat.label)}
        >
          <Text style={[
            styles.tabText,
            { color: activeCategory === cat.label ? colors.background : colors.textSecondary, fontWeight: activeCategory === cat.label ? '700' : '500' },
          ]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
});

export default function CategoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const loadBooks = async (category: string) => {
    setLoading(true);
    try {
      const cat = CATEGORIES.find(c => c.label === category);
      if (!cat) return;
      const result = await getCachedBooks(cat.key, cat.query, 20);
      setBooks(result.filter(b => b.thumbnail));
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooks(activeCategory); }, [activeCategory]);

  useEffect(() => {
    getDismissedNotifications().then(d => setHasUnread(d.length < 3));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks(activeCategory);
    setRefreshing(false);
  };

  const handleCategorySelect = useCallback((label: string) => {
    setActiveCategory(label);
  }, []);

  const ListHeader = useCallback(() => (
    <View>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Category</Text>
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          {hasUnread && <View style={[styles.badgeDot, { backgroundColor: colors.textPrimary }]} />}
        </TouchableOpacity>
      </View>

      {/* Tabs - memoized, won't remount */}
      <CategoryTabs
        activeCategory={activeCategory}
        onSelect={handleCategorySelect}
        colors={colors}
      />

      {/* Loading */}
      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      )}
    </View>
  ), [insets.top, colors, activeCategory, hasUnread, loading, handleCategorySelect]);

  const renderItem = useCallback(({ item }: { item: Book }) => (
    <View style={styles.bookItem}>
      <BookCard book={item} size={150} />
    </View>
  ), []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={loading ? [] : books}
        numColumns={2}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  headerTitle: { fontSize: FontSize.heading4, fontWeight: '700', letterSpacing: -0.3 },
  badgeDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4 },
  tabContent: { gap: Spacing.sm, paddingVertical: Spacing.sm },
  tab: { borderRadius: BorderRadius.full },
  tabText: { fontSize: FontSize.bodyMd, fontWeight: '500' },
  grid: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between', gap: Spacing.sm },
  bookItem: { marginBottom: Spacing.md },
  loadingWrap: { height: 200, justifyContent: 'center', alignItems: 'center' },
});
