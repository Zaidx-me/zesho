import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC43tafb5N_wN96Wwru0Md3y6pWb78vlmU",
  authDomain: "zesho-app.firebaseapp.com",
  projectId: "zesho-app",
  storageBucket: "zesho-app.firebasestorage.app",
  messagingSenderId: "933760260325",
  appId: "1:933760260325:android:408d5063d4359a03899c0c"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
