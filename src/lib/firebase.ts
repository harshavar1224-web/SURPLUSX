import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential,
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

// Initialize Analytics lazily / safely
let analyticsInstance: any = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
      console.log('[Firebase Analytics] Initialized successfully');
    }
  }).catch((err) => {
    console.debug('[Firebase Analytics] Analytics initialization skipped:', err);
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
 * Initialize invisible reCAPTCHA Verifier for Firebase Phone Authentication
 */
export function initRecaptchaVerifier(
  containerId: string | HTMLElement = 'recaptcha-container',
  onSuccess?: () => void,
  onExpired?: () => void
): RecaptchaVerifier {
  let targetContainer: HTMLElement | null = null;

  if (typeof containerId === 'string') {
    targetContainer = document.getElementById(containerId);
    if (!targetContainer) {
      targetContainer = document.createElement('div');
      targetContainer.id = containerId;
      document.body.appendChild(targetContainer);
    }
  } else if (containerId instanceof HTMLElement) {
    targetContainer = containerId;
  } else {
    targetContainer = document.getElementById('recaptcha-container');
    if (!targetContainer) {
      targetContainer = document.createElement('div');
      targetContainer.id = 'recaptcha-container';
      document.body.appendChild(targetContainer);
    }
  }

  // Clear any existing reCAPTCHA instance on the window if present
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      console.debug('[Firebase Phone Auth] Safe cleanup on previous verifier:', e);
    }
    (window as any).recaptchaVerifier = null;
  }

  const verifier = new RecaptchaVerifier(auth, targetContainer, {
    size: 'invisible',
    callback: () => {
      console.log('[Firebase Phone Auth] reCAPTCHA solved successfully');
      if (onSuccess) onSuccess();
    },
    'expired-callback': () => {
      console.warn('[Firebase Phone Auth] reCAPTCHA expired, please re-trigger');
      if (onExpired) onExpired();
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send SMS OTP via Firebase Authentication using phone number (+91XXXXXXXXXX) and reCAPTCHA
 */
export async function sendFirebasePhoneOtp(
  phone: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> {
  try {
    trackEvent('registration_started', { phone, step: 'request_otp' });
    const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    trackEvent('otp_sent', { phone, provider: 'FIREBASE_AUTH' });
    return {
      success: true,
      confirmationResult,
    };
  } catch (error: any) {
    console.error('[Firebase Phone Auth] Error sending SMS OTP:', error);
    let errorMessage = 'Failed to send SMS OTP. Please check your mobile number and try again.';
    
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format. Please enter a valid 10-digit Indian mobile number with +91.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many OTP attempts. Please wait a few minutes before requesting a new code.';
    } else if (error.code === 'auth/captcha-check-failed') {
      errorMessage = 'reCAPTCHA verification failed. Please refresh the page and try again.';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'Daily SMS quota exceeded in Firebase project. Please try again later or configure test phone numbers in Firebase Console.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'Domain not authorized in Firebase Console. Please add this domain under Authentication > Settings > Authorized domains.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Phone Authentication is not enabled in Firebase. Please enable the "Phone" sign-in provider in your Firebase Console (Authentication > Sign-in method > Phone).';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network connection to Firebase Auth failed. Please check your internet connection and verify authorized domains in Firebase Console.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Verify SMS OTP code using Firebase ConfirmationResult
 */
export async function verifyFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<{ success: boolean; userCredential?: UserCredential; error?: string }> {
  try {
    const userCredential = await confirmationResult.confirm(otpCode);
    trackEvent('otp_verified', {
      uid: userCredential.user.uid,
      phone: userCredential.user.phoneNumber,
      provider: 'FIREBASE_AUTH',
    });
    return {
      success: true,
      userCredential,
    };
  } catch (error: any) {
    console.error('[Firebase Phone Auth] Error verifying OTP:', error);
    let errorMessage = 'Invalid or expired OTP code. Please check your SMS and try again.';
    
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Incorrect 6-digit OTP code. Please check your SMS messages and enter the valid code.';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'This OTP has expired. Please click "Resend OTP" to get a new code.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Synchronize user profile into Firestore `users` collection
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
