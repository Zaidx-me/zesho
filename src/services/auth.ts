import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from './firebase';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = '991431752296-4t0cgi8u57093hcvfa381qt05tgtnd15.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '933760260325-dvnt0fn63h775p55p7bhs1fug3929m7e.apps.googleusercontent.com';

// Google OAuth redirect URI for Android:
//   com.googleusercontent.apps.991431752296-4t0cgi8u57093hcvfa381qt05tgtnd15:/oauthredirect
// This is auto-registered when you create an Android OAuth client ID in Google Cloud Console.
// Email/password auth does not need any redirect URI config.

// --- Google Auth ---
export function useGoogleAuth() {
  const redirectUri = Platform.OS === 'android'
    ? `com.googleusercontent.apps.${ANDROID_CLIENT_ID}:/oauthredirect`
    : undefined;
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    scopes: ['profile', 'email'],
    redirectUri,
  });
  return { request, response, promptAsync };
}

export async function signInWithGoogleIdToken(idToken: string): Promise<User | null> {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error: any) {
    console.error('Google sign in error:', error?.message || error);
    return null;
  }
}

// --- Email/Password Auth ---
export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error('Email sign in error:', error?.code, error?.message);
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<User | null> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error: any) {
    console.error('Email sign up error:', error?.code, error?.message);
    throw error;
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error?.code, error?.message);
    throw error;
  }
}

// --- Common ---
export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
