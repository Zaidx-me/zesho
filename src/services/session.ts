import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_UID: 'zesho_user_uid',
  USER_EMAIL: 'zesho_user_email',
  USER_NAME: 'zesho_user_name',
  SKIPPED: 'zesho_skipped',
};

export async function saveSession(uid: string, email?: string | null, name?: string | null) {
  try {
    await AsyncStorage.setItem(KEYS.USER_UID, uid);
    if (email) await AsyncStorage.setItem(KEYS.USER_EMAIL, email);
    if (name) await AsyncStorage.setItem(KEYS.USER_NAME, name);
  } catch {}
}

export async function clearSession() {
  try {
    await AsyncStorage.multiRemove([KEYS.USER_UID, KEYS.USER_EMAIL, KEYS.USER_NAME]);
  } catch {}
}

export async function getSavedUid(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.USER_UID);
  } catch {
    return null;
  }
}

export async function saveSkipped(skipped: boolean) {
  try {
    await AsyncStorage.setItem(KEYS.SKIPPED, String(skipped));
  } catch {}
}

export async function getSkipped(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(KEYS.SKIPPED);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function clearAllLocalData() {
  const keys = await AsyncStorage.getAllKeys();
  const localKeys = keys.filter(k => k.startsWith('local_') || k.startsWith('zesho_'));
  await AsyncStorage.multiRemove(localKeys);
}
