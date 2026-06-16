import { Book } from '../types';
import { getAllUrduBooks, searchUrduBooks } from './urduBooks';
import { getAllPdfBooks, searchPdfBooks, getPdfBookById } from './pdfBooksFree';

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

const TOP_OF_WEEK_IDS = [
  'yK4HBgAAQBAJ',
  'h2cPAAAAQBAJ',
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
  const googleResults = await fetchGoogleBooks(query, limit);
  const urduResults = searchUrduBooks(query, limit);
  const pdfResults = searchPdfBooks(query, limit);
  return deduplicateBooks([...urduResults, ...pdfResults, ...googleResults]).slice(0, limit);
}

export async function getBookById(id: string): Promise<Book | null> {
  if (id.startsWith('urdu_')) {
    const urduBook = searchUrduBooks(id.replace('urdu_', ''), 1)[0];
    if (urduBook && urduBook.id === id) return urduBook;
    const allUrdu = getAllUrduBooks(2138);
    return allUrdu.find(b => b.id === id) || null;
  }

  if (id.startsWith('pdf_')) {
    const pdf = getPdfBookById(id);
    if (pdf) return pdf;
    const allPdf = getAllPdfBooks();
    return allPdf.find(b => b.id === id) || null;
  }

  const google = await fetchGoogleBookById(id);
  if (google) return google;

  const semBooks = Object.values(SEMESTER_BOOKS).flat();
  const semMatch = semBooks.find(b => b.title === id);
  if (semMatch) {
    const results = await fetchGoogleBooks(`intitle:${semMatch.title}+inauthor:${semMatch.author}`, 1);
    if (results.length > 0) return results[0];
  }

  return null;
}

export async function getBooksBySubject(subject: string, limit: number = 12): Promise<Book[]> {
  return fetchGoogleBooks(`subject:${subject}`, limit);
}

export async function getPopularBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:popular+fiction', 10);
}

export async function getNewReleases(): Promise<Book[]> {
  return fetchGoogleBooks('subject:fiction&orderBy=newest', 8);
}

export async function getFictionBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:fiction', 10);
}

export async function getScienceBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:science', 10);
}

export async function getUniversityBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:computers+textbooks', 10);
}

export async function getEducationBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:education', 10);
}

export async function getProgrammingBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:computer+programming', 10);
}

export async function getSelfHelpBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:self-help', 10);
}

export async function getUrduBooks(): Promise<Book[]> {
  const localUrdu = getAllUrduBooks(20);
  const localPdf = getAllPdfBooks(20);
  const merged = deduplicateBooks([...localUrdu, ...localPdf]);
  if (merged.length > 0) return merged.slice(0, 20);
  return fetchGoogleBooks('subject:urdu+literature+poetry', 10);
}

export async function getPoetryBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:poetry', 10);
}

export async function getReligionBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:religion+spirituality', 10);
}

export async function getBiographyBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:biography+autobiography', 10);
}

export async function getPoliticsBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:politics+government', 10);
}

export async function getPsychologyBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:psychology', 10);
}

export async function getEconomicsBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:economics', 10);
}

export async function getCSBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:computer+science', 10);
}

export async function getEngineeringBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:engineering', 10);
}

export async function getPhysicsBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:physics', 10);
}

export async function getMathematicsBooks(): Promise<Book[]> {
  return fetchGoogleBooks('subject:mathematics', 10);
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
