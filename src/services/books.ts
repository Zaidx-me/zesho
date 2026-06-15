import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { UserBook, Note } from '../types';
import { withTimeout } from './firestoreUtils';

// User Books
export async function addBookToLibrary(book: UserBook) {
  const docRef = doc(db, 'userBooks', `${book.userId}_${book.bookId}`);
  await withTimeout(setDoc(docRef, book));
}

export async function removeBookFromLibrary(userId: string, bookId: string) {
  const docRef = doc(db, 'userBooks', `${userId}_${bookId}`);
  await withTimeout(deleteDoc(docRef));
}

export async function getUserBooks(userId: string): Promise<UserBook[]> {
  const q = query(
    collection(db, 'userBooks'),
    where('userId', '==', userId),
    orderBy('addedAt', 'desc')
  );
  const snapshot = await withTimeout(getDocs(q));
  return snapshot.docs.map(doc => doc.data() as UserBook);
}

export async function updateUserBookStatus(
  userId: string,
  bookId: string,
  updates: Partial<UserBook>
) {
  const docRef = doc(db, 'userBooks', `${userId}_${bookId}`);
  await withTimeout(updateDoc(docRef, updates));
}

export async function updateBookStatus(
  userId: string,
  bookId: string,
  status: 'want_to_read' | 'reading' | 'finished'
) {
  const docRef = doc(db, 'userBooks', `${userId}_${bookId}`);
  await withTimeout(updateDoc(docRef, { status }));
}

export async function updateBookRating(
  userId: string,
  bookId: string,
  rating: number
) {
  const docRef = doc(db, 'userBooks', `${userId}_${bookId}`);
  await withTimeout(updateDoc(docRef, { rating }));
}

export async function isInLibrary(userId: string, bookId: string): Promise<boolean> {
  const docRef = doc(db, 'userBooks', `${userId}_${bookId}`);
  const docSnap = await withTimeout(getDoc(docRef));
  return docSnap.exists();
}

// Notes
export async function addNote(note: Note) {
  const docRef = doc(db, 'notes', note.id);
  await withTimeout(setDoc(docRef, note));
}

export async function updateNote(noteId: string, updates: Partial<Note>) {
  const docRef = doc(db, 'notes', noteId);
  await withTimeout(updateDoc(docRef, updates));
}

export async function deleteNote(noteId: string) {
  const docRef = doc(db, 'notes', noteId);
  await withTimeout(deleteDoc(docRef));
}

export async function getNotesForBook(userId: string, bookId: string): Promise<Note[]> {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    where('bookId', '==', bookId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await withTimeout(getDocs(q));
  return snapshot.docs.map(doc => doc.data() as Note);
}

export async function getAllUserNotes(userId: string): Promise<Note[]> {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await withTimeout(getDocs(q));
  return snapshot.docs.map(doc => doc.data() as Note);
}
