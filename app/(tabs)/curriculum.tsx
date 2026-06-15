import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { getSemesterBooksSync } from '../../src/services/googleBooks';
import { getUploadedBooksBySemester } from '../../src/services/uploadService';
import { Book } from '../../src/types';

const SEMESTERS = [
  { key: 'semester_1', label: '1', title: 'Semester 1' },
  { key: 'semester_2', label: '2', title: 'Semester 2' },
  { key: 'semester_3', label: '3', title: 'Semester 3' },
  { key: 'semester_4', label: '4', title: 'Semester 4' },
  { key: 'semester_5', label: '5', title: 'Semester 5' },
  { key: 'semester_6', label: '6', title: 'Semester 6' },
];

// Cache for all semesters
const semesterCache = new Map<string, Book[]>();
const SEMESTER_KEYS = SEMESTERS.map(s => s.key);

export default function CurriculumScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedSem, setSelectedSem] = useState('semester_1');
  const [books, setBooks] = useState<Book[]>(() => getSemesterBooksSync('semester_1'));
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const loadUploadedBooks = useCallback(async (semester: string) => {
    const cached = semesterCache.get(semester);
    if (cached) {
      if (mountedRef.current) setBooks(cached);
      return;
    }

    setLoading(true);
    const baseBooks = getSemesterBooksSync(semester);

    try {
      const uploaded = await Promise.race([
        getUploadedBooksBySemester(semester),
        new Promise<[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ]) as any[];

      const uploadedAsBooks: Book[] = (uploaded || []).map(ub => ({
        id: `uploaded-${ub.id}`,
        title: ub.title,
        authors: [ub.author],
        description: `Uploaded course book for ${ub.course}`,
        thumbnail: ub.thumbnail || '',
        publishedDate: '',
        pageCount: 0,
        categories: [ub.course],
        averageRating: 0,
        ratingsCount: 0,
        previewLink: ub.pdfUrl,
        infoLink: ub.pdfUrl,
        downloadUrl: ub.pdfUrl,
      }));

      const merged = [...uploadedAsBooks, ...baseBooks];
      semesterCache.set(semester, merged);
      if (mountedRef.current) setBooks(merged);
    } catch {
      if (mountedRef.current) setBooks(baseBooks);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUploadedBooks(selectedSem);
  }, [selectedSem, loadUploadedBooks]);

  // Preload adjacent semesters
  useEffect(() => {
    const idx = SEMESTER_KEYS.indexOf(selectedSem);
    const toPreload = [];
    if (idx > 0) toPreload.push(SEMESTER_KEYS[idx - 1]);
    if (idx < SEMESTER_KEYS.length - 1) toPreload.push(SEMESTER_KEYS[idx + 1]);
    for (const sem of toPreload) {
      if (!semesterCache.has(sem)) {
        getSemesterBooksSync(sem);
        getUploadedBooksBySemester(sem).then(uploaded => {
          const base = getSemesterBooksSync(sem);
          const mapped = (uploaded || []).map(ub => ({
            id: `uploaded-${ub.id}`,
            title: ub.title,
            authors: [ub.author],
            description: `Uploaded course book for ${ub.course}`,
            thumbnail: ub.thumbnail || '',
            publishedDate: '',
            pageCount: 0,
            categories: [ub.course],
            averageRating: 0,
            ratingsCount: 0,
            previewLink: ub.pdfUrl,
            infoLink: ub.pdfUrl,
            downloadUrl: ub.pdfUrl,
          }));
          semesterCache.set(sem, [...mapped, ...base]);
        }).catch(() => {});
      }
    }
  }, [selectedSem]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
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
                  {book.thumbnail ? (
                    <Image source={{ uri: book.thumbnail }} style={styles.bookImage} />
                  ) : (
                    <View style={styles.placeholderCover}>
                      <Ionicons name="document-text" size={28} color={colors.textSecondary} />
                    </View>
                  )}
                </View>
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={2}>{book.title}</Text>
                  <Text style={[styles.bookAuthor, { color: colors.primary }]} numberOfLines={1}>{book.authors[0]}</Text>
                  <View style={styles.bookMeta}>
                    <Ionicons name="download-outline" size={12} color={colors.textMuted} />
                    <Text style={[styles.bookDownloads, { color: colors.textMuted }]}>{book.ratingsCount?.toLocaleString() || 'Uploaded'}</Text>
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
  placeholderCover: {
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center',
  },
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
