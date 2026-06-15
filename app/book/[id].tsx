import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { getBookById, getPdfUrl, getBookPageUrl } from '../../src/services/googleBooks';
import { addBookToLibrary, isInLibrary, getNotesForBook, updateBookStatus, updateBookRating } from '../../src/services/books';
import { Book, Note } from '../../src/types';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

const STATUS_OPTIONS = ['want_to_read', 'reading', 'finished'] as const;
const STATUS_LABELS: Record<string, string> = {
  want_to_read: 'Want to Read',
  reading: 'Reading',
  finished: 'Finished',
};

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, skipped } = useAuth();
  const { colors } = useTheme();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [inLibrary, setInLibrary] = useState(false);
  const [bookStatus, setBookStatus] = useState<string>('want_to_read');
  const [userRating, setUserRating] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => { loadBook(); }, [id]);

  const loadBook = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const bookData = await getBookById(id);
      setBook(bookData);
      if (user && bookData) {
        const inLib = await isInLibrary(user.uid, id);
        setInLibrary(inLib);
        const bookNotes = await getNotesForBook(user.uid, id);
        setNotes(bookNotes);
      }
    } catch (e) {
      console.error('Error loading book:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!book) return;
    await Share.share({
      message: `Read "${book.title}" by ${book.authors.join(', ')}\nhttps://archive.org/details/${book.id}`,
      title: book.title,
    });
  };

  const handleReadNow = () => {
    if (!book) return;
    // Google Drive books can be read in-app
    if (book.downloadUrl && book.downloadUrl.includes('drive.google.com')) {
      router.push(`/reader/${book.id}?url=${encodeURIComponent(book.downloadUrl)}&title=${encodeURIComponent(book.title)}`);
    } else {
      const pageUrl = getBookPageUrl(book.id);
      router.push(`/reader/${book.id}?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(book.title)}`);
    }
  };

  const handleDownloadPdf = () => {
    if (!book) return;
    const url = book.downloadUrl || getPdfUrl(book.id);
    const isDrive = url.includes('drive.google.com');
    Alert.alert(
      'Download PDF',
      `Download "${book.title}" PDF?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => Linking.openURL(url) },
      ]
    );
  };

  const handleAddToLibrary = async () => {
    if (skipped || !user) {
      Alert.alert('Sign In Required', 'Sign in to save books', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (!book) return;
    try {
      if (inLibrary) {
        Alert.alert('Remove', 'Remove from library?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => setInLibrary(false) },
        ]);
      } else {
        await addBookToLibrary({
          id: `${user.uid}_${book.id}`, bookId: book.id, userId: user.uid,
          title: book.title, authors: book.authors, thumbnail: book.thumbnail,
          addedAt: Date.now(), status: 'want_to_read', progress: 0, rating: 0,
        });
        setInLibrary(true);
      }
    } catch (e) { console.error(e); }
  };

  const handleStatusChange = async (s: string) => {
    setBookStatus(s);
    if (user && inLibrary && id) await updateBookStatus(user.uid, id, s as any).catch(() => {});
  };

  const handleRatingChange = async (r: number) => {
    setUserRating(r);
    if (user && inLibrary && id) await updateBookRating(user.uid, id, r).catch(() => {});
  };

  if (loading) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!book) return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
      <Text style={{ color: colors.textPrimary, marginTop: Spacing.md }}>Book not found</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing.lg }}>
        <Text style={{ color: colors.primary }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* BG */}
        <View style={styles.bgWrap}>
          {book.thumbnail ? <Image source={{ uri: book.thumbnail }} style={styles.bgImg} /> : null}
          <LinearGradient colors={[colors.isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', colors.isDark ? 'rgba(0,0,0,0.97)' : 'rgba(242,242,247,0.97)']} style={styles.bgGrad} />
        </View>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.glass }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.glass }]} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Cover row */}
          <View style={styles.coverRow}>
            <View style={[styles.coverWrap, { backgroundColor: colors.surface }]}>
              {book.thumbnail
                ? <Image source={{ uri: book.thumbnail }} style={styles.cover} />
                : <View style={[styles.coverPh, { backgroundColor: colors.surfaceElevated }]}><Text style={[styles.coverLtr, { color: colors.primary }]}>{book.title[0]}</Text></View>
              }
            </View>
            <View style={styles.meta}>
              <Text style={[styles.bTitle, { color: colors.textPrimary }]} numberOfLines={3}>{book.title}</Text>
              <Text style={[styles.bAuthor, { color: colors.primary }]}>{book.authors.join(', ')}</Text>
              {book.publishedDate !== 'N/A' && <Text style={[styles.bDate, { color: colors.textMuted }]}>{book.publishedDate}</Text>}
            </View>
          </View>

          {/* Stats */}
          <View style={[styles.stats, { backgroundColor: colors.glassLight }]}>
            <View style={styles.stat}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={[styles.statV, { color: colors.textPrimary }]}>{userRating > 0 ? `${userRating}.0` : book.averageRating > 0 ? book.averageRating.toFixed(1) : 'N/A'}</Text>
              <Text style={[styles.statL, { color: colors.textSecondary }]}>Rating</Text>
            </View>
            <View style={[styles.statD, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
              <Text style={[styles.statV, { color: colors.textPrimary }]}>{book.pageCount > 0 ? book.pageCount : 'N/A'}</Text>
              <Text style={[styles.statL, { color: colors.textSecondary }]}>Pages</Text>
            </View>
            <View style={[styles.statD, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Ionicons name="bookmark" size={20} color={colors.success} />
              <Text style={[styles.statV, { color: colors.textPrimary }]}>{inLibrary ? STATUS_LABELS[bookStatus] : 'New'}</Text>
              <Text style={[styles.statL, { color: colors.textSecondary }]}>Status</Text>
            </View>
          </View>

          {/* Rating */}
          {inLibrary && (
            <View style={styles.pickerSection}>
              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Your Rating</Text>
              <View style={styles.stars}>
                {[1,2,3,4,5].map(s => (
                  <TouchableOpacity key={s} onPress={() => handleRatingChange(s)}>
                    <Ionicons name={s <= userRating ? 'star' : 'star-outline'} size={28} color={s <= userRating ? '#FFD700' : colors.surfaceElevated} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Status */}
          {inLibrary && (
            <View style={styles.pickerSection}>
              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Status</Text>
              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, bookStatus === s && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                    onPress={() => handleStatusChange(s)}
                  >
                    <Text style={[styles.statusBtnT, { color: colors.textSecondary }, bookStatus === s && { color: colors.white }]}>{STATUS_LABELS[s]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.btns}>
            <TouchableOpacity style={[styles.readBtn, { backgroundColor: colors.primary }]} onPress={handleReadNow}>
              <Ionicons name="book" size={20} color={colors.white} />
              <Text style={[styles.readBtnT, { color: colors.white }]}>Read Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.btnsRow}>
            <TouchableOpacity
              style={[styles.smBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, inLibrary && { backgroundColor: colors.success, borderColor: colors.success }]}
              onPress={handleAddToLibrary}
            >
              <Ionicons name={inLibrary ? 'checkmark-circle' : 'add-circle'} size={16} color={inLibrary ? colors.white : colors.primary} />
              <Text style={[styles.smBtnT, { color: colors.primary }, inLibrary && { color: colors.white }]}>{inLibrary ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={handleDownloadPdf}>
              <Ionicons name="download-outline" size={16} color={colors.primary} />
              <Text style={[styles.smBtnT, { color: colors.primary }]}>Download PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {book.description ? (
            <View style={styles.section}>
              <Text style={[styles.secTitle, { color: colors.textPrimary }]}>About</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>{book.description}</Text>
            </View>
          ) : null}

          {/* Categories */}
          {book.categories.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.secTitle, { color: colors.textPrimary }]}>Genres</Text>
              <View style={styles.tags}>
                {book.categories.map((c, i) => (
                  <View key={i} style={[styles.tag, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <Text style={[styles.tagT, { color: colors.textSecondary }]}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          {notes.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.secTitle, { color: colors.textPrimary }]}>Notes ({notes.length})</Text>
              {notes.map(n => (
                <View key={n.id} style={[styles.noteCard, { backgroundColor: colors.surfaceElevated, borderLeftColor: colors.primary }]}>
                  <Text style={[styles.noteT, { color: colors.textPrimary }]}>{n.content}</Text>
                  <Text style={[styles.noteD, { color: colors.textMuted }]}>{new Date(n.createdAt).toLocaleDateString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },

  bgWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: 300, overflow: 'hidden' },
  bgImg: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.3 },
  bgGrad: { ...StyleSheet.absoluteFillObject },

  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  body: { marginTop: 70, paddingHorizontal: Spacing.xxl, paddingBottom: 100 },

  coverRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.xxl },
  coverWrap: { width: 110, height: 165, borderRadius: BorderRadius.md, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  cover: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPh: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  coverLtr: { fontSize: FontSize.hero, fontWeight: '800' },
  meta: { flex: 1, justifyContent: 'center' },
  bTitle: { fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.sm, lineHeight: 26 },
  bAuthor: { fontSize: FontSize.md, fontWeight: '500', marginBottom: 4 },
  bDate: { fontSize: FontSize.sm },

  stats: { flexDirection: 'row', borderRadius: BorderRadius.lg, padding: Spacing.lg, justifyContent: 'space-around', alignItems: 'center', marginBottom: Spacing.xxl },
  stat: { alignItems: 'center', flex: 1, gap: 3 },
  statV: { fontSize: FontSize.sm, fontWeight: '700' },
  statL: { fontSize: FontSize.xs },
  statD: { width: 1, height: 32 },

  pickerSection: { marginBottom: Spacing.lg },
  pickerLabel: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  stars: { flexDirection: 'row', gap: Spacing.md },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 1 },
  statusBtnT: { fontSize: FontSize.sm, fontWeight: '600' },

  btns: { marginBottom: Spacing.sm },
  readBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md + 2, borderRadius: BorderRadius.lg },
  readBtnT: { fontSize: FontSize.md, fontWeight: '700' },
  btnsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl },
  smBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1 },
  smBtnT: { fontSize: FontSize.sm, fontWeight: '600' },

  section: { marginBottom: Spacing.xxl },
  secTitle: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md },
  desc: { fontSize: FontSize.md, lineHeight: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  tagT: { fontSize: FontSize.sm },
  noteCard: { borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.sm, borderLeftWidth: 3 },
  noteT: { fontSize: FontSize.md, lineHeight: 22 },
  noteD: { fontSize: FontSize.xs, marginTop: Spacing.sm },
});
