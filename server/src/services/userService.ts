// CivicPulse AI - User Service
// Handles user profile CRUD operations.
// Uses Firestore when available, falls back to in-memory store.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFirebaseInitialized, getFirestore } from '../config/firebase.js';
import type { UserProfile, UserRole } from '../types.js';

// In-memory user store for demo mode
const inMemoryUsers: Map<string, UserProfile> = new Map();

// Pre-populate demo users
const DEMO_USERS: UserProfile[] = [
  {
    id: 'citizen-demo',
    name: 'Demo Citizen',
    email: 'demo@civicpulse.in',
    phone: '+91 98480 00001',
    role: 'citizen',
    ward: 'Ward 21',
    locality: 'MVP Colony',
    preferredLanguage: 'en',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-demo',
    name: 'Demo Admin',
    email: 'admin@civicpulse.in',
    phone: '+91 98480 00002',
    role: 'admin',
    ward: 'All Wards',
    locality: 'GVMC HQ',
    preferredLanguage: 'en',
    createdAt: new Date().toISOString()
  },
  {
    id: 'contractor-demo',
    name: 'Demo Contractor',
    email: 'contractor@civicpulse.in',
    phone: '+91 98480 00003',
    role: 'contractor',
    locality: 'Visakhapatnam',
    preferredLanguage: 'en',
    createdAt: new Date().toISOString(),
    contractorId: 'cont-1'
  }
];

for (const user of DEMO_USERS) {
  inMemoryUsers.set(user.id, user);
}

const USERS_COLLECTION = 'users';

/**
 * Get a user profile by UID.
 */
export const getUserByUid = async (uid: string): Promise<UserProfile | null> => {
  if (isFirebaseInitialized()) {
    const db = getFirestore();
    if (db) {
      try {
        const doc = await db.collection(USERS_COLLECTION).doc(uid).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() } as UserProfile;
        }
        return null;
      } catch (err) {
        console.error('[UserService] Firestore read error:', err);
      }
    }
  }
  return inMemoryUsers.get(uid) || null;
};

/**
 * Create a new user profile.
 * Role is determined server-side, never from client input.
 */
export const createUser = async (
  uid: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    ward?: string;
    locality?: string;
    preferredLanguage?: 'en' | 'te';
  },
  role: UserRole = 'citizen'
): Promise<UserProfile> => {
  const now = new Date().toISOString();

  const userProfile: UserProfile = {
    id: uid,
    name: data.name,
    email: data.email || '',
    phone: data.phone,
    role,
    ward: data.ward,
    locality: data.locality,
    preferredLanguage: data.preferredLanguage || 'en',
    createdAt: now
  };

  if (isFirebaseInitialized()) {
    const db = getFirestore();
    if (db) {
      try {
        const { id: _id, ...profileData } = userProfile;
        await db.collection(USERS_COLLECTION).doc(uid).set(profileData);
        console.log(`[UserService] User ${uid} created in Firestore.`);
        return userProfile;
      } catch (err) {
        console.error('[UserService] Firestore write error:', err);
      }
    }
  }

  inMemoryUsers.set(uid, userProfile);
  console.log(`[UserService] User ${uid} created in memory (demo mode).`);
  return userProfile;
};

/**
 * Update an existing user profile.
 * Role changes are NOT allowed.
 */
export const updateUser = async (
  uid: string,
  updates: {
    name?: string;
    phone?: string;
    ward?: string;
    locality?: string;
    preferredLanguage?: 'en' | 'te';
  }
): Promise<UserProfile | null> => {
  const safeUpdates: any = { ...updates };
  delete safeUpdates.role; // Never allow role changes

  if (isFirebaseInitialized()) {
    const db = getFirestore();
    if (db) {
      try {
        const docRef = db.collection(USERS_COLLECTION).doc(uid);
        await docRef.update(safeUpdates);
        const updated = await docRef.get();
        if (updated.exists) {
          return { id: updated.id, ...updated.data() } as UserProfile;
        }
      } catch (err) {
        console.error('[UserService] Firestore update error:', err);
      }
    }
  }

  const existing = inMemoryUsers.get(uid);
  if (!existing) return null;

  const updated: UserProfile = {
    ...existing,
    ...(updates.name && { name: updates.name }),
    ...(updates.phone && { phone: updates.phone }),
    ...(updates.ward && { ward: updates.ward }),
    ...(updates.locality && { locality: updates.locality }),
    ...(updates.preferredLanguage && { preferredLanguage: updates.preferredLanguage }),
  };

  inMemoryUsers.set(uid, updated);
  console.log(`[UserService] User ${uid} updated in memory (demo mode).`);
  return updated;
};

/**
 * Get all users (admin only).
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  if (isFirebaseInitialized()) {
    const db = getFirestore();
    if (db) {
      try {
        const snapshot = await db.collection(USERS_COLLECTION).get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as UserProfile));
      } catch (err) {
        console.error('[UserService] Firestore list error:', err);
      }
    }
  }
  return Array.from(inMemoryUsers.values());
};
