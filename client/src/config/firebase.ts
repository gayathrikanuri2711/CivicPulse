// CivicPulse AI — Firebase Web SDK Initialization
// Initializes Firebase App and Auth for the client.
// Supports Phone Authentication with reCAPTCHA.

import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import type {
  Auth,
  ConfirmationResult,
  User as FirebaseUser,
  ApplicationVerifier,
} from 'firebase/auth';

// ─── Environment Variable Access ──────────────────────────────────────────────
// @ts-ignore — Vite injects import.meta.env at build time
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

// ─── Firebase Configuration ──────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             env.VITE_FIREBASE_APP_ID             || '',
};

// ─── Configuration Validation ────────────────────────────────────────────────

export interface FirebaseConfigStatus {
  isComplete: boolean;
  missingVars: string[];
}

export const checkFirebaseConfig = (): FirebaseConfigStatus => {
  // Only apiKey and projectId are strictly required for Auth to work
  const required: { key: string; envVar: string }[] = [
    { key: 'apiKey',     envVar: 'VITE_FIREBASE_API_KEY' },
    { key: 'projectId',  envVar: 'VITE_FIREBASE_PROJECT_ID' },
  ];

  const missingVars = required
    .filter(({ key }) => !firebaseConfig[key as keyof typeof firebaseConfig])
    .map(({ envVar }) => envVar);

  return {
    isComplete: missingVars.length === 0,
    missingVars,
  };
};

// ─── Firebase App Initialization ─────────────────────────────────────────────

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

const { isComplete, missingVars } = checkFirebaseConfig();

if (isComplete) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Set language to user's browser language (helps reCAPTCHA)
    auth.useDeviceLanguage();

    if (env.DEV) {
      console.log('[Firebase] Initialized for project:', firebaseConfig.projectId);
    }
  } catch (err) {
    console.error('[Firebase] Initialization failed:', err);
  }
} else {
  console.warn('[Firebase] Missing environment variables:', missingVars.join(', '));
  console.warn('[Firebase] Set these in client/.env from Firebase Console');
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export const firebaseApp = app;
export const firebaseAuth = auth;
export const isFirebaseReady = (): boolean => app !== null && auth !== null;

export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
};

export type { FirebaseApp, Auth, ConfirmationResult, FirebaseUser, ApplicationVerifier };
