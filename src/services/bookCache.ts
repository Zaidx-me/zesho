import { Book } from '../types';
import { searchBooks } from './googleBooks';
import { getAllUrduBooks } from './urduBooks';

interface CacheEntry {
  data: Book[];
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function getCached(key: string): Book[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: Book[]) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Preload all categories at app start
let preloaded = false;
const PRELOAD_QUERIES = [
  { key: 'popular', query: 'popular fiction' },
  { key: 'fiction', query: 'classic literature' },
  { key: 'science', query: 'science nature' },
  { key: 'self-help', query: 'self help motivation' },
  { key: 'poetry', query: 'poetry anthology' },
  { key: 'psychology', query: 'psychology' },
  { key: 'religion', query: 'religion spirituality' },
  { key: 'romance', query: 'romance novel' },
  { key: 'history', query: 'history' },
  { key: 'politics', query: 'politics government' },
  { key: 'biography', query: 'biography autobiography' },
];

export function preloadBooks() {
  if (preloaded) return;
  preloaded = true;

  // Preload Urdu books (instant, local)
  const urdu = getAllUrduBooks(2138);
  setCache('urdu', urdu);

  // Preload all categories in background
  PRELOAD_QUERIES.forEach(({ key, query }) => {
    searchBooks(query, 20).then(books => setCache(key, books)).catch(() => {});
  });
}

export async function getCachedBooks(key: string, query: string, limit: number = 20): Promise<Book[]> {
  const cached = getCached(key);
  if (cached) return cached.slice(0, limit);

  // Urdu books are local
  if (key === 'urdu') {
    const urdu = getAllUrduBooks(limit);
    setCache('urdu', urdu);
    return urdu;
  }

  const books = await searchBooks(query, limit);
  setCache(key, books);
  return books;
}

export function invalidateCache(key?: string) {
  if (key) cache.delete(key);
  else cache.clear();
}
