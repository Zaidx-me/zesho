import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { getSemesterBooks } from '../../src/services/googleBooks';
import { Book } from '../../src/types';

const SEMESTERS = [
  { key: 'semester_1', label: '1', title: 'Semester 1' },
  { key: 'semester_2', label: '2', title: 'Semester 2' },
  { key: 'semester_3', label: '3', title: 'Semester 3' },
  { key: 'semester_4', label: '4', title: 'Semester 4' },
  { key: 'semester_5', label: '5', title: 'Semester 5' },
  { key: 'semester_6', label: '6', title: 'Semester 6' },
];

export default function CurriculumScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedSem, setSelectedSem] = useState('semester_1');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, [selectedSem]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await getSemesterBooks(selectedSem);
      setBooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="school" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>University Books</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>HEC / NCEAC Curriculum</Text>
            </View>
          </View>
        </View>

        {/* Semester tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.semRow}
        >
          {SEMESTERS.map((sem) => (
            <TouchableOpacity
              key={sem.key}
              style={[
                styles.semTab,
                { backgroundColor: selectedSem === sem.key ? colors.primary : colors.surfaceElevated, borderColor: selectedSem === sem.key ? colors.primary : colors.border },
              ]}
              onPress={() => setSelectedSem(sem.key)}
            >
              <Text style={[styles.semTabText, { color: selectedSem === sem.key ? colors.white : colors.textSecondary }]}>
                {sem.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Books */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.booksGrid}>
            {books.map((book, i) => (
              <TouchableOpacity
                key={`${book.id}-${i}`}
                style={[styles.bookCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={() => router.push(`/book/${book.id}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.bookCover, { backgroundColor: colors.surface }]}>
                  <Image source={{ uri: book.thumbnail }} style={styles.bookImage} />
                </View>
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={2}>{book.title}</Text>
                  <Text style={[styles.bookAuthor, { color: colors.primary }]} numberOfLines={1}>{book.authors[0]}</Text>
                  <View style={styles.bookMeta}>
                    <Ionicons name="download-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.bookDownloads, { color: colors.textMuted }]}>{book.ratingsCount?.toLocaleString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {books.length === 0 && !loading && (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No books for this semester</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.xxl },
  header: { marginBottom: Spacing.xxl },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800' },
  subtitle: { fontSize: FontSize.sm, marginTop: 2 },
  semRow: { gap: Spacing.sm, marginBottom: Spacing.xxl },
  semTab: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  semTabText: { fontSize: FontSize.sm, fontWeight: '600' },
  loader: { height: 200 },
  booksGrid: { gap: Spacing.md },
  bookCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  bookCover: {
    width: 80, height: 120,
  },
  bookImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bookInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  bookTitle: {
    fontSize: FontSize.md, fontWeight: '700',
    marginBottom: 4, lineHeight: 20,
  },
  bookAuthor: { fontSize: FontSize.sm, marginBottom: 4 },
  bookMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bookDownloads: { fontSize: FontSize.xs },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyText: { fontSize: FontSize.md },
});
