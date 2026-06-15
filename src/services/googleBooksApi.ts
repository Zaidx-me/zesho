import axios from 'axios';

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';

export const searchBooks = async (query: string, maxResults = 20, startIndex = 0) => {
  try {
    if (!query || query.trim() === '') throw new Error('Search query is required');
    const response = await axios.get(`${GOOGLE_BOOKS_API_BASE}/volumes`, {
      params: { q: query, maxResults: Math.min(maxResults, 40), startIndex, projection: 'full', printType: 'books', orderBy: 'relevance' },
      timeout: 10000,
    });
    return { success: true, data: response.data, totalItems: response.data.totalItems || 0, books: response.data.items || [] };
  } catch (error: any) {
    console.error('Error searching books:', error?.message);
    return { success: false, error: error.message || 'Failed to search books', data: null, totalItems: 0, books: [] };
  }
};

export const getBookById = async (bookId: string) => {
  try {
    if (!bookId) throw new Error('Book ID is required');
    const response = await axios.get(`${GOOGLE_BOOKS_API_BASE}/volumes/${bookId}`, { timeout: 10000 });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error fetching book details:', error?.message);
    return { success: false, error: error.message || 'Failed to fetch book details', data: null };
  }
};

export const formatBookData = (book: any) => {
  if (!book || !book.volumeInfo) return null;
  const { volumeInfo } = book;
  return {
    id: book.id,
    title: volumeInfo.title || 'Unknown Title',
    authors: volumeInfo.authors || ['Unknown Author'],
    publisher: volumeInfo.publisher || 'Unknown Publisher',
    publishedDate: volumeInfo.publishedDate || 'Unknown Date',
    description: volumeInfo.description || 'No description available',
    pageCount: volumeInfo.pageCount || 0,
    categories: volumeInfo.categories || [],
    averageRating: volumeInfo.averageRating || 0,
    ratingsCount: volumeInfo.ratingsCount || 0,
    language: volumeInfo.language || 'en',
    previewLink: volumeInfo.previewLink || '',
    infoLink: volumeInfo.infoLink || '',
    downloadUrl: (book as any).downloadUrl || '',
    thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '',
  };
};

export const PUCIT_FCIT_BOOKS = [
  { title: "Model for Writers", author: "Rosa Mairena", downloadUrl: "https://drive.google.com/file/d/10d9IICRyUxZkDT0mvp8C7A-BaPmRlXLT/view" },
  { title: "Elementary Linear Algebra", author: "Ron Larson", downloadUrl: "https://drive.google.com/file/d/1P9NqCEDALAavCs876RKnMi_Q7L3wBSa7/view?usp=sharing", solutionUrl: "https://drive.google.com/file/d/1h_UMQ2nlkUK09889p19TUKpeSbLq5im1/view?usp=sharing" },
  { title: "Thomas Calculus", author: "Joel Hass", downloadUrl: "https://drive.google.com/file/d/10fRNRMM5IFa4sQmr3QJua8Z0uiFIdK-_/view?usp=drive_link", solutionUrl: "https://drive.google.com/file/d/10qeYnjtdn56EOo4A1jwGANTStHtkfuOf/view?usp=drive_link" },
  { title: "C++ How to Program", author: "Paul Deitel", downloadUrl: "https://drive.google.com/file/d/1m6R8rPdINWeoxmArneybliYGzinNVC0a/view?usp=sharing" },
  { title: "Islamiat Notes English", author: "PUCIT Faculty", downloadUrl: "https://drive.google.com/file/d/17GepoinEGBWnBnr9M5CW2uL71eXeXY6D/view?usp=sharing" },
  { title: "Ideology and Constitution of Pakistan Notes", author: "PUCIT Faculty", downloadUrl: "https://drive.google.com/file/d/1eym-yFnEoCAytodXkBLyXoS6BdjLDs5J/view?usp=sharing" },
  { title: "Fundamentals of Physics", author: "David Halliday", downloadUrl: "https://drive.google.com/file/d/1i7UTEQHQR62BMYpcZ5weV9hesbdU2i51/view?usp=sharing", solutionUrl: "https://drive.google.com/file/d/1iR_TrWQHCP_gbmrGnW-4uqtc65jfoV9h/view?usp=sharing" },
  { title: "Logic and Computer Design Fundamentals", author: "M. Morris Mano", downloadUrl: "https://drive.google.com/file/d/10EAHqo0t26_f7wCjZZX6XUcBMMKGRUDv/view?usp=sharing", solutionUrl: "https://drive.google.com/file/d/12NqepSEST4NqVZR6g-EfSgXzP_I0QFsu/view?usp=sharing" },
  { title: "Differential Equations", author: "Dennis Zill", downloadUrl: "https://drive.google.com/file/d/1ZFsiL8b0rGiM4cjc1dWWQneIxCUHTZ6y/view?usp=sharing" },
  { title: "Discrete Mathematics and Its Applications", author: "Kenneth Rosen", downloadUrl: "https://drive.google.com/file/d/1pAbnBfh0mMD8mpEIA2kZzA7elPr3GWDT/view?usp=sharing", solutionUrl: "https://drive.google.com/file/d/12ML3MYjFGfSfH1xSKldilXuG5Rzavh2T/view?usp=sharing" },
  { title: "Operating System Concepts", author: "Abraham Silberschatz", downloadUrl: "https://drive.google.com/file/d/1eZG3sgEhmU-IuZ7h94IuV9JQbAAXuR_v/view?usp=sharing" },
  { title: "Probability and Statistics for Engineers", author: "Ronald Walpole", downloadUrl: "https://drive.google.com/file/d/1ldpaMGmjJLo4EXPzb6pW57n0Rr6X2cro/view?usp=sharing", solutionUrl: "https://drive.google.com/file/d/1-v4LZLySB8t-MHtoCrQBQgxOTYsDfHCY/view?usp=sharing" },
];
