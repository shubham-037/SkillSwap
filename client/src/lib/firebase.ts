import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Only initialize Firebase on the client side to prevent SSR errors
if (typeof window !== 'undefined') {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    // Use initializeFirestore for better control over settings if needed
    db = getApps().length === 0 ? initializeFirestore(app, {}) : getFirestore(app);
    console.log('Firebase initialized successfully. Project:', firebaseConfig.projectId);
  } catch (err) {
    console.error('Core Firebase initialization error:', err);
  }
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    if (typeof window === 'undefined') {
      throw new Error('Firebase auth is not available during SSR');
    }
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
  }
  return auth;
}

function getFirestoreDb(): Firestore {
  if (!db) {
    if (typeof window === 'undefined') {
      throw new Error('Firestore is not available during SSR');
    }
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  }
  return db;
}

export {
  getFirebaseAuth,
  getFirestoreDb,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
};
export type { User };
