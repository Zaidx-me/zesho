import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BookRow } from '../../src/components/BookRow';
import { SkeletonRow } from '../../src/components/SkeletonLoader';
import { Book } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';
import { getCachedBooks, preloadBooks } from '../../src/services/bookCache';
import { Spacing, FontSize } from '../../src/constants/theme';
import { getDismissedNotifications } from '../../src/services/localDb';
import { fetchTopOfWeek } from '../../src/services/googleBooks';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [fictionBooks, setFictionBooks] = useState<Book[]>([]);
  const [scienceBooks, setScienceBooks] = useState<Book[]>([]);
  const [selfHelpBooks, setSelfHelpBooks] = useState<Book[]>([]);
  const [urduBooks, setUrduBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    try {
      const [topWeek, fic, sci, sh, ur] = await Promise.all([
        fetchTopOfWeek(),
        getCachedBooks('fiction', 'classic literature', 20),
        getCachedBooks('science', 'science nature', 20),
        getCachedBooks('self-help', 'self help motivation', 20),
        getCachedBooks('urdu', 'urdu', 20),
      ]);
      setPopularBooks(shuffle(topWeek.filter(b => b.thumbnail)));
      setFictionBooks(shuffle(fic.filter(b => b.thumbnail)));
      setScienceBooks(shuffle(sci.filter(b => b.thumbnail)));
      setSelfHelpBooks(shuffle(sh.filter(b => b.thumbnail)));
      setUrduBooks(shuffle(ur.filter(b => b.thumbnail)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    preloadBooks();
    loadData();
    checkNotifications();
  }, []);

  const checkNotifications = async () => {
    const dismissed = await getDismissedNotifications();
    const total = 3;
    setHasUnread(dismissed.length < total);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + Spacing.md }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.header, { paddingHorizontal: Spacing.xl }]}>
          <Text style={[s.headerTitle, { color: colors.textPrimary }]}>Home</Text>
          <View style={s.headerActions}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')} style={s.notifBtn}>
              <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={s.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
              {hasUnread && <View style={[s.notifDot, { backgroundColor: colors.textPrimary }]} />}
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <SkeletonRow />
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            <BookRow title="Top of Week" books={popularBooks} bookSize={130} />
            <BookRow title="Popular Right Now" books={fictionBooks} bookSize={130} />
            <BookRow title="Urdu Literature" books={urduBooks} bookSize={130} />
            <BookRow title="Science & Nature" books={scienceBooks} bookSize={130} />
            <BookRow title="Self-Help" books={selfHelpBooks} bookSize={130} />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerTitle: { fontSize: FontSize.heading2, fontWeight: '800', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  notifBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4 },
});
