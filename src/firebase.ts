import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAdObMeqW5InTnBRUDTMkUxDYdMrxVqPcg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cbt-sman-1-batu.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cbt-sman-1-batu',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cbt-sman-1-batu.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '120403078781',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:120403078781:web:8a4e9e89c45024521ecb14',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PTL9WPNV8J',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

export const app = getApps().length > 0 
  ? getApp() 
  : (isFirebaseConfigured() ? initializeApp(firebaseConfig) : null);

export const db: Firestore | null = app ? getFirestore(app) : null;

// Initialize analytics safely if in browser
if (typeof window !== 'undefined' && app) {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics error in non-standard environments
  });
}
