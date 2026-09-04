import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { getAnalytics, isSupported as isAnalyticsSupported, logEvent } from 'firebase/analytics';
import firebaseConfigData from '../../firebase-applet-config.json';

// Firebase configuration loaded from project metadata
export const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId || undefined,
};

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Use custom or default Firestore database
const databaseId = (firebaseConfigData as any).firestoreDatabaseId || '(default)';
export const db =
  databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);

// Initialize Analytics lazily / safely only if measurementId is configured
let analyticsInstance: any = null;
if (typeof window !== 'undefined' && firebaseConfigData.measurementId && firebaseConfigData.measurementId.trim() !== '') {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported && firebaseConfigData.measurementId && firebaseConfigData.measurementId.trim() !== '') {
        try {
          analyticsInstance = getAnalytics(app);
          console.log('[Firebase Analytics] Initialized successfully');
        } catch (err) {
          console.debug('[Firebase Analytics] Analytics initialization skipped:', err);
        }
      }
    })
    .catch((err) => {
      console.debug('[Firebase Analytics] Analytics not supported in this environment:', err);
    });
}

/**
 * Log an event to Firebase Analytics safely
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  try {
    if (analyticsInstance && typeof window !== 'undefined') {
      logEvent(analyticsInstance, eventName, params);
    }
    // Also keep audit trace in development
    console.log(`[Analytics Event: ${eventName}]`, params || {});
  } catch (err) {
    console.debug(`[Analytics Event Error: ${eventName}]`, err);
  }
}

/**
 * Synchronize user profile into Firestore `users` collection
 * Securely stores verified mobile number, timestamp, and provider without storing OTP.
 */
export async function syncUserProfileToFirestore(userData: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  normalizedPhone?: string;
  role: string;
  organizationName?: string;
  city?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  phoneVerificationProvider?: string;
  emailVerified?: boolean;
  firebaseUid?: string;
  createdAt?: string;
  updatedAt?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userData.id);
    const nowIso = new Date().toISOString();
    
    const docData: Record<string, any> = {
      ...userData,
      phoneVerified: userData.phoneVerified ?? true,
      phoneVerifiedAt: userData.phoneVerifiedAt || nowIso,
      phoneVerificationProvider: userData.phoneVerificationProvider || 'MSG91',
      updatedAt: nowIso,
    };

    if (!docData.createdAt) {
      docData.createdAt = nowIso;
    }

    await setDoc(userRef, docData, { merge: true });
    trackEvent('profile_completed', {
      userId: userData.id,
      role: userData.role,
      phoneVerified: userData.phoneVerified,
      phoneVerificationProvider: docData.phoneVerificationProvider,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Firestore] Error saving user profile to Firestore:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch User Profile by ID or Email from Firestore
 */
export async function getUserProfileFromFirestore(userId: string): Promise<any | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('[Firestore] Error fetching user profile:', err);
    return null;
  }
}

/**
 * Fetch User by Phone Number from Firestore
 */
export async function findUserByPhoneInFirestore(phone: string): Promise<any | null> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('normalizedPhone', '==', phone));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (err) {
    console.error('[Firestore] Error querying user by phone:', err);
    return null;
  }
}

export { app };
