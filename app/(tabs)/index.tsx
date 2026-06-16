import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, TextInput, Animated, InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BookRow } from '../../src/components/BookRow';
import { BookStack } from '../../src/components/BookStack';
import { SkeletonRow } from '../../src/components/SkeletonLoader';
import { RequestBookModal } from '../../src/components/RequestBookModal';
import { Book } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';
import { getCachedBooks, preloadBooks } from '../../src/services/bookCache';
import { getAllUrduBooks, getUrduBooksByCategory } from '../../src/services/urduBooks';
import { getAllPdfBooks } from '../../src/services/pdfBooksFree';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { getDismissedNotifications } from '../../src/services/localDb';
import { searchBooks } from '../../src/services/googleBooks';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [query, setQuery] = useState('');
  const [showRequest, setShowRequest] = useState(false);
  const [heroBooks, setHeroBooks] = useState<Book[]>([]);
  const [famousBooks, setFamousBooks] = useState<Book[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [islamicBooks, setIslamicBooks] = useState<Book[]>([]);
  const [novelBooks, setNovelBooks] = useState<Book[]>([]);
  const [historyBooks, setHistoryBooks] = useState<Book[]>([]);
  const [poetryBooks, setPoetryBooks] = useState<Book[]>([]);
  const [funnyBooks, setFunnyBooks] = useState<Book[]>([]);
  const [pdfNovels, setPdfNovels] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const nav = useNavigation();
  const lastTapRef = useRef(0);

  useEffect(() => {
    const unsub = (nav as any).addListener('tabPress', () => {
      const now = Date.now();
      if (now - lastTapRef.current < 400) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    });
    return unsub;
  }, [nav]);

  const loadData = useCallback(async () => {
    try {
      const [heroRes, famousRes, trendingRes] = await Promise.allSettled([
        getCachedBooks('hero_disc', 'popular fiction bestseller', 10),
        getCachedBooks('famous', 'famous classic books', 20),
        getCachedBooks('trending_now', 'trending now 2025', 20),
      ]);
      if (heroRes.status === 'fulfilled') {
        setHeroBooks(heroRes.value.filter((b: Book) => b.thumbnail));
      } else {
        const fallback = await searchBooks('bestseller', 10).catch(() => [] as Book[]);
        setHeroBooks(fallback.filter((b: Book) => b.thumbnail));
      }
      if (famousRes.status === 'fulfilled') {
        setFamousBooks(famousRes.value.filter((b: Book) => b.thumbnail));
      }
      if (trendingRes.status === 'fulfilled') {
        setTrendingBooks(trendingRes.value.filter((b: Book) => b.thumbnail));
      }
    } catch {}
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    InteractionManager.runAfterInteractions(() => {
      const seen = new Set<string>();
      const addUnique = (arr: Book[]) => {
        const result: Book[] = [];
        for (const b of arr) {
          if (!seen.has(b.id) && b.thumbnail) {
            seen.add(b.id);
            result.push(b);
          }
        }
        return result;
      };

      const allPdf = getAllPdfBooks();

      setIslamicBooks(addUnique(getUrduBooksByCategory('Islamic Books', 15)).concat(
        addUnique(allPdf.filter(b => b.categories?.includes('Islamic Books')).slice(0, 10))
      ));
      setNovelBooks(addUnique(getUrduBooksByCategory('Urdu Novels', 20)));
      setHistoryBooks(addUnique(getUrduBooksByCategory('History Books', 15)).concat(
        addUnique(allPdf.filter(b => b.categories?.includes('History')).slice(0, 8))
      ));
      setPoetryBooks(addUnique(getUrduBooksByCategory('Poetry Books', 12)).concat(
        addUnique(getUrduBooksByCategory('Column', 6))
      ));
      setFunnyBooks(addUnique(getUrduBooksByCategory('Funny Books', 12)));
      setPdfNovels(addUnique(allPdf.filter(b => b.categories?.includes('Urdu Novels')).slice(0, 15)));
    });
  }, []);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      preloadBooks();
      loadData();
      getDismissedNotifications().then(d => setHasUnread(d.length < 3));
    });
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push({ pathname: '/(tabs)/search', params: { q: query } });
  };

  const isEmpty = !heroBooks.length && !famousBooks.length && !trendingBooks.length;

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + Spacing.md }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.header, { paddingHorizontal: Spacing.xxl }]}>
          <View>
            <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Discover</Text>
            <Text style={[s.headerSub, { color: colors.textMuted }]}>Find your next great read</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            {hasUnread && <View style={[s.notifDot, { backgroundColor: colors.textPrimary }]} />}
          </TouchableOpacity>
        </View>

        <View style={[s.searchWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[s.searchInput, { color: colors.textPrimary }]}
            placeholder="Search books, authors..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <>
            <View style={{ height: 260, marginHorizontal: Spacing.xxl, marginBottom: Spacing.xl, borderRadius: 16, backgroundColor: colors.surfaceElevated }} />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {heroBooks.length > 0 && (
              <BookStack books={heroBooks} title="Featured Books" />
            )}

            <View style={[s.actionsRow, { paddingHorizontal: Spacing.xxl }]}>
              <TouchableOpacity
                style={[s.actionCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={() => router.push('/(tabs)/library')}
                activeOpacity={0.7}
              >
                <View style={[s.actionIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="library-outline" size={20} color={colors.textPrimary} />
                </View>
                <Text style={[s.actionLabel, { color: colors.textPrimary }]}>Library</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={() => setShowRequest(true)}
                activeOpacity={0.7}
              >
                <View style={[s.actionIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="add-circle-outline" size={20} color={colors.textPrimary} />
                </View>
                <Text style={[s.actionLabel, { color: colors.textPrimary }]}>Request</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={() => router.push('/favorites')}
                activeOpacity={0.7}
              >
                <View style={[s.actionIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="heart-outline" size={20} color={colors.textPrimary} />
                </View>
                <Text style={[s.actionLabel, { color: colors.textPrimary }]}>Favorites</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.banner, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onPress={() => router.push('/(tabs)/library')}
              activeOpacity={0.85}
            >
              <View style={s.bannerContent}>
                <View style={[s.bannerIconWrap, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="book" size={28} color={colors.textPrimary} />
                </View>
                <View style={s.bannerTextWrap}>
                  <Text style={[s.bannerTitle, { color: colors.textPrimary }]}>Explore 3000+ Books</Text>
                  <Text style={[s.bannerSub, { color: colors.textSecondary }]}>Urdu novels, Islamic books, PDFs and more</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>

            {isEmpty && (
              <View style={s.emptyState}>
                <Ionicons name="book-outline" size={48} color={colors.textMuted} />
                <Text style={[s.emptyTitle, { color: colors.textMuted }]}>Loading books...</Text>
                <Text style={[s.emptySub, { color: colors.textMuted }]}>Pull down to refresh</Text>
              </View>
            )}

            {famousBooks.length > 0 && (
              <BookRow title="Most Famous Books" books={famousBooks} bookSize={140} onSeeAll={() => router.push({ pathname: '/shelf/[category]', params: { category: 'famous', title: 'Most Famous Books', query: 'famous classic books' } })} />
            )}

            {islamicBooks.length > 0 && (
              <BookRow title="Islamic Books" books={islamicBooks} bookSize={120} onSeeAll={() => router.push({ pathname: '/shelf/[category]', params: { category: 'islamic', title: 'Islamic Books', query: 'Islamic books' } })} />
            )}

            {novelBooks.length > 0 && (
              <BookRow title="Urdu Novels" books={novelBooks} bookSize={150} onSeeAll={() => router.push({ pathname: '/shelf/[category]', params: { category: 'urdu_novels', title: 'Urdu Novels', query: 'Urdu novels' } })} />
            )}

            {trendingBooks.length > 0 && (
              <BookRow title="Trending Now" books={trendingBooks} bookSize={130} onSeeAll={() => router.push({ pathname: '/shelf/[category]', params: { category: 'trending_now', title: 'Trending Now', query: 'trending now 2025' } })} />
            )}

            {historyBooks.length > 0 && (
              <BookRow title="History & Biography" books={historyBooks} bookSize={125} onSeeAll={() => router.push({ pathname: '/shelf/[category]', params: { category: 'history', title: 'History & Biography', query: 'history biography' } })} />
            )}

            {poetryBooks.length > 0 && (
              <BookRow title="Poetry & Literature" books={poetryBooks} bookSize={115} onSeeAll={() => router.push({ pathname: '/shelf/[category]', params: { category: 'poetry', title: 'Poetry & Literature', query: 'poetry literature' } })} />
            )}

            {funnyBooks.length > 0 && (
              <BookRow title="Fun Reads" books={funnyBooks} bookSize={120} onSeeAll={() => router.push({ pathname: '/shelf/[category]', params: { category: 'funny', title: 'Fun Reads', query: 'funny humor' } })} />
            )}

            {pdfNovels.length > 0 && (
              <BookRow title="PDF Novels" books={pdfNovels} bookSize={135} onSeeAll={() => router.push({ pathname: '/shelf/[category]', params: { category: 'pdf_novels', title: 'PDF Novels', query: 'Urdu novels PDF' } })} />
            )}
          </Animated.View>
        )}
      </ScrollView>

      <RequestBookModal visible={showRequest} onClose={() => setShowRequest(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  headerTitle: { fontSize: FontSize.heading2, fontWeight: '800', letterSpacing: -1 },
  headerSub: { fontSize: FontSize.xs, marginTop: 2 },
  notifBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.xxl,
    paddingHorizontal: Spacing.md, borderRadius: 12, height: 44,
    gap: Spacing.sm, borderWidth: 1, marginBottom: Spacing.lg,
  },
  searchInput: { flex: 1, fontSize: FontSize.bodyMd },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  actionCard: {
    flex: 1, borderRadius: 12, borderWidth: 1,
    paddingVertical: Spacing.md, alignItems: 'center', gap: Spacing.xs,
  },
  actionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '600' },
  banner: {
    marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FontSize.bodyMdMedium,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  bannerSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  emptyState: { alignItems: 'center', paddingTop: 40, paddingBottom: 40 },
  emptyTitle: { fontSize: FontSize.bodyMd, fontWeight: '600', marginTop: Spacing.md },
  emptySub: { fontSize: FontSize.xs, marginTop: 4 },
});
