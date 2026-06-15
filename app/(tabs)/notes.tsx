import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { getAllUserNotes, deleteNote, updateNote } from '../../src/services/books';
import { Note } from '../../src/types';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';

export default function NotesScreen() {
  const { user, skipped } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const userNotes = await getAllUserNotes(user.uid);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(noteId);
          setNotes(notes.filter(n => n.id !== noteId));
        },
      },
    ]);
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;
    await updateNote(noteId, { content: editContent.trim(), updatedAt: Date.now() });
    setNotes(notes.map(n => n.id === noteId ? { ...n, content: editContent.trim() } : n));
    setEditingId(null);
    setEditContent('');
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={[styles.noteCard, { backgroundColor: colors.surfaceElevated }]}>
      {editingId === item.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editInput, { backgroundColor: colors.background, color: colors.textPrimary }]}
            value={editContent}
            onChangeText={setEditContent}
            multiline
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity onPress={() => setEditingId(null)} style={styles.editButton}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSaveEdit(item.id)} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.saveText, { color: colors.white }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text style={[styles.noteContent, { color: colors.textPrimary }]}>{item.content}</Text>
          <View style={styles.noteFooter}>
            <Text style={[styles.noteDate, { color: colors.textMuted }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                <Ionicons name="pencil" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );

  if (skipped || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>My Notes</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="pencil-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Sign in to use Notes</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Create an account to save notes on books</Text>
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>My Notes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{notes.length} notes</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNote}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pencil-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No notes yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Add notes from book detail pages</Text>
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
  },
  subtitle: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.huge,
  },
  noteCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  noteContent: {
    fontSize: FontSize.md,
    lineHeight: 24,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  noteDate: {
    fontSize: FontSize.xs,
  },
  noteActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  editContainer: {
    gap: Spacing.sm,
  },
  editInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  editButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  cancelText: {
    fontSize: FontSize.md,
  },
  saveButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  saveText: {
    fontSize: FontSize.md,
    fontWeight: '600',
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
