import { getBookRequests, updateBookRequest } from './localDb';

const ADMIN_EMAILS = ['zesho.support@gmail.com'];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function getPendingRequests() {
  const requests = await getBookRequests();
  return requests.filter(r => r.status === 'pending');
}

export async function getAllRequests() {
  return getBookRequests();
}

export async function fulfillRequest(requestId: string, note?: string) {
  await updateBookRequest(requestId, { status: 'fulfilled', adminNote: note });
}

export async function rejectRequest(requestId: string, note?: string) {
  await updateBookRequest(requestId, { status: 'rejected', adminNote: note });
}
