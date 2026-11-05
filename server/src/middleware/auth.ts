// CivicPulse AI - Authentication Middleware
// Supports Firebase ID token verification when configured,
// otherwise falls back to demo-mode base64 JSON tokens.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response, NextFunction } from 'express';
import { isFirebaseInitialized, getAuth } from '../config/firebase.js';

/** Shape of the authenticated user attached to req.authUser */
export interface AuthUser {
  uid: string;
  role: 'citizen' | 'admin' | 'contractor';
  email?: string;
  phone?: string;
}

// Extend Express Request to carry auth info
declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

/** Default demo user when no token is provided */
const DEFAULT_DEMO_USER: AuthUser = {
  uid: 'citizen-demo',
  role: 'citizen',
  email: 'demo@civicpulse.in'
};

/**
 * Decode a base64-encoded demo JSON token.
 * Format: base64(JSON.stringify({ uid, role, email?, phone? }))
 */
const decodeDemoToken = (token: string): AuthUser | null => {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.uid === 'string') {
      return {
        uid: parsed.uid,
        role: parsed.role || 'citizen',
        email: parsed.email,
        phone: parsed.phone
      };
    }
  } catch {
    // Not a valid base64 JSON token
  }
  return null;
};

/**
 * Verify a Firebase ID token.
 */
const verifyFirebaseToken = async (token: string): Promise<AuthUser | null> => {
  if (!isFirebaseInitialized()) return null;

  try {
    const auth = getAuth();
    if (!auth) return null;

    const decoded = await auth.verifyIdToken(token);
    // Role comes from custom claims — NEVER from the client
    const role = (decoded.role as AuthUser['role']) || 'citizen';

    return {
      uid: decoded.uid,
      role,
      email: decoded.email,
      phone: decoded.phone_number
    };
  } catch (err) {
    console.warn('[Auth] Firebase token verification failed:', err);
    return null;
  }
};

/**
 * Authentication middleware — populates req.authUser.
 * Firebase mode: verifies Bearer token. Demo mode: accepts base64 JSON tokens.
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  // No Authorization header → default demo user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.authUser = DEFAULT_DEMO_USER;
    return next();
  }

  const token = authHeader.slice(7);

  // Firebase live verification
  if (isFirebaseInitialized()) {
    const firebaseUser = await verifyFirebaseToken(token);
    if (firebaseUser) {
      req.authUser = firebaseUser;
      return next();
    }
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
    return;
  }

  // Demo mode: base64 JSON token
  const demoUser = decodeDemoToken(token);
  if (demoUser) {
    req.authUser = demoUser;
    return next();
  }

  // Unrecognised token in demo mode → allow with default
  req.authUser = DEFAULT_DEMO_USER;
  next();
};

/**
 * Strict auth middleware — rejects unauthenticated requests
 * (except in demo mode where it allows through with default user).
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (!isFirebaseInitialized()) {
      req.authUser = DEFAULT_DEMO_USER;
      return next();
    }
    res.status(401).json({ success: false, error: 'Authorization header with Bearer token is required' });
    return;
  }

  return authMiddleware(req, res, next);
};

/** Extract the authenticated user from a request. */
export const extractUser = (req: Request): AuthUser => {
  return req.authUser || DEFAULT_DEMO_USER;
};
