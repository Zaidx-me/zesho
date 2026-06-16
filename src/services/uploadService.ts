import * as DocumentPicker from 'expo-document-picker';
import { uploadPdfToCloudinary } from './cloudinary';
import { saveUploadedBook, getUploadedBooks, getUploadedBooksBySemester } from './localDb';
import { UploadedBook } from './localDb';

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

export { UploadedBook };

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
    return await uploadPdfToCloudinary(uri, fileName, onProgress);
  } catch (error: any) {
    console.error('Upload PDF error:', error?.message || error);
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
    const book: UploadedBook = {
      id: `uploaded_${Date.now()}`,
      title: data.title,
      author: data.author,
      semester: data.semester,
      course: data.course,
      pdfUrl: data.pdfUrl,
      createdAt: Date.now(),
    };
    await saveUploadedBook(book);
    return book.id;
  } catch (error) {
    console.error('Error saving book metadata:', error);
    return null;
  }
}

export { getUploadedBooks, getUploadedBooksBySemester };
