import { Book } from '../types';
import pdfData from '../data/pdfbooksfree_books_compact.json';

interface CompactBook {
  t: string;
  a: string;
  d: string;
  url: string;
  pdf: string;
  img: string;
  cat: string;
  tags: string[];
}

interface PdfData {
  source: string;
  total: number;
  categories: Record<string, number>;
  books: CompactBook[];
}

const data = pdfData as PdfData;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60);
}

function compactToBook(book: CompactBook): Book {
  const id = `pdf_${slugify(book.t)}`;
  return {
    id,
    title: book.t,
    authors: book.a ? [book.a] : ['Unknown'],
    description: book.d || '',
    thumbnail: book.img || '',
    publishedDate: '',
    pageCount: 0,
    categories: [book.cat, ...book.tags.slice(0, 3)],
    averageRating: 0,
    ratingsCount: 0,
    previewLink: book.pdf || book.url,
    infoLink: book.url,
    downloadUrl: book.pdf || book.url,
  };
}

const ALL_PDF_BOOKS: Book[] = data.books.map(compactToBook);

const CATEGORY_INDEX: Record<string, Book[]> = {};
for (const book of ALL_PDF_BOOKS) {
  for (const cat of book.categories) {
    const key = cat.toLowerCase();
    if (!CATEGORY_INDEX[key]) CATEGORY_INDEX[key] = [];
    CATEGORY_INDEX[key].push(book);
  }
}

const MAIN_CATEGORY_INDEX: Record<string, Book[]> = {};
for (const raw of data.books) {
  if (!MAIN_CATEGORY_INDEX[raw.cat]) MAIN_CATEGORY_INDEX[raw.cat] = [];
  MAIN_CATEGORY_INDEX[raw.cat].push(compactToBook(raw));
}

export function getPdfBooksByCategory(category: string, limit?: number): Book[] {
  const key = category.toLowerCase();
  const result = CATEGORY_INDEX[key] || [];
  return limit ? result.slice(0, limit) : result;
}

export function getPdfBooksByMainCategory(mainCategory: string, limit?: number): Book[] {
  const result = MAIN_CATEGORY_INDEX[mainCategory] || [];
  return limit ? result.slice(0, limit) : result;
}

export function getAllPdfBooks(limit?: number): Book[] {
  return limit ? ALL_PDF_BOOKS.slice(0, limit) : ALL_PDF_BOOKS;
}

export function searchPdfBooks(query: string, limit: number = 20): Book[] {
  const q = query.toLowerCase();
  return ALL_PDF_BOOKS.filter(
    b =>
      b.title.toLowerCase().includes(q) ||
      b.authors.some(a => a.toLowerCase().includes(q)) ||
      b.description.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function getPdfMainCategories(): { name: string; count: number }[] {
  return Object.entries(data.categories)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }));
}

export function getPdfTopCategories(minCount: number = 10): { name: string; count: number }[] {
  return getPdfMainCategories().filter(c => c.count >= minCount);
}

export function getPdfBookCount(): number {
  return data.total;
}

export function getPdfBookById(id: string): Book | null {
  return ALL_PDF_BOOKS.find(b => b.id === id) || null;
}
