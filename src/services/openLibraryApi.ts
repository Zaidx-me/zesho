import { Book } from '../types';

const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json';
const OPEN_LIBRARY_BOOKS = 'https://openlibrary.org/api/books';
const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org/b/id';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  subject?: string[];
  ratings_average?: number;
  ratings_count?: number;
  edition_count?: number;
  number_of_pages_median?: number;
  publisher?: string[];
  language?: string[];
}

interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryDoc[];
}

function formatOpenLibraryBook(doc: OpenLibraryDoc): Book {
  const thumbnail = doc.cover_i
    ? `${OPEN_LIBRARY_COVERS}/${doc.cover_i}-L.jpg`
    : '';

  const previewLink = doc.isbn?.[0]
    ? `https://openlibrary.org/isbn/${doc.isbn[0]}`
    : `https://openlibrary.org${doc.key}`;

  return {
    id: doc.key.replace('/works/', 'ol_'),
    title: doc.title || 'Unknown',
    authors: doc.author_name || ['Unknown'],
    description: doc.subject?.slice(0, 5).join(', ') || '',
    thumbnail,
    publishedDate: doc.first_publish_year?.toString() || '',
    pageCount: doc.number_of_pages_median || 0,
    categories: doc.subject?.slice(0, 3) || [],
    averageRating: doc.ratings_average || 0,
    ratingsCount: doc.ratings_count || 0,
    previewLink,
    infoLink: previewLink,
    downloadUrl: previewLink,
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

export async function searchOpenLibrary(
  query: string,
  limit: number = 10
): Promise<Book[]> {
  const data = await fetchJson<OpenLibrarySearchResponse>(
    `${OPEN_LIBRARY_SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!data?.docs) return [];
  return data.docs
    .filter((doc) => doc.title)
    .map(formatOpenLibraryBook);
}

export async function getOpenLibraryByISBN(
  isbn: string
): Promise<Book | null> {
  const data = await fetchJson<Record<string, any>>(
    `${OPEN_LIBRARY_BOOKS}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
  );
  if (!data) return null;
  const entry = data[`ISBN:${isbn}`];
  if (!entry) return null;

  return {
    id: `ol_isbn_${isbn}`,
    title: entry.title || 'Unknown',
    authors: entry.authors?.map((a: any) => a.name) || ['Unknown'],
    description: entry.subjects?.map((s: any) => s.name).slice(0, 5).join(', ') || '',
    thumbnail: entry.cover?.large || entry.cover?.medium || entry.cover?.small || '',
    publishedDate: entry.publish_date || '',
    pageCount: entry.number_of_pages || 0,
    categories: entry.subjects?.slice(0, 3).map((s: any) => s.name) || [],
    averageRating: 0,
    ratingsCount: 0,
    previewLink: entry.url || `https://openlibrary.org/isbn/${isbn}`,
    infoLink: entry.url || `https://openlibrary.org/isbn/${isbn}`,
    downloadUrl: entry.url || '',
  };
}

export async function getOpenLibraryByOLID(
  olid: string
): Promise<Book | null> {
  const data = await fetchJson<any>(
    `https://openlibrary.org/works/${olid}.json`
  );
  if (!data) return null;

  const authors = data.authors?.map((a: any) => a.author?.key || '').filter(Boolean) || [];
  const authorNames = authors.length > 0 ? authors : ['Unknown'];

  const coverId = data.covers?.[0];
  const thumbnail = coverId
    ? `${OPEN_LIBRARY_COVERS}/${coverId}-L.jpg`
    : '';

  const workUrl = `https://openlibrary.org/works/${olid}`;
  let previewLink = workUrl;
  let downloadUrl = workUrl;

  // Try to find an IA edition for direct PDF access
  try {
    const editionsData = await fetchJson<any>(
      `https://openlibrary.org/works/${olid}/editions.json?limit=20`
    );
    if (editionsData?.entries) {
      for (const edition of editionsData.entries) {
        if (edition.ocaid) {
          // Found an IA edition — construct embed and download URLs
          previewLink = `https://archive.org/embed/${edition.ocaid}?ui=embed#mode/1up`;
          downloadUrl = `https://archive.org/download/${edition.ocaid}/${edition.ocaid}.pdf`;
          break;
        }
      }
    }
  } catch {}

  return {
    id: `ol_work_${olid}`,
    title: data.title || 'Unknown',
    authors: authorNames,
    description: data.description?.value || data.description || '',
    thumbnail,
    publishedDate: data.first_publish_date || '',
    pageCount: 0,
    categories: [],
    averageRating: 0,
    ratingsCount: 0,
    previewLink,
    infoLink: workUrl,
    downloadUrl,
  };
}
