import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { storage, db } from './firebase';
import { withTimeout } from './firestoreUtils';

export function extractDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function buildDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function buildDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export interface UploadedBook {
  id: string;
  title: string;
  author: string;
  semester: string;
  course: string;
  pdfUrl: string;
  createdAt: number;
  thumbnail?: string;
}

export async function pickPdf(): Promise<DocumentPicker.DocumentPickerResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return null;
    return result;
  } catch (error) {
    console.error('Error picking PDF:', error);
    return null;
  }
}

export async function uploadPdf(
  uri: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const timestamp = Date.now();
    const storageRef = ref(storage, `uploaded_books/${timestamp}_${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(null);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return null;
  }
}

export async function saveBookMetadata(data: {
  title: string;
  author: string;
  semester: string;
  course: string;
  pdfUrl: string;
  userId?: string;
}): Promise<string | null> {
  try {
    const docRef = await withTimeout(addDoc(collection(db, 'uploaded_books'), {
      ...data,
      createdAt: Date.now(),
    }));
    return docRef.id;
  } catch (error) {
    console.error('Error saving book metadata:', error);
    return null;
  }
}

export async function getUploadedBooks(): Promise<UploadedBook[]> {
  try {
    const q = query(
      collection(db, 'uploaded_books'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await withTimeout(getDocs(q));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as UploadedBook));
  } catch (error) {
    console.error('Error fetching uploaded books:', error);
    return [];
  }
}

export async function getUploadedBooksBySemester(semester: string): Promise<UploadedBook[]> {
  try {
    const q = query(
      collection(db, 'uploaded_books'),
      where('semester', '==', semester),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await withTimeout(getDocs(q));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as UploadedBook));
  } catch (error) {
    console.error('Error fetching semester books:', error);
    return [];
  }
}
