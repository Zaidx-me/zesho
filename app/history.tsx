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
import { Book } from '../src/types';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { getUserBooks } from '../src/services/localDb';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [history, setHistory] = useState<Book[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const library = await getUserBooks(user.uid);
      setHistory(library.filter(b => b.status === 'reading' || b.status === 'finished').map(b => ({
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
      console.error('Error loading history:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Reading History</Text>
        <View style={styles.backBtn} />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No reading history</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Books you read will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.historyItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onPress={() => router.push(`/book/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={[styles.thumb, { backgroundColor: colors.surface }]}>
                <Ionicons name="book" size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={[styles.historyTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.historyAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.authors?.join(', ') || 'Unknown author'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
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
    paddingHorizontal: Spacing.lg,
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
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  thumb: {
    width: 48,
    height: 64,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: FontSize.bodyMd,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyAuthor: {
    fontSize: FontSize.bodySm,
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
