import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { pickPdf, uploadPdf, saveBookMetadata, extractDriveFileId, buildDriveDownloadUrl } from '../src/services/uploadService';

const SEMESTERS = [
  { key: 'semester_1', label: 'Semester 1' },
  { key: 'semester_2', label: 'Semester 2' },
  { key: 'semester_3', label: 'Semester 3' },
  { key: 'semester_4', label: 'Semester 4' },
  { key: 'semester_5', label: 'Semester 5' },
  { key: 'semester_6', label: 'Semester 6' },
];

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [mode, setMode] = useState<'pdf' | 'drive'>('drive');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [semester, setSemester] = useState('semester_1');
  const [course, setCourse] = useState('');
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePickPdf = async () => {
    const result = await pickPdf();
    if (result && result.assets && result.assets.length > 0) {
      setPdfUri(result.assets[0].uri);
      setPdfName(result.assets[0].name || 'Unknown file');
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Missing', 'Please enter a book title');
      return;
    }
    if (!author.trim()) {
      Alert.alert('Missing', 'Please enter an author');
      return;
    }
    if (!course.trim()) {
      Alert.alert('Missing', 'Please enter a course name');
      return;
    }

    let pdfUrl = '';

    if (mode === 'drive') {
      if (!driveLink.trim()) {
        Alert.alert('Missing', 'Please paste a Google Drive share link');
        return;
      }
      const fileId = extractDriveFileId(driveLink.trim());
      if (!fileId) {
        Alert.alert('Invalid Link', 'Could not extract file ID from the link.\n\nMake sure it looks like:\nhttps://drive.google.com/file/d/FILE_ID/view');
        return;
      }
      pdfUrl = buildDriveDownloadUrl(fileId);
    } else {
      if (!pdfUri) {
        Alert.alert('Missing', 'Please select a PDF file');
        return;
      }
    }

    setUploading(true);
    setProgress(0);

    try {
      if (mode === 'pdf') {
        const url = await uploadPdf(pdfUri!, pdfName || 'book.pdf', (p) => setProgress(p));
        if (!url) {
          Alert.alert('Upload Failed', 'Could not upload PDF to Firebase Storage.\n\nCommon fixes:\n1. Go to Firebase Console > Storage > Rules\n2. Set rules to allow read/write\n3. Make sure Firebase Storage is enabled');
          setUploading(false);
          return;
        }
        pdfUrl = url;
      }

      const docId = await saveBookMetadata({
        title: title.trim(),
        author: author.trim(),
        semester,
        course: course.trim(),
        pdfUrl,
        userId: user?.uid,
      });

      if (docId) {
        Alert.alert('Success', `"${title}" added to ${SEMESTERS.find(s => s.key === semester)?.label}!`, [
          { text: 'Done', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Partial Success', 'Book data saved but may not appear. Check Firestore rules.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Something went wrong');
    }

    setUploading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceElevated }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Add Course Book</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Add to the curriculum</Text>
          </View>
        </View>

        {/* Mode Toggle */}
        <View style={[styles.modeSwitch, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'drive' && { backgroundColor: colors.primary }]}
            onPress={() => setMode('drive')}
          >
            <Ionicons name="link" size={18} color={mode === 'drive' ? colors.white : colors.textSecondary} />
            <Text style={[styles.modeBtnText, { color: mode === 'drive' ? colors.white : colors.textSecondary }]}>Drive Link</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'pdf' && { backgroundColor: colors.primary }]}
            onPress={() => setMode('pdf')}
          >
            <Ionicons name="document" size={18} color={mode === 'pdf' ? colors.white : colors.textSecondary} />
            <Text style={[styles.modeBtnText, { color: mode === 'pdf' ? colors.white : colors.textSecondary }]}>Upload PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Book Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="e.g. Calculus Early Transcendentals"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Author</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="e.g. James Stewart"
            placeholderTextColor={colors.textMuted}
            value={author}
            onChangeText={setAuthor}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Course Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="e.g. Calculus & Analytical Geometry"
            placeholderTextColor={colors.textMuted}
            value={course}
            onChangeText={setCourse}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Semester</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semRow}>
            {SEMESTERS.map((sem) => (
              <TouchableOpacity
                key={sem.key}
                style={[styles.semChip, { backgroundColor: semester === sem.key ? colors.primary : colors.surface, borderColor: semester === sem.key ? colors.primary : colors.border }]}
                onPress={() => setSemester(sem.key)}
              >
                <Text style={[styles.semChipText, { color: semester === sem.key ? colors.white : colors.textSecondary }]}>{sem.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {mode === 'drive' ? (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Google Drive Link</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="https://drive.google.com/file/d/..."
                placeholderTextColor={colors.textMuted}
                value={driveLink}
                onChangeText={setDriveLink}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.hint, { color: colors.textMuted }]}>Share the PDF on Google Drive and paste the link here</Text>
            </>
          ) : (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>PDF File</Text>
              <TouchableOpacity
                style={[styles.filePicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handlePickPdf}
                disabled={uploading}
              >
                <Ionicons name="document-outline" size={28} color={colors.primary} />
                <Text style={[styles.filePickerText, { color: pdfName ? colors.textPrimary : colors.textMuted }]}>
                  {pdfName || 'Tap to select a PDF'}
                </Text>
                {pdfName && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
              </TouchableOpacity>
            </>
          )}
        </View>

        {uploading && mode === 'pdf' && (
          <View style={[styles.progressCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.progressHeader}>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
              <Text style={[styles.progressText, { color: colors.textPrimary }]}>Uploading... {Math.round(progress)}%</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.primary, opacity: uploading ? 0.6 : 1 }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name={mode === 'drive' ? 'link' : 'cloud-upload'} size={22} color={colors.white} />
              <Text style={[styles.uploadButtonText, { color: colors.white }]}>
                {mode === 'drive' ? 'Add Book' : 'Upload PDF'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.xxl, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xxl },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: '800' },
  subtitle: { fontSize: FontSize.sm, marginTop: 2 },
  modeSwitch: {
    flexDirection: 'row', borderRadius: BorderRadius.lg, padding: 4, borderWidth: 1, marginBottom: Spacing.lg,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
  },
  modeBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  formCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, gap: Spacing.md, marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: -4 },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSize.md },
  hint: { fontSize: FontSize.xs, marginTop: -4 },
  semRow: { gap: Spacing.sm },
  semChip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.full, borderWidth: 1 },
  semChipText: { fontSize: FontSize.sm, fontWeight: '600' },
  filePicker: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.lg, borderStyle: 'dashed' },
  filePickerText: { fontSize: FontSize.md, flex: 1 },
  progressCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, marginBottom: Spacing.lg },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  progressText: { fontSize: FontSize.sm, fontWeight: '600' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg },
  uploadButtonText: { fontSize: FontSize.lg, fontWeight: '700' },
});
