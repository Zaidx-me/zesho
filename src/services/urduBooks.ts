import { Book } from '../types';
import urduData from '../data/books_compact.json';

interface CompactBook {
  id: string;
  t: string;
  a: string;
  d: string;
  img: string;
  cat: string[];
  sub: string;
  url: string;
}

interface UrduData {
  source: string;
  total: number;
  categories: Record<string, number>;
  subcategories: Record<string, number>;
  books: CompactBook[];
}

const data = urduData as UrduData;

function compactToBook(book: CompactBook): Book {
  return {
    id: `urdu_${book.id}`,
    title: book.t,
    authors: [book.a],
    description: book.d,
    thumbnail: book.img,
    publishedDate: '',
    pageCount: 0,
    categories: [...book.cat, 'Urdu'],
    averageRating: 0,
    ratingsCount: 0,
    previewLink: book.url,
    infoLink: book.url,
    downloadUrl: book.url,
  };
}

// Pre-build the full list at module load time
const ALL_URDU_BOOKS: Book[] = data.books.map(compactToBook);

// Build category index
const CATEGORY_INDEX: Record<string, Book[]> = {};
for (const book of ALL_URDU_BOOKS) {
  for (const cat of book.categories) {
    const key = cat.toLowerCase();
    if (!CATEGORY_INDEX[key]) CATEGORY_INDEX[key] = [];
    CATEGORY_INDEX[key].push(book);
  }
}

export function getUrduBooksByCategory(category: string, limit: number = 20): Book[] {
  const key = category.toLowerCase();
  return (CATEGORY_INDEX[key] || []).slice(0, limit);
}

export function getAllUrduBooks(limit: number = 50): Book[] {
  return ALL_URDU_BOOKS.slice(0, limit);
}

export function searchUrduBooks(query: string, limit: number = 20): Book[] {
  const q = query.toLowerCase();
  return ALL_URDU_BOOKS.filter(
    b =>
      b.title.toLowerCase().includes(q) ||
      b.authors.some(a => a.toLowerCase().includes(q)) ||
      b.description.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function getUrduCategories(): string[] {
  return Object.keys(data.categories);
}

export function getUrduCategoryCount(category: string): number {
  return data.categories[category] || 0;
}

export function getUrduBookCount(): number {
  return data.total;
}

export function getUrduBookById(id: string): Book | null {
  return ALL_URDU_BOOKS.find(b => b.id === id) || null;
}
