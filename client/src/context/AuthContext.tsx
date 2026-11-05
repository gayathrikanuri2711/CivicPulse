import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  firebaseAuth,
  isFirebaseReady,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
} from '../config/firebase';
import type { ConfirmationResult, FirebaseUser } from '../config/firebase';

// ─── Indian Phone Validation ───────────────────────────────────────────────
export const normalizeIndianPhone = (raw: string): string | null => {
  const digits = raw.replace(/[\s\-\(\)\.]/g, '');
  const stripped = digits.startsWith('+') ? digits.slice(1) : digits;
  let tenDigits = '';

  if (/^91[6-9]\d{9}$/.test(stripped)) {
    tenDigits = stripped.slice(2);
  } else if (/^0[6-9]\d{9}$/.test(stripped)) {
    tenDigits = stripped.slice(1);
  } else if (/^[6-9]\d{9}$/.test(stripped)) {
    tenDigits = stripped;
  }

  if (tenDigits.length !== 10) return null;
  return `+91${tenDigits}`;
};

export const isValidIndianPhone = (raw: string): boolean => normalizeIndianPhone(raw) !== null;

// ─── Fixed Role Phone Numbers ───────────────────────────────────────────
const ADMIN_PHONES = new Set([
  '+918912746001',
  '+918912746002',
  '+919000000001',
]);

const CONTRACTOR_PHONES = new Set([
  '+919848012345',
  '+919440156789',
  '+919989023456',
]);

// ─── Registered Users (localStorage) ────────────────────────────────────
interface RegisteredUser {
  phone: string;
  name: string;
  role: UserRole;
  language: 'en' | 'te';
  registeredAt: string;
}

const PRESET_USERS: RegisteredUser[] = [
  { phone: '+919848098765', name: 'Praveen Varma', role: 'citizen', language: 'en', registeredAt: '2024-01-15' },
  { phone: '+918912746001', name: 'Dr. Lakshmi Prasad', role: 'admin', language: 'en', registeredAt: '2023-05-10' },
  { phone: '+919848012345', name: 'K. Srinivasa Rao', role: 'contractor', language: 'en', registeredAt: '2023-09-01' },
  { phone: '+919441122334', name: 'K. Sanyasi Rao', role: 'citizen', language: 'te', registeredAt: '2024-03-20' },
  { phone: '+919849244556', name: 'B. Anuradha', role: 'citizen', language: 'en', registeredAt: '2024-06-10' },
];

const STORAGE_USERS_KEY = 'civicpulse_registered_users';
const STORAGE_SESSION_KEY = 'civicpulse_user';

function loadRegisteredUsers(): RegisteredUser[] {
  const saved = localStorage.getItem(STORAGE_USERS_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch { /* fall through */ }
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(PRESET_USERS));
  return [...PRESET_USERS];
}

function saveRegisteredUsers(users: RegisteredUser[]) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// ─── OTP Auth State ─────────────────────────────────────────────────────
export type OtpStep = 'phone' | 'otp' | 'done';

// ─── Auth Context Type ──────────────────────────────────────────────────
interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  /** Firebase mode: true when Firebase Auth is configured and active */
  isFirebaseMode: boolean;
  /** Current OTP step */
  otpStep: OtpStep;
  /** Send OTP to phone number */
  sendOtp: (phone: string) => Promise<void>;
  /** Verify OTP code */
  verifyOtp: (code: string) => Promise<void>;
  /** Resend OTP */
  resendOtp: () => Promise<void>;
  /** Complete login/register after OTP verification */
  completeAuth: (name: string, requestedRole: UserRole, language: 'en' | 'te', isRegister: boolean) => Promise<void>;
  /** Demo login (bypasses OTP when Firebase not configured) */
  login: (phone: string, role: UserRole) => Promise<void>;
  /** Demo register (bypasses OTP when Firebase not configured) */
  register: (phone: string, name: string, role: UserRole, language: 'en' | 'te') => Promise<void>;
  logout: () => void;
  /** Reset OTP flow back to phone step */
  resetOtpFlow: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isPhoneRegistered: (phone: string) => boolean;
  getRegisteredRole: (phone: string) => UserRole | null;
  isAdminPhone: (phone: string) => boolean;
  isContractorPhone: (phone: string) => boolean;
  getAllowedRoles: (phone: string) => UserRole[];
  /** The phone number currently in the OTP flow */
  otpPhone: string;
  /** Loading state for OTP operations */
  otpLoading: boolean;
  /** Error from OTP operations */
  otpError: string;
  /** Seconds remaining before resend is allowed */
  resendCooldown: number;
  /** Get Firebase ID token for API calls */
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(loadRegisteredUsers);
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile;
        const norm = parsed.phone ? normalizeIndianPhone(parsed.phone) : null;
        if (norm) {
          const users = loadRegisteredUsers();
          const found = users.find(u => u.phone === norm);
          if (found) return parsed;
        }
        localStorage.removeItem(STORAGE_SESSION_KEY);
      } catch { /* skip */ }
    }
    return null;
  });

  // OTP state
  const [otpStep, setOtpStep] = useState<OtpStep>('phone');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const firebaseMode = isFirebaseReady();
  const role: UserRole = user?.role || 'citizen';

  // ─── Persist session ──────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  }, [user]);

  useEffect(() => {
    saveRegisteredUsers(registeredUsers);
  }, [registeredUsers]);

  // ─── Firebase Auth State Listener ─────────────────────────────────────
  useEffect(() => {
    if (!firebaseMode || !firebaseAuth) return;

    const unsub = onAuthStateChanged(firebaseAuth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        // Firebase user signed out
        // Don't auto-clear app user here — let logout() handle it
      }
    });

    return () => unsub();
  }, [firebaseMode]);

  // ─── Cooldown timer cleanup ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  // ─── reCAPTCHA Setup ──────────────────────────────────────────────────
  const setupRecaptcha = useCallback(() => {
    if (!firebaseAuth) return;

    // Clean up existing verifier
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch { /* ignore */ }
      recaptchaVerifierRef.current = null;
    }

    // Ensure the container exists
    let container = document.getElementById('recaptcha-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'recaptcha-container';
      document.body.appendChild(container);
    }
    container.innerHTML = '';

    recaptchaVerifierRef.current = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setOtpError('reCAPTCHA expired. Please try again.');
      },
    });
  }, []);

  // ─── Start Cooldown Timer ─────────────────────────────────────────────
  const startCooldown = useCallback((seconds: number) => {
    setResendCooldown(seconds);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ─── Send OTP ─────────────────────────────────────────────────────────
  const sendOtp = useCallback(async (phone: string) => {
    const norm = normalizeIndianPhone(phone);
    if (!norm) throw new Error('Invalid Indian phone number.');
    if (!firebaseAuth) throw new Error('Firebase not initialized.');

    setOtpLoading(true);
    setOtpError('');
    setOtpPhone(norm);

    try {
      setupRecaptcha();
      const verifier = recaptchaVerifierRef.current;
      if (!verifier) throw new Error('reCAPTCHA not ready. Please refresh the page.');

      const result = await signInWithPhoneNumber(firebaseAuth, norm, verifier);
      setConfirmationResult(result);
      setOtpStep('otp');
      startCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP.';
      // Translate common Firebase errors
      if (msg.includes('too-many-requests')) {
        setOtpError('Too many attempts. Please wait a few minutes and try again.');
      } else if (msg.includes('invalid-phone-number')) {
        setOtpError('Invalid phone number format. Use +91XXXXXXXXXX.');
      } else if (msg.includes('quota-exceeded')) {
        setOtpError('SMS quota exceeded. Please try again later or use demo access.');
      } else if (msg.includes('network-request-failed')) {
        setOtpError('Network error. Check your internet connection.');
      } else if (msg.includes('app-not-authorized')) {
        setOtpError('Firebase Phone Auth not enabled. Enable it in Firebase Console → Authentication → Phone.');
      } else {
        setOtpError(msg);
      }
      // Reset reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch { /* ignore */ }
        recaptchaVerifierRef.current = null;
      }
      throw new Error(msg);
    } finally {
      setOtpLoading(false);
    }
  }, [setupRecaptcha, startCooldown]);

  // ─── Verify OTP ───────────────────────────────────────────────────────
  const verifyOtp = useCallback(async (code: string) => {
    if (!confirmationResult) throw new Error('No OTP session. Please request a new code.');
    if (!code || code.length !== 6) throw new Error('Please enter a 6-digit OTP code.');

    setOtpLoading(true);
    setOtpError('');

    try {
      const result = await confirmationResult.confirm(code);
      setFirebaseUser(result.user);

      // Store Firebase ID token for API calls
      const idToken = await result.user.getIdToken();
      sessionStorage.setItem('civicpulse_firebase_token', idToken);

      setOtpStep('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OTP verification failed.';
      if (msg.includes('invalid-verification-code')) {
        setOtpError('Invalid OTP. Please check and try again.');
      } else if (msg.includes('code-expired')) {
        setOtpError('OTP expired. Please request a new code.');
      } else {
        setOtpError(msg);
      }
      throw new Error(msg);
    } finally {
      setOtpLoading(false);
    }
  }, [confirmationResult]);

  // ─── Resend OTP ───────────────────────────────────────────────────────
  const resendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;
    if (!otpPhone) return;
    await sendOtp(otpPhone);
  }, [resendCooldown, otpPhone, sendOtp]);

  // ─── Complete Auth (after OTP verified) ───────────────────────────────
  const completeAuth = useCallback(async (
    name: string,
    requestedRole: UserRole,
    language: 'en' | 'te',
    isRegister: boolean
  ) => {
    const norm = otpPhone;
    if (!norm) throw new Error('No phone in session.');

    // Role enforcement
    if (ADMIN_PHONES.has(norm) && requestedRole !== 'admin') {
      throw new Error('This phone number is reserved for admin access only.');
    }
    if (CONTRACTOR_PHONES.has(norm) && requestedRole !== 'contractor') {
      throw new Error('This phone number is reserved for contractor access only.');
    }
    if (!ADMIN_PHONES.has(norm) && requestedRole === 'admin') {
      throw new Error('Admin access requires an authorized GVMC phone number.');
    }
    if (!CONTRACTOR_PHONES.has(norm) && requestedRole === 'contractor') {
      throw new Error('Contractor access requires an authorized contractor phone number.');
    }

    if (isRegister) {
      // Check if already registered
      if (registeredUsers.some(u => u.phone === norm)) {
        throw new Error('This phone is already registered. Switch to Sign In.');
      }

      const newUser: RegisteredUser = {
        phone: norm,
        name,
        role: requestedRole,
        language,
        registeredAt: new Date().toISOString(),
      };
      setRegisteredUsers(prev => [...prev, newUser]);
    } else {
      // Sign In — verify registration
      const found = registeredUsers.find(u => u.phone === norm);
      if (!found) {
        throw new Error('Phone number not registered. Please register first.');
      }
      if (found.role !== requestedRole) {
        throw new Error(`This phone is registered as "${found.role}". You cannot log in as "${requestedRole}".`);
      }
      name = found.name;
      language = found.language;
    }

    const profile: UserProfile = {
      id: firebaseUser?.uid || `usr-${Date.now()}`,
      name,
      email: firebaseUser?.email || '',
      phone: norm,
      role: requestedRole,
      ward: requestedRole === 'admin' ? 'All GVMC Zones (Zones 1-8)' : 'Ward 21',
      locality: requestedRole === 'admin' ? 'GVMC Central Command Centre, Asilmetta' : 'MVP Colony Sector 2',
      preferredLanguage: language,
      createdAt: new Date().toISOString(),
      ...(requestedRole === 'admin' ? { departmentId: 'dept-roads' } : {}),
      ...(requestedRole === 'contractor' ? { contractorId: 'cont-1' } : {}),
    };

    setUser(profile);
  }, [otpPhone, registeredUsers, firebaseUser]);

  // ─── Reset OTP flow ───────────────────────────────────────────────────
  const resetOtpFlow = useCallback(() => {
    setOtpStep('phone');
    setOtpPhone('');
    setOtpError('');
    setConfirmationResult(null);
    setResendCooldown(0);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch { /* ignore */ }
      recaptchaVerifierRef.current = null;
    }
  }, []);

  // ─── Demo Login (localStorage only — used when Firebase not configured) ──
  const login = async (phone: string, requestedRole: UserRole) => {
    const norm = normalizeIndianPhone(phone);
    if (!norm) throw new Error('Invalid Indian phone number.');

    const found = registeredUsers.find(u => u.phone === norm);
    if (!found) throw new Error('Phone number not registered. Please register first.');
    if (found.role !== requestedRole) {
      throw new Error(`This phone is registered as "${found.role}". You cannot log in as "${requestedRole}".`);
    }

    const profile: UserProfile = {
      id: `usr-${norm.slice(-6)}`,
      name: found.name,
      email: '',
      phone: norm,
      role: found.role,
      ward: found.role === 'admin' ? 'All GVMC Zones (Zones 1-8)' : 'Ward 21',
      locality: found.role === 'admin' ? 'GVMC Central Command Centre, Asilmetta' : 'MVP Colony Sector 2',
      preferredLanguage: found.language,
      createdAt: found.registeredAt,
      ...(found.role === 'admin' ? { departmentId: 'dept-roads' } : {}),
      ...(found.role === 'contractor' ? { contractorId: 'cont-1' } : {}),
    };
    setUser(profile);
  };

  // ─── Demo Register (localStorage only) ────────────────────────────────
  const register = async (phone: string, name: string, requestedRole: UserRole, language: 'en' | 'te') => {
    const norm = normalizeIndianPhone(phone);
    if (!norm) throw new Error('Invalid Indian phone number.');

    if (registeredUsers.some(u => u.phone === norm)) {
      throw new Error('This phone number is already registered. Please use Sign In.');
    }

    if (ADMIN_PHONES.has(norm) && requestedRole !== 'admin') throw new Error('This phone is reserved for admin access only.');
    if (CONTRACTOR_PHONES.has(norm) && requestedRole !== 'contractor') throw new Error('This phone is reserved for contractor access only.');
    if (!ADMIN_PHONES.has(norm) && requestedRole === 'admin') throw new Error('Admin registration requires an authorized GVMC phone number.');
    if (!CONTRACTOR_PHONES.has(norm) && requestedRole === 'contractor') throw new Error('Contractor registration requires an authorized contractor phone number.');

    const newUser: RegisteredUser = { phone: norm, name, role: requestedRole, language, registeredAt: new Date().toISOString() };
    setRegisteredUsers(prev => [...prev, newUser]);

    const profile: UserProfile = {
      id: `usr-${Date.now()}`, name, email: '', phone: norm, role: requestedRole,
      ward: 'Ward 21', locality: 'MVP Colony Sector 2', preferredLanguage: language,
      createdAt: new Date().toISOString(),
    };
    setUser(profile);
  };

  // ─── Logout ───────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    resetOtpFlow();
    sessionStorage.removeItem('civicpulse_firebase_token');
    if (firebaseAuth) {
      signOut(firebaseAuth).catch(() => { /* ignore */ });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  };

  // ─── Role Helpers ─────────────────────────────────────────────────────
  const isAdminPhone = (phone: string): boolean => {
    const n = normalizeIndianPhone(phone); return n ? ADMIN_PHONES.has(n) : false;
  };
  const isContractorPhone = (phone: string): boolean => {
    const n = normalizeIndianPhone(phone); return n ? CONTRACTOR_PHONES.has(n) : false;
  };
  const getAllowedRoles = (phone: string): UserRole[] => {
    const n = normalizeIndianPhone(phone);
    if (!n) return [];
    if (ADMIN_PHONES.has(n)) return ['admin'];
    if (CONTRACTOR_PHONES.has(n)) return ['contractor'];
    return ['citizen'];
  };
  const isPhoneRegistered = (phone: string): boolean => {
    const n = normalizeIndianPhone(phone);
    return n ? registeredUsers.some(u => u.phone === n) : false;
  };
  const getRegisteredRole = (phone: string): UserRole | null => {
    const n = normalizeIndianPhone(phone);
    if (!n) return null;
    return registeredUsers.find(u => u.phone === n)?.role ?? null;
  };

  // ─── Get Firebase ID Token ────────────────────────────────────────────
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken(true);
        sessionStorage.setItem('civicpulse_firebase_token', token);
        return token;
      } catch { return null; }
    }
    return sessionStorage.getItem('civicpulse_firebase_token');
  }, [firebaseUser]);

  return (
    <AuthContext.Provider
      value={{
        user, role, isAuthenticated: !!user,
        isFirebaseMode: firebaseMode,
        otpStep, otpPhone, otpLoading, otpError, resendCooldown,
        sendOtp, verifyOtp, resendOtp, completeAuth,
        login, register, logout, resetOtpFlow,
        updateProfile, isPhoneRegistered, getRegisteredRole,
        isAdminPhone, isContractorPhone, getAllowedRoles,
        getIdToken,
      }}
    >
      {children}
      {/* Invisible reCAPTCHA container — required by Firebase Phone Auth */}
      <div id="recaptcha-container" />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
