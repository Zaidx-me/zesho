export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  publishedDate: string;
  pageCount: number;
  categories: string[];
  averageRating: number;
  ratingsCount: number;
  previewLink: string;
  infoLink: string;
  downloadUrl?: string;
  solutionUrl?: string;
}

export interface UserBook {
  id: string;
  bookId: string;
  userId: string;
  title: string;
  authors: string[];
  thumbnail: string;
  addedAt: number;
  status: 'want_to_read' | 'reading' | 'finished';
  progress: number;
  rating: number;
}

export interface Note {
  id: string;
  bookId: string;
  userId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: number;
  booksRead: number;
  booksReading: number;
  booksWantToRead: number;
}
