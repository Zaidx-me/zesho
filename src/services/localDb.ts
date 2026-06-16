import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserBook, Note } from '../types';

export interface UploadedBook {
  id: string;
  title: string;
  author: string;
  semester: string;
  course: string;
  pdfUrl: string;
  createdAt: number;
  thumbnail?: string;
}

function userBooksKey(userId: string) { return `local_books_${userId}`; }
function userNotesKey(userId: string) { return `local_notes_${userId}`; }
const UPLOADED_KEY = 'local_uploaded_books';

// ---- User Books ----
export async function addBookToLibrary(book: UserBook) {
  const key = userBooksKey(book.userId);
  const raw = await AsyncStorage.getItem(key);
  const books: UserBook[] = raw ? JSON.parse(raw) : [];
  books.unshift(book);
  await AsyncStorage.setItem(key, JSON.stringify(books));
}

export async function removeBookFromLibrary(userId: string, bookId: string) {
  const key = userBooksKey(userId);
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return;
  const books: UserBook[] = JSON.parse(raw).filter((b: UserBook) => b.bookId !== bookId);
  await AsyncStorage.setItem(key, JSON.stringify(books));
}

export async function getUserBooks(userId: string): Promise<UserBook[]> {
  const raw = await AsyncStorage.getItem(userBooksKey(userId));
  return raw ? JSON.parse(raw) : [];
}

async function getBook(userId: string, bookId: string): Promise<UserBook | null> {
  const books = await getUserBooks(userId);
  return books.find(b => b.bookId === bookId) || null;
}

export async function isInLibrary(userId: string, bookId: string): Promise<boolean> {
  const book = await getBook(userId, bookId);
  return !!book;
}

export async function updateBookStatus(
  userId: string,
  bookId: string,
  status: 'want_to_read' | 'reading' | 'finished'
) {
  const key = userBooksKey(userId);
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return;
  const books: UserBook[] = JSON.parse(raw).map((b: UserBook) =>
    b.bookId === bookId ? { ...b, status } : b
  );
  await AsyncStorage.setItem(key, JSON.stringify(books));
}

export async function updateBookRating(userId: string, bookId: string, rating: number) {
  const key = userBooksKey(userId);
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return;
  const books: UserBook[] = JSON.parse(raw).map((b: UserBook) =>
    b.bookId === bookId ? { ...b, rating } : b
  );
  await AsyncStorage.setItem(key, JSON.stringify(books));
}

// ---- Notes ----
export async function addNote(note: Note) {
  const key = userNotesKey(note.userId);
  const raw = await AsyncStorage.getItem(key);
  const notes: Note[] = raw ? JSON.parse(raw) : [];
  notes.unshift(note);
  await AsyncStorage.setItem(key, JSON.stringify(notes));
}

export async function updateNote(noteId: string, updates: Partial<Note>) {
  const allKeys = await AsyncStorage.getAllKeys();
  const noteKeys = allKeys.filter(k => k.startsWith('local_notes_'));
  for (const key of noteKeys) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;
    const notes: Note[] = JSON.parse(raw);
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx !== -1) {
      notes[idx] = { ...notes[idx], ...updates };
      await AsyncStorage.setItem(key, JSON.stringify(notes));
      return;
    }
  }
}

export async function deleteNote(noteId: string) {
  const allKeys = await AsyncStorage.getAllKeys();
  const noteKeys = allKeys.filter(k => k.startsWith('local_notes_'));
  for (const key of noteKeys) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;
    const notes: Note[] = JSON.parse(raw);
    const filtered = notes.filter(n => n.id !== noteId);
    if (filtered.length !== notes.length) {
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
      return;
    }
  }
}

export async function getNotesForBook(userId: string, bookId: string): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(userNotesKey(userId));
  if (!raw) return [];
  const notes: Note[] = JSON.parse(raw);
  return notes.filter(n => n.bookId === bookId);
}

export async function getAllUserNotes(userId: string): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(userNotesKey(userId));
  return raw ? JSON.parse(raw) : [];
}

// ---- Uploaded Books ----
export async function saveUploadedBook(book: UploadedBook) {
  const raw = await AsyncStorage.getItem(UPLOADED_KEY);
  const books: UploadedBook[] = raw ? JSON.parse(raw) : [];
  books.unshift(book);
  await AsyncStorage.setItem(UPLOADED_KEY, JSON.stringify(books));
}

export async function getUploadedBooks(): Promise<UploadedBook[]> {
  const raw = await AsyncStorage.getItem(UPLOADED_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getUploadedBooksBySemester(semester: string): Promise<UploadedBook[]> {
  const raw = await AsyncStorage.getItem(UPLOADED_KEY);
  if (!raw) return [];
  const books: UploadedBook[] = JSON.parse(raw);
  return books.filter(b => b.semester === semester);
}

export async function clearUserLibrary(userId: string) {
  await AsyncStorage.removeItem(userBooksKey(userId));
}

export async function clearUserNotes(userId: string) {
  await AsyncStorage.removeItem(userNotesKey(userId));
}

// ---- Dismissed Notifications ----
const DISMISSED_NOTIFS_KEY = 'dismissed_notifications';

export async function getDismissedNotifications(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(DISMISSED_NOTIFS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function dismissNotification(id: string) {
  const dismissed = await getDismissedNotifications();
  if (!dismissed.includes(id)) {
    dismissed.push(id);
    await AsyncStorage.setItem(DISMISSED_NOTIFS_KEY, JSON.stringify(dismissed));
  }
}

export async function clearDismissedNotifications() {
  await AsyncStorage.removeItem(DISMISSED_NOTIFS_KEY);
}
