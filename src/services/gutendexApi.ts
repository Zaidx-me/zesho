import { Book } from '../types';

const GUTENDEX_BASE = 'https://gutendex.com';

interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string; birth_year?: number; death_year?: number }[];
  translators: { name: string; birth_year?: number; death_year?: number }[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean;
  media_type: string;
  formats: {
    'text/html'?: string;
    'text/plain'?: string;
    'application/pdf'?: string;
    'application/epub+zip'?: string;
    'image/jpeg'?: string;
  };
  download_count: number;
}

interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

function gutendexToBook(g: GutendexBook): Book {
  const author = g.authors.length > 0 ? g.authors[0].name : 'Unknown';
  const thumb = g.formats['image/jpeg'] || '';
  const pdfUrl = g.formats['application/pdf'] || '';
  const htmlUrl = g.formats['text/html'] || '';

  // Construct IA identifier from Gutenberg ID
  const iaId = `gutenberg${g.id}`;

  return {
    id: `gutendex_${g.id}`,
    title: g.title || 'Unknown',
    authors: g.authors.length > 0 ? g.authors.map(a => a.name) : ['Unknown'],
    description: `Free public domain book from Project Gutenberg. ${g.download_count.toLocaleString()} downloads.`,
    thumbnail: thumb,
    publishedDate: '',
    pageCount: 0,
    categories: g.bookshelves.slice(0, 3),
    averageRating: 0,
    ratingsCount: g.download_count,
    previewLink: htmlUrl || `https://www.gutenberg.org/ebooks/${g.id}`,
    infoLink: `https://www.gutenberg.org/ebooks/${g.id}`,
    downloadUrl: pdfUrl || htmlUrl || `https://www.gutenberg.org/cache/epub/${g.id}/pg${g.id}.pdf`,
  } as Book;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export async function searchGutendex(
  query: string,
  limit: number = 10
): Promise<Book[]> {
  const data = await fetchJson<GutendexResponse>(
    `${GUTENDEX_BASE}/books?search=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!data?.results) return [];
  return data.results.map(gutendexToBook);
}

export async function getGutendexByIds(
  ids: number[]
): Promise<Book[]> {
  if (ids.length === 0) return [];
  const data = await fetchJson<GutendexResponse>(
    `${GUTENDEX_BASE}/books?ids=${ids.join(',')}`
  );
  if (!data?.results) return [];
  return data.results.map(gutendexToBook);
}

export async function getGutendexByTopic(
  topic: string,
  limit: number = 20
): Promise<Book[]> {
  const data = await fetchJson<GutendexResponse>(
    `${GUTENDEX_BASE}/books?topic=${encodeURIComponent(topic)}&limit=${limit}`
  );
  if (!data?.results) return [];
  return data.results.map(gutendexToBook);
}

export async function getGutendexPopular(
  limit: number = 20
): Promise<Book[]> {
  const data = await fetchJson<GutendexResponse>(
    `${GUTENDEX_BASE}/books?sort=popular&limit=${limit}`
  );
  if (!data?.results) return [];
  return data.results.map(gutendexToBook);
}

export async function getGutendexRecent(
  limit: number = 20
): Promise<Book[]> {
  const data = await fetchJson<GutendexResponse>(
    `${GUTENDEX_BASE}/books?sort=added&limit=${limit}`
  );
  if (!data?.results) return [];
  return data.results.map(gutendexToBook);
}

export function getGutenbergPdfUrl(gutenbergId: number): string {
  return `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.pdf`;
}

export function getGutenbergReadUrl(gutenbergId: number): string {
  return `https://www.gutenberg.org/ebooks/${gutenbergId}`;
}
