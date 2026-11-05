// CivicPulse AI - Firebase Admin SDK Configuration
// Initializes Firebase Admin using environment variables.
// Uses fully dynamic imports — works even without firebase-admin installed.

/* eslint-disable @typescript-eslint/no-explicit-any */

let adminModule: any = null;
let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK.
 * Uses FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY env vars.
 */
export const initializeFirebase = async (): Promise<void> => {
  try {
    const mod = await (Function('return import("firebase-admin")')() as Promise<any>);
    adminModule = mod.default || mod;
  } catch {
    console.warn('[Firebase] firebase-admin package not installed. Running in DEMO MODE.');
    console.warn('[Firebase] Install with: npm install firebase-admin');
    return;
  }

  if (adminModule.apps && adminModule.apps.length > 0) {
    firebaseInitialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    try {
      adminModule.initializeApp({
        credential: adminModule.credential.cert({ projectId, clientEmail, privateKey }),
      });
      firebaseInitialized = true;
      console.log(`[Firebase] Admin SDK initialized. Project: ${projectId}`);
    } catch (err) {
      console.error('[Firebase] Failed to initialize with service account:', err);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      adminModule.initializeApp({
        credential: adminModule.credential.applicationDefault(),
      });
      firebaseInitialized = true;
      console.log('[Firebase] Admin SDK initialized with application default credentials.');
    } catch (err) {
      console.error('[Firebase] Failed to initialize with default credentials:', err);
    }
  } else {
    console.warn('[Firebase] No credentials configured. Running in DEMO MODE.');
    console.warn('[Firebase] Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  }
};

/** Returns whether Firebase Admin SDK has been initialized. */
export const isFirebaseInitialized = (): boolean => firebaseInitialized;

/** Get Firestore instance (or null). */
export const getFirestore = (): any | null => {
  if (!firebaseInitialized || !adminModule) return null;
  return adminModule.firestore();
};

/** Get Firebase Auth instance (or null). */
export const getAuth = (): any | null => {
  if (!firebaseInitialized || !adminModule) return null;
  return adminModule.auth();
};
