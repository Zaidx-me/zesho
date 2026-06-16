import { saveBookRequest, getBookRequests, updateBookRequest, deleteBookRequest, RequestedBook } from './localDb';

export type { RequestedBook };

export async function requestBook(data: {
  title: string;
  author: string;
  reason?: string;
  requestedBy: string | null;
  requestedByName?: string;
}): Promise<string> {
  const request: RequestedBook = {
    id: `request_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: data.title.trim(),
    author: data.author.trim(),
    reason: data.reason?.trim(),
    requestedBy: data.requestedBy,
    requestedByName: data.requestedByName,
    createdAt: Date.now(),
    status: 'pending',
  };
  await saveBookRequest(request);
  return request.id;
}

export { getBookRequests, updateBookRequest, deleteBookRequest };
