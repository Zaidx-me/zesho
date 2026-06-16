import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BookCard } from '../src/components/BookCard';
import { Book, UserBook } from '../src/types';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { getUserBooks } from '../src/services/localDb';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Book[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const library = await getUserBooks(user.uid);
      setFavorites(library.filter(b => b.status === 'want_to_read').map(b => ({
        id: b.bookId,
        title: b.title,
        thumbnail: b.thumbnail,
        authors: b.authors,
        description: '',
        publishedDate: '',
        pageCount: 0,
        categories: [],
        averageRating: 0,
        ratingsCount: 0,
        previewLink: '',
        infoLink: '',
        source: 'google' as const,
      })));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Favorites</Text>
        <View style={styles.backBtn} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No favorites yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tap the heart icon on any book to add it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.bookItem}>
              <BookCard book={item} />
            </View>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  grid: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  bookItem: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
