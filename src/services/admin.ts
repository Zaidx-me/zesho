import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUploadedBooks } from './localDb';

const ADMIN_EMAILS = ['m.zaid.tech@gmail.com'];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function deleteUploadedBook(bookId: string): Promise<boolean> {
  try {
    // Remove from uploaded books
    const books = await getUploadedBooks();
    const filtered = books.filter(b => b.id !== bookId);
    if (filtered.length === books.length) return false;
    await AsyncStorage.setItem('local_uploaded_books', JSON.stringify(filtered));

    // Remove from all user libraries
    const allKeys = await AsyncStorage.getAllKeys();
    const userBookKeys = allKeys.filter(k => k.startsWith('local_books_'));
    for (const key of userBookKeys) {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) continue;
      const userBooks = JSON.parse(raw);
      const filteredUserBooks = userBooks.filter((b: any) => b.bookId !== bookId);
      if (filteredUserBooks.length !== userBooks.length) {
        await AsyncStorage.setItem(key, JSON.stringify(filteredUserBooks));
      }
    }

    return true;
  } catch {
    return false;
  }
}
