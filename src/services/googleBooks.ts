import { Book } from '../types';
import { getUploadedBooks } from './localDb';
import { getPotterBooks } from './potterApi';
import { searchOpenLibrary, getOpenLibraryByOLID } from './openLibraryApi';
import { searchGutendex, getGutendexByTopic, getGutendexPopular, getGutendexByIds } from './gutendexApi';
import { getAllUrduBooks, searchUrduBooks } from './urduBooks';

const GOOGLE_BOOKS_API_KEY = 'AIzaSyC43tafb5N_wN96Wwru0Md3y6pWb78vlmU';

function formatGoogleVolume(item: any): Book {
  const v = item.volumeInfo || {};
  return {
    id: item.id,
    title: v.title || 'Unknown',
    authors: v.authors || ['Unknown'],
    description: v.description || '',
    thumbnail: v.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
    publishedDate: v.publishedDate || '',
    pageCount: v.pageCount || 0,
    categories: v.categories || [],
    averageRating: v.averageRating || 0,
    ratingsCount: v.ratingsCount || 0,
    previewLink: v.previewLink || '',
    infoLink: v.infoLink || '',
    downloadUrl: v.previewLink || '',
  };
}

async function fetchGoogleBooks(query: string, maxResults: number = 20, startIndex: number = 0): Promise<Book[]> {
  try {
    const resp = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${Math.min(maxResults, 40)}&startIndex=${startIndex}&printType=books&key=${GOOGLE_BOOKS_API_KEY}`
    );
    const data = await resp.json();
    if (!data.items) return [];
    return data.items.filter((i: any) => i.volumeInfo).map(formatGoogleVolume);
  } catch {
    return [];
  }
}

async function fetchGoogleBookById(volumeId: string): Promise<Book | null> {
  try {
    const resp = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${volumeId}?key=${GOOGLE_BOOKS_API_KEY}`
    );
    if (!resp.ok) return null;
    const item = await resp.json();
    if (!item.volumeInfo) return null;
    return formatGoogleVolume(item);
  } catch {
    return null;
  }
}

function deduplicateBooks(books: Book[]): Book[] {
  const seen = new Map<string, Book>();
  for (const book of books) {
    const key = book.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(key)) seen.set(key, book);
  }
  return Array.from(seen.values());
}

// Semester textbook mappings (title + author for Google Books lookup)
const SEMESTER_BOOKS: Record<string, { title: string; author: string; course: string }[]> = {
  semester_1: [
    { title: 'Computer Organization and Design', author: 'Patterson & Hennessy', course: 'Intro to ICT' },
    { title: 'C Programming: A Modern Approach', author: 'K.N. King', course: 'Programming Fundamentals' },
    { title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', course: 'Calculus & Analytical Geometry' },
    { title: 'Basic Mathematics', author: 'Serge Lang', course: 'Applied Physics' },
  ],
  semester_2: [
    { title: 'Fundamentals of C++ Programming', author: 'Richard L. Halterman', course: 'Object Oriented Programming' },
    { title: 'Computer Organization and Design', author: 'Patterson & Hennessy', course: 'Digital Logic Design' },
    { title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', course: 'Discrete Structures' },
    { title: 'Basic Mathematics', author: 'Serge Lang', course: 'Probability & Statistics' },
  ],
  semester_3: [
    { title: 'Data Structures and Algorithms', author: 'Various', course: 'Data Structures & Algorithms' },
    { title: 'Computer Organization and Design', author: 'Patterson & Hennessy', course: 'Computer Organization & Assembly' },
    { title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', course: 'Linear Algebra' },
  ],
  semester_4: [
    { title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', course: 'Operating Systems' },
    { title: 'Fundamentals of Python', author: 'Richard L. Halterman', course: 'Database Systems' },
    { title: 'Data Structures and Algorithms', author: 'Various', course: 'Design & Analysis of Algorithms' },
  ],
  semester_5: [
    { title: 'Computer Networking', author: 'Kurose & Ross', course: 'Computer Networks' },
    { title: 'Linux Basics for Hackers', author: 'OccupyTheWeb', course: 'Theory of Automata' },
    { title: 'Artificial Intelligence', author: 'Russell & Norvig', course: 'Artificial Intelligence' },
  ],
  semester_6: [
    { title: 'The Giant Black Book of Computer Viruses', author: 'Mark A. Ludwig', course: 'Information Security' },
    { title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', course: 'Compiler Construction' },
  ],
};

// Specific curated books for Top of Week
const TOP_OF_WEEK_IDS = [
  'yK4HBgAAQBAJ',   // Atomic Habits
  'h2cPAAAAQBAJ',   // Rich Dad Poor Dad
];
const TOP_OF_WEEK_QUERIES = [
  'intitle:Halim+author:Shafiq-ur-Rahman',
  'intitle:Main+Aur+Mera+Pakistan+author:Mushtaq+Ahmed+Yousufi',
  'intitle:Aap+Se+Kya+Parda+author:Bano+Qudsia',
  'intitle:Peer-e-Kamil+author:Umera+Ahmed',
  'intitle:Aab-e-Hayat+author:Umera+Ahmed',
  'intitle:Zaviya+author:Ismat+Chughtai',
];

export async function fetchTopOfWeek(): Promise<Book[]> {
  const [byId, byQuery] = await Promise.all([
    Promise.all(TOP_OF_WEEK_IDS.map(id => fetchGoogleBookById(id))),
    Promise.all(TOP_OF_WEEK_QUERIES.map(q => fetchGoogleBooks(q, 1).then(r => r[0]))),
  ]);
  const specific = [...byId, ...byQuery].filter(Boolean) as Book[];
  const general = await searchBooks('popular fiction', 10);
  const merged = [...specific, ...general];
  return deduplicateBooks(merged).slice(0, 15);
}

export async function searchBooks(query: string, limit: number = 20): Promise<Book[]> {
  // Search all sources in parallel
  const [googleResults, olResults, gutendexResults] = await Promise.all([
    fetchGoogleBooks(query, limit),
    searchOpenLibrary(query, limit),
    searchGutendex(query, limit),
  ]);

  // Local Urdu books search
  const urduResults = searchUrduBooks(query, limit);

  let potterResults: Book[] = [];
  const q = query.toLowerCase();
  if (q.includes('harry') || q.includes('potter') || q.includes('jk') || q.includes('rowling')) {
    potterResults = await getPotterBooksAsBooks();
  }

  return deduplicateBooks([...urduResults, ...googleResults, ...olResults, ...gutendexResults, ...potterResults]).slice(0, limit);
}

export async function getBookById(id: string): Promise<Book | null> {
  // Check uploaded books first
  try {
    const uploaded = await getUploadedBooks();
    const match = uploaded.find(b => b.id === id);
    if (match && match.pdfUrl) {
      return {
        id: match.id, title: match.title, authors: [match.author],
        description: `Course: ${match.course}`, thumbnail: match.thumbnail || '',
        publishedDate: '', pageCount: 0, categories: [match.course],
        averageRating: 0, ratingsCount: 0,
        previewLink: match.pdfUrl, infoLink: match.pdfUrl, downloadUrl: match.pdfUrl,
      };
    }
  } catch {}

  // Urdu books from TheLibraryPK
  if (id.startsWith('urdu_')) {
    const urduBook = searchUrduBooks(id.replace('urdu_', ''), 1)[0];
    if (urduBook && urduBook.id === id) return urduBook;
    // Fallback: search by partial match
    const allUrdu = getAllUrduBooks(2138);
    return allUrdu.find(b => b.id === id) || null;
  }

  // Harry Potter books
  if (id.startsWith('hp_')) {
    const hpBooks = await getPotterBooksAsBooks();
    return hpBooks.find(b => b.id === id) || null;
  }

  // Gutendex books
  if (id.startsWith('gutendex_')) {
    const gId = parseInt(id.replace('gutendex_', ''), 10);
    if (!isNaN(gId)) {
      const results = await getGutendexByIds([gId]);
      return results[0] || null;
    }
  }

  // Google Books API — direct volume lookup
  const google = await fetchGoogleBookById(id);
  if (google) return google;

  // Open Library fallback — direct OLID lookup
  if (id.startsWith('ol_')) {
    const olid = id.replace('ol_', '');
    const olBook = await getOpenLibraryByOLID(olid);
    if (olBook) return olBook;
  }

  // Try by title (for semester books)
  const semBooks = Object.values(SEMESTER_BOOKS).flat();
  const semMatch = semBooks.find(b => b.title === id);
  if (semMatch) {
    const results = await fetchGoogleBooks(`intitle:${semMatch.title}+inauthor:${semMatch.author}`, 1);
    if (results.length > 0) return results[0];
  }

  return null;
}

export async function getBooksBySubject(subject: string, limit: number = 12): Promise<Book[]> {
  const googleResults = await fetchGoogleBooks(`subject:${subject}`, limit);
  if (googleResults.length > 0) return googleResults;

  const olResults = await searchOpenLibrary(subject, limit);
  if (olResults.length > 0) return olResults;

  const gutendexResults = await getGutendexByTopic(subject, limit);
  return gutendexResults;
}

// Category functions — Google Books → Open Library → Gutendex

export async function getPopularBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:popular+fiction', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('fiction popular', 10);
  if (ol.length > 0) return ol;
  return getGutendexPopular(10);
}

export async function getNewReleases(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:fiction&orderBy=newest', 8);
  if (google.length > 0) return google;
  return searchOpenLibrary('fiction new', 8);
}

export async function getFictionBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:fiction', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('fiction', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('fiction', 10);
}

export async function getScienceBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:science', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('science', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('science', 10);
}

export async function getUniversityBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:computers+textbooks', 10);
  if (google.length > 0) return google;
  return searchOpenLibrary('computer science textbook', 10);
}

export async function getEducationBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:education', 10);
  if (google.length > 0) return google;
  return searchOpenLibrary('education', 10);
}

export async function getProgrammingBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:computer+programming', 10);
  if (google.length > 0) return google;
  return searchOpenLibrary('programming', 10);
}

export async function getSelfHelpBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:self-help', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('self-help', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('self-help', 10);
}

export async function getUrduBooks(): Promise<Book[]> {
  // Urdu books from TheLibraryPK (local JSON data with Google Drive links)
  const localUrdu = getAllUrduBooks(20);
  if (localUrdu.length > 0) return localUrdu;

  // Fallback to live APIs
  const google = await fetchGoogleBooks('subject:urdu+literature+poetry', 10);
  if (google.length > 0) return google;
  return searchOpenLibrary('urdu literature', 10);
}

export async function getPoetryBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:poetry', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('poetry', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('poetry', 10);
}

export async function getReligionBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:religion+spirituality', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('religion', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('religion', 10);
}

export async function getBiographyBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:biography+autobiography', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('biography', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('biography', 10);
}

export async function getPoliticsBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:politics+government', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('politics', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('politics', 10);
}

export async function getPsychologyBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:psychology', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('psychology', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('psychology', 10);
}

export async function getEconomicsBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:economics', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('economics', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('economics', 10);
}

export async function getCSBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:computer+science', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('computer science', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('computer science', 10);
}

export async function getEngineeringBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:engineering', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('engineering', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('engineering', 10);
}

export async function getPhysicsBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:physics', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('physics', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('physics', 10);
}

export async function getMathematicsBooks(): Promise<Book[]> {
  const google = await fetchGoogleBooks('subject:mathematics', 10);
  if (google.length > 0) return google;
  const ol = await searchOpenLibrary('mathematics', 10);
  if (ol.length > 0) return ol;
  return getGutendexByTopic('mathematics', 10);
}

export async function getPotterBooksAsBooks(): Promise<Book[]> {
  const books = await getPotterBooks();
  return books.map(b => ({
    id: `hp_${b.number}`,
    title: b.title,
    authors: ['J.K. Rowling'],
    description: b.description || '',
    thumbnail: b.cover || '',
    publishedDate: b.releaseDate || '',
    pageCount: b.pages || 0,
    categories: ['Harry Potter', 'Fiction'],
    averageRating: 4.5,
    ratingsCount: 1000000,
    previewLink: `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(b.title)}`,
    infoLink: `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(b.title)}`,
    downloadUrl: '',
  }));
}

export async function getHarryPotterBooks(): Promise<Book[]> {
  const potter = await getPotterBooksAsBooks();
  const google = await fetchGoogleBooks('harry potter jk rowling', 5);
  return deduplicateBooks([...potter, ...google]);
}

export async function getNovelBooks(): Promise<Book[]> {
  return searchGutendex('novel', 10);
}

export async function getSemesterBooks(semester: string): Promise<Book[]> {
  const books = SEMESTER_BOOKS[semester] || [];
  const results = await Promise.all(
    books.map(b => fetchGoogleBooks(`intitle:${b.title}+inauthor:${b.author}`, 1))
  );
  return results.flat().slice(0, 10);
}

export function getSemesterBooksSync(semester: string): Book[] {
  const books = SEMESTER_BOOKS[semester] || [];
  return books.map(b => ({
    id: `sem_${b.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
    title: b.title,
    authors: [b.author],
    description: `Course: ${b.course}`,
    thumbnail: '',
    publishedDate: '',
    pageCount: 0,
    categories: [b.course],
    averageRating: 0,
    ratingsCount: 0,
    previewLink: `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(b.title + ' ' + b.author)}`,
    infoLink: `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(b.title + ' ' + b.author)}`,
    downloadUrl: '',
  }));
}

export function getAllSemesterBooks(): Book[] {
  const seen = new Set<string>();
  const all: Book[] = [];
  for (const key of Object.keys(SEMESTER_BOOKS)) {
    for (const book of SEMESTER_BOOKS[key]) {
      if (!seen.has(book.title)) {
        seen.add(book.title);
        all.push(...getSemesterBooksSync(key).filter(b => b.title === book.title));
      }
    }
  }
  return all;
}

export function getPdfUrl(identifier: string): string {
  if (identifier.startsWith('gutendex_')) {
    const gId = parseInt(identifier.replace('gutendex_', ''), 10);
    if (!isNaN(gId)) {
      return `https://www.gutenberg.org/cache/epub/${gId}/pg${gId}.pdf`;
    }
  }
  if (identifier.startsWith('ol_')) {
    return `https://openlibrary.org${identifier.replace('ol_', '/')}`;
  }
  return `https://archive.org/download/${identifier}/${identifier}.pdf`;
}

export function getBookPageUrl(identifier: string): string {
  if (identifier.startsWith('gutendex_')) {
    const gId = parseInt(identifier.replace('gutendex_', ''), 10);
    if (!isNaN(gId)) {
      return `https://www.gutenberg.org/ebooks/${gId}`;
    }
  }
  if (identifier.startsWith('ol_')) {
    return `https://openlibrary.org${identifier.replace('ol_', '/')}`;
  }
  if (identifier.startsWith('hp_')) {
    return `https://www.google.com/search?tbm=bks&q=harry+potter`;
  }
  return `https://archive.org/details/${identifier}`;
}
