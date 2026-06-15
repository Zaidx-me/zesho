import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BookRow } from '../../src/components/BookRow';
import { SkeletonLoader } from '../../src/components/SkeletonLoader';
import { Book } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';
import {
  getPopularBooks,
  getFictionBooks,
  getScienceBooks,
  getUniversityBooks,
  getSelfHelpBooks,
} from '../../src/services/googleBooks';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

const CATEGORIES = [
  { label: 'All', subject: 'popular' },
  { label: 'Fiction', subject: 'fiction' },
  { label: 'Science', subject: 'science' },
  { label: 'Self-Help', subject: 'selfhelp' },
  { label: 'PUCIT Books', subject: 'pucit' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [categoryBooks, setCategoryBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [fictionBooks, setFictionBooks] = useState<Book[]>([]);
  const [scienceBooks, setScienceBooks] = useState<Book[]>([]);
  const [universityBooks, setUniversityBooks] = useState<Book[]>([]);
  const [selfHelpBooks, setSelfHelpBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        getPopularBooks(),
        getFictionBooks(),
        getScienceBooks(),
        getUniversityBooks(),
        getSelfHelpBooks(),
      ]);
      if (results[0].status === 'fulfilled') setPopularBooks(results[0].value);
      if (results[1].status === 'fulfilled') setFictionBooks(results[1].value);
      if (results[2].status === 'fulfilled') setScienceBooks(results[2].value);
      if (results[3].status === 'fulfilled') setUniversityBooks(results[3].value);
      if (results[4].status === 'fulfilled') setSelfHelpBooks(results[4].value);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCategoryPress = async (subject: string) => {
    setActiveCategory(subject);
    try {
      const { getBooksBySubject } = await import('../../src/services/googleBooks');
      const books = await getBooksBySubject(subject, 20);
      setCategoryBooks(books);
    } catch (e) {
      console.error(e);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + Spacing.lg }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[s.header, { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg }]}>
          <View style={[s.headerTop, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View style={[s.logoRow, { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }]}>
              <View style={[s.logoIcon, { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="book" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={{ fontSize: FontSize.xxl, fontWeight: '800', color: colors.textPrimary }}>Good {getGreeting()},</Text>
                <Text style={{ fontSize: FontSize.md, color: colors.textSecondary, marginTop: 2 }}>Discover your next great read</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[s.searchBtn, { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center' }]}
              onPress={() => router.push('/search')}
            >
              <Ionicons name="search" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.xxl, gap: Spacing.sm, marginBottom: Spacing.xxl }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={[
                { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.full, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
                activeCategory === cat.label && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => handleCategoryPress(cat.subject)}
            >
              <Text style={{ fontSize: FontSize.sm, color: activeCategory === cat.label ? colors.white : colors.textSecondary, fontWeight: '600' }}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        {activeCategory !== 'All' && categoryBooks.length > 0 ? (
          <View style={{ paddingHorizontal: Spacing.lg }}>
            <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.textPrimary, marginBottom: Spacing.lg, paddingHorizontal: Spacing.sm }}>{activeCategory} Books</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
              {categoryBooks.map((book) => (
                <View key={book.id} style={{ width: '47%' }}>
                  <BookRow title="" books={[book]} bookSize={150} />
                </View>
              ))}
            </View>
          </View>
        ) : loading ? (
          <SkeletonLoader />
        ) : (
          <>
            <BookRow title="Popular Right Now" books={popularBooks} />
            <BookRow title="Classic Fiction" books={fictionBooks} />
            <BookRow title="Science & Nature" books={scienceBooks} />
            <BookRow title="University & Textbooks" books={universityBooks} />
            <BookRow title="Self-Help & Philosophy" books={selfHelpBooks} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.huge },
  header: {},
  headerTop: {},
  logoRow: {},
  logoIcon: {},
  searchBtn: {},
});
