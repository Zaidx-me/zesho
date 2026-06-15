import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BookCard } from '../../src/components/BookCard';
import { useAuth } from '../../src/context/AuthContext';
import { getUserBooks } from '../../src/services/books';
import { UserBook } from '../../src/types';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';

const TABS = ['All', 'Reading', 'Want to Read', 'Finished'];

export default function LibraryScreen() {
  const { user, skipped } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  const loadBooks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const userBooks = await getUserBooks(user.uid);
      setBooks(userBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = activeTab === 'All'
    ? books
    : books.filter((book) => {
        switch (activeTab) {
          case 'Reading': return book.status === 'reading';
          case 'Want to Read': return book.status === 'want_to_read';
          case 'Finished': return book.status === 'finished';
          default: return true;
        }
      });

  const stats = {
    total: books.length,
    reading: books.filter(b => b.status === 'reading').length,
    finished: books.filter(b => b.status === 'finished').length,
    wantToRead: books.filter(b => b.status === 'want_to_read').length,
  };

  if (skipped || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>My Library</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Sign in to use Library</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Create an account to save books to your library</Text>
          <TouchableOpacity style={[styles.signInButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.signInText, { color: colors.white }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Library</Text>
        <View style={[styles.statsRow, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.reading}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reading</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.finished}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Finished</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{stats.wantToRead}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>To Read</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, { backgroundColor: activeTab === tab ? colors.primary : colors.surfaceElevated }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.white : colors.textSecondary }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.listRow}
          renderItem={({ item }) => (
            <View style={styles.bookItem}>
              <BookCard
                book={{
                  id: item.bookId,
                  title: item.title,
                  authors: item.authors,
                  thumbnail: item.thumbnail,
                  description: '',
                  publishedDate: '',
                  pageCount: 0,
                  categories: [],
                  averageRating: 0,
                  ratingsCount: 0,
                  previewLink: '',
                  infoLink: '',
                }}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="library-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No books yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Start adding books to your library</Text>
            </View>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  listRow: {
    justifyContent: 'space-between',
  },
  bookItem: {
    width: '48%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  signInButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  signInText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});
