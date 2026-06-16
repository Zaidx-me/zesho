import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Alert, Share, Linking, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { getBookById, getBookPageUrl, getPdfUrl } from '../../src/services/googleBooks';
import { addBookToLibrary, isInLibrary, getNotesForBook, updateBookStatus, updateBookRating } from '../../src/services/books';
import { getUploadedBooks } from '../../src/services/uploadService';
import { isAdmin, deleteUploadedBook } from '../../src/services/admin';
import { Book, Note } from '../../src/types';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const COVER_W = SCREEN_W * 0.38;
const COVER_H = COVER_W * 1.45;
const STATUS_OPTIONS = ['want_to_read', 'reading', 'finished'] as const;
const STATUS_LABELS: Record<string, string> = {
  want_to_read: 'Want to Read', reading: 'Reading', finished: 'Finished',
};

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadedBook, setIsUploadedBook] = useState(false);
  const admin = isAdmin(user?.email);
  const [inLibrary, setInLibrary] = useState(false);
  const [bookStatus, setBookStatus] = useState<string>('want_to_read');
  const [userRating, setUserRating] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => { return () => { mountedRef.current = false; }; }, []);
  useEffect(() => { loadBook(); }, [id]);

  const loadBook = async () => {
    if (!id) return;
    setLoading(true);
    const bookData = await getBookById(id);
    if (!mountedRef.current) return;
    setBook(bookData);
    const uploaded = await getUploadedBooks();
    if (mountedRef.current) setIsUploadedBook(uploaded.some(b => b.id === id));
    if (!user || !bookData) { if (mountedRef.current) setLoading(false); return; }
    Promise.all([
      isInLibrary(user.uid, id).catch(() => false),
      getNotesForBook(user.uid, id).catch(() => [] as Note[]),
    ]).then(([inLib, bookNotes]) => {
      if (mountedRef.current) {
        setInLibrary(inLib);
        if (inLib) { setBookStatus('want_to_read'); setUserRating(0); }
        setNotes(bookNotes);
      }
    });
    if (mountedRef.current) setLoading(false);
  };

  const handleShare = () => {
    if (!book) return;
    const driveUrl = book.downloadUrl?.includes('drive.google.com')
      ? book.downloadUrl
      : book.previewLink?.includes('drive.google.com')
      ? book.previewLink
      : '';
    const message = driveUrl
      ? `Read "${book.title}" by ${book.authors.join(', ')}\n${driveUrl}`
      : `Read "${book.title}" by ${book.authors.join(', ')}`;
    Share.share({ message, title: book.title });
  };

  const handleReadNow = () => {
    if (!book) return;
    let readerUrl = '';
    let readerDownloadUrl = '';
    let openInBrowser = false;

    if (book.id.startsWith('gutendex_')) {
      const gId = parseInt(book.id.replace('gutendex_', ''), 10);
      if (!isNaN(gId)) {
        readerUrl = book.downloadUrl || `https://www.gutenberg.org/cache/epub/${gId}/pg${gId}.epub3.epub`;
        readerDownloadUrl = `https://www.gutenberg.org/cache/epub/${gId}/pg${gId}.pdf`;
      }
    } else if (book.id.startsWith('hp_')) {
      readerUrl = book.previewLink || `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(book.title)}`;
    } else if (book.downloadUrl?.includes('archive.org')) {
      const match = book.downloadUrl.match(/archive\.org\/download\/([^/]+)/);
      if (match) {
        readerUrl = `https://archive.org/embed/${match[1]}?ui=embed#mode/1up`;
        readerDownloadUrl = book.downloadUrl;
      }
    } else if (book.previewLink?.includes('archive.org/embed')) {
      readerUrl = book.previewLink;
      readerDownloadUrl = book.downloadUrl || '';
    } else if (book.downloadUrl?.includes('drive.google.com') || book.previewLink?.includes('drive.google.com')) {
      openInBrowser = true;
      readerUrl = book.downloadUrl || book.previewLink;
    } else if (book.previewLink?.includes('openlibrary.org/works/')) {
      openInBrowser = true;
      readerUrl = book.previewLink;
    } else if (book.previewLink) {
      readerUrl = book.previewLink;
    } else {
      readerUrl = getBookPageUrl(book.id);
      openInBrowser = true;
    }

    if (!readerUrl) { Alert.alert('Not Available', 'Could not find a way to read this book.'); return; }
    if (openInBrowser) { Linking.openURL(readerUrl); return; }
    router.push({ pathname: '/reader/[id]', params: { id: book.id, url: readerUrl, title: book.title, downloadUrl: readerDownloadUrl } });
  };

  const handleDownload = () => {
    if (!book) return;
    Linking.openURL(book.downloadUrl || getPdfUrl(book.id));
  };

  const handleAddToLibrary = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Sign in to save books', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (!book) return;
    if (inLibrary) {
      Alert.alert('Remove', 'Remove from library?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => setInLibrary(false) },
      ]);
    } else {
      setInLibrary(true);
      addBookToLibrary({
        id: `${user.uid}_${book.id}`, bookId: book.id, userId: user.uid,
        title: book.title, authors: book.authors, thumbnail: book.thumbnail,
        addedAt: Date.now(), status: 'want_to_read', progress: 0, rating: 0,
      }).catch(() => setInLibrary(false));
    }
  };

  const handleStatusChange = (s: string) => {
    setBookStatus(s);
    if (user && inLibrary && id) updateBookStatus(user.uid, id, s as any).catch(() => {});
  };

  const handleRatingChange = (r: number) => {
    setUserRating(r);
    if (user && inLibrary && id) updateBookRating(user.uid, id, r).catch(() => {});
  };

  if (loading) return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.buttonPrimary} />
    </View>
  );

  if (!book) return (
    <View style={[styles.loading, { backgroundColor: colors.background }]}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
      <Text style={{ color: colors.textPrimary, marginTop: Spacing.md }}>Book not found</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing.lg }}>
        <Text style={{ color: colors.buttonPrimary }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const hasDriveLink = book.downloadUrl?.includes('drive.google.com') || book.previewLink?.includes('drive.google.com');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero section with blurred background */}
        <View style={styles.heroSection}>
          {book.thumbnail ? <Image source={{ uri: book.thumbnail }} style={styles.heroBg} /> : null}
          <View style={[styles.heroOverlay, { backgroundColor: colors.overlay }]} />

          {/* Nav bar */}
          <View style={[styles.navBar, { paddingTop: insets.top + Spacing.sm }]}>
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.glass }]} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.glass }]} onPress={handleShare}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Cover + quick info */}
          <View style={styles.heroContent}>
            <View style={styles.coverShadow}>
              {book.thumbnail ? (
                <Image source={{ uri: book.thumbnail }} style={styles.cover} />
              ) : (
                <View style={[styles.coverPlaceholder, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={[styles.coverLetter, { color: colors.buttonPrimary }]}>{book.title[0]}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Content body */}
        <View style={[styles.body, { paddingHorizontal: Spacing.xl }]}>
          {/* Title + Author */}
          <Text style={[styles.bookTitle, { color: colors.textPrimary }]} numberOfLines={3}>{book.title}</Text>
          <Text style={[styles.bookAuthor, { color: colors.coolSlate }]}>{book.authors.join(', ')}</Text>

          {/* Rating + info row */}
          <View style={styles.infoRow}>
            <View style={[styles.infoChip, { backgroundColor: colors.surfaceElevated }]}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.infoChipText, { color: colors.textPrimary }]}>
                {userRating > 0 ? `${userRating}.0` : book.averageRating > 0 ? book.averageRating.toFixed(1) : 'N/A'}
              </Text>
            </View>
            {book.pageCount > 0 && (
              <View style={[styles.infoChip, { backgroundColor: colors.surfaceElevated }]}>
                <Ionicons name="document-text-outline" size={14} color={colors.coolSlate} />
                <Text style={[styles.infoChipText, { color: colors.textPrimary }]}>{book.pageCount} pages</Text>
              </View>
            )}
            {book.publishedDate && book.publishedDate !== 'N/A' && (
              <View style={[styles.infoChip, { backgroundColor: colors.surfaceElevated }]}>
                <Ionicons name="calendar-outline" size={14} color={colors.coolSlate} />
                <Text style={[styles.infoChipText, { color: colors.textPrimary }]}>{book.publishedDate}</Text>
              </View>
            )}
            {hasDriveLink && (
              <View style={[styles.infoChip, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                <Ionicons name="cloud-download-outline" size={14} color={colors.success} />
                <Text style={[styles.infoChipText, { color: colors.success }]}>Free</Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.readBtn, { backgroundColor: colors.buttonPrimary }]} onPress={handleReadNow} activeOpacity={0.8}>
              <Ionicons name="book" size={18} color={colors.buttonPrimaryText} />
              <Text style={[styles.readBtnText, { color: colors.buttonPrimaryText }]}>Read Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={handleDownload} activeOpacity={0.8}>
              <Ionicons name="arrow-down-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Library toggle */}
          <TouchableOpacity
            style={[styles.libraryBtn, { backgroundColor: inLibrary ? colors.success : colors.surfaceElevated, borderColor: inLibrary ? colors.success : colors.border }]}
            onPress={handleAddToLibrary}
            activeOpacity={0.7}
          >
            <Ionicons name={inLibrary ? 'heart' : 'heart-outline'} size={18} color={inLibrary ? '#fff' : colors.textPrimary} />
            <Text style={[styles.libraryBtnText, { color: inLibrary ? '#fff' : colors.textPrimary }]}>
              {inLibrary ? 'In Favourites' : 'Add to Favourite'}
            </Text>
          </TouchableOpacity>

          {/* Rating picker */}
          {inLibrary && (
            <View style={styles.ratingSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Your Rating</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(s => (
                  <TouchableOpacity key={s} onPress={() => handleRatingChange(s)} style={styles.starBtn}>
                    <Ionicons name={s <= userRating ? 'star' : 'star-outline'} size={28} color={s <= userRating ? '#FFD700' : colors.surfaceElevated} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Status picker */}
          {inLibrary && (
            <View style={styles.statusSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Status</Text>
              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                      bookStatus === s && { backgroundColor: colors.buttonPrimary, borderColor: colors.buttonPrimary }]}
                    onPress={() => handleStatusChange(s)}
                  >
                    <Text style={[styles.statusChipText, { color: colors.textSecondary },
                      bookStatus === s && { color: colors.buttonPrimaryText }]}>{STATUS_LABELS[s]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {book.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>{book.description}</Text>
            </View>
          ) : null}

          {/* Categories */}
          {book.categories.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Genres</Text>
              <View style={styles.tagsRow}>
                {book.categories.map((c, i) => (
                  <View key={i} style={[styles.tag, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <Text style={[styles.tagText, { color: colors.textSecondary }]}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          {notes.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Notes ({notes.length})</Text>
              {notes.map(n => (
                <View key={n.id} style={[styles.noteCard, { backgroundColor: colors.surfaceElevated, borderLeftColor: colors.buttonPrimary }]}>
                  <Text style={[styles.noteText, { color: colors.textPrimary }]}>{n.content}</Text>
                  <Text style={[styles.noteDate, { color: colors.textMuted }]}>{new Date(n.createdAt).toLocaleDateString()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Admin delete */}
          {admin && isUploadedBook && (
            <TouchableOpacity
              style={[styles.deleteBtn, { backgroundColor: colors.error }]}
              onPress={() => {
                Alert.alert('Delete Book', `Remove "${book.title}" permanently?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: async () => { await deleteUploadedBook(id); router.back(); } },
                ]);
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.deleteBtnText}>Delete Book</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  heroSection: { height: 340, justifyContent: 'flex-end', overflow: 'hidden' },
  heroBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.25 },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  navBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  heroContent: { alignItems: 'center', paddingBottom: Spacing.xl },
  coverShadow: {
    width: COVER_W, height: COVER_H, borderRadius: BorderRadius.lg, overflow: 'hidden',
    elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16,
  },
  cover: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  coverLetter: { fontSize: FontSize.heroDisplay, fontWeight: '800' },
  body: { paddingTop: Spacing.md },
  bookTitle: { fontSize: FontSize.heading2, fontWeight: '800', lineHeight: 34, letterSpacing: -0.5, marginBottom: Spacing.xs },
  bookAuthor: { fontSize: FontSize.bodyMd, fontWeight: '500', marginBottom: Spacing.lg },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  infoChipText: { fontSize: FontSize.xs, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  readBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md + 4, borderRadius: BorderRadius.lg },
  readBtnText: { fontSize: FontSize.bodyMd, fontWeight: '700' },
  downloadBtn: { width: 50, height: 50, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  libraryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.xl },
  libraryBtnText: { fontSize: FontSize.bodyMd, fontWeight: '600' },
  ratingSection: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
  starsRow: { flexDirection: 'row', gap: Spacing.md },
  starBtn: { padding: 2 },
  statusSection: { marginBottom: Spacing.xl },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusChip: { flex: 1, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 1 },
  statusChipText: { fontSize: FontSize.sm, fontWeight: '600' },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSize.heading5, fontWeight: '700', marginBottom: Spacing.md },
  description: { fontSize: FontSize.bodyMd, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, borderWidth: 1 },
  tagText: { fontSize: FontSize.sm },
  noteCard: { borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 3 },
  noteText: { fontSize: FontSize.bodyMd, lineHeight: 22 },
  noteDate: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.xl },
  deleteBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
});
