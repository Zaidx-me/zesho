const TIMEOUT = 3000;

export function withTimeout<T>(promise: Promise<T>, ms: number = TIMEOUT): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore timeout after ${ms}ms`)), ms)
    ),
  ]);
}
