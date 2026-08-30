/**
 * SurplusX Client Identity & Role-Locking Client Service
 * 
 * Provides client-side helpers and authoritative API client calls:
 * - Real-time email normalization & RFC format check
 * - Real-time Indian mobile normalization & validation (+91XXXXXXXXXX)
 * - Real-time availability & conflict pre-check
 * - Transactional signup
 * - Authoritative login (NO role selector on login!)
 * - Admin role modification
 */

import {
  User,
  UserRole,
  IdentityAvailabilityResult,
  AdminRoleChangeLog,
  PhoneIntelligence,
  OTPPurpose,
  BlockedPhone,
  BlockedPhoneReason,
  PhoneVerification,
  EmailVerificationStatus,
} from '../types';

export function normalizeEmailClient(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

export function maskEmailClient(email: string): string {
  if (!email) return '';
  const norm = normalizeEmailClient(email);
  const parts = norm.split('@');
  if (parts.length !== 2) return norm;
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  const visibleStart = name.slice(0, 1);
  const visibleEnd = name.slice(-1);
  return `${visibleStart}${'*'.repeat(Math.min(name.length - 2, 4))}${visibleEnd}@${domain}`;
}

export function validateEmailClient(email: string): boolean {
  const norm = normalizeEmailClient(email);
  if (!norm || norm.length > 254) return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(norm);
}

export async function checkEmailApi(email: string): Promise<{
  success: boolean;
  valid: boolean;
  normalizedEmail: string;
  status: EmailVerificationStatus;
  domain: string;
  domainValid: boolean;
  isDisposable: boolean;
  emailRegistered: boolean;
  verificationRequired: boolean;
  existingRole?: UserRole;
  message: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/email/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      valid: false,
      normalizedEmail: email,
      status: 'DOMAIN_INVALID',
      domain: email.split('@')[1] || '',
      domainValid: false,
      isDisposable: false,
      emailRegistered: false,
      verificationRequired: true,
      message: 'Unable to verify email domain at this time.',
      error: 'Network connection error during email domain check.',
    };
  }
}

export async function sendEmailVerificationApi(params: {
  email: string;
  deviceId?: string;
}): Promise<{
  success: boolean;
  status?: string;
  sessionId?: string;
  maskedEmail?: string;
  expiresInSeconds?: number;
  resendAvailableInSeconds?: number;
  message?: string;
  isRegistered?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/email/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while sending email verification.',
    };
  }
}

export const sendEmailOtpApi = sendEmailVerificationApi;

export async function resendEmailOtpApi(params: {
  email: string;
  sessionId?: string;
  deviceId?: string;
}): Promise<{
  success: boolean;
  status?: string;
  sessionId?: string;
  maskedEmail?: string;
  expiresInSeconds?: number;
  resendAvailableInSeconds?: number;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/email/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while resending email verification.',
    };
  }
}

export async function verifyEmailCodeApi(params: {
  sessionId?: string;
  verification_session_id?: string;
  email: string;
  code?: string;
  otp?: string;
}): Promise<{
  success: boolean;
  status?: string;
  verificationToken?: string;
  remainingAttempts?: number;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/email/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while verifying email code.',
    };
  }
}

export function normalizeIndianPhoneClient(input: string): { normalized: string; valid: boolean; error?: string } {
  if (!input) {
    return { normalized: '', valid: false, error: 'Mobile number is required.' };
  }

  const cleaned = input.replace(/[\s\-\(\)\.]/g, '');
  let digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;

  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  }

  if (digits.length !== 10) {
    return {
      normalized: '',
      valid: false,
      error: 'Please enter a 10-digit Indian mobile number.',
    };
  }

  if (!/^[6-9]/.test(digits)) {
    return {
      normalized: '',
      valid: false,
      error: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
    };
  }

  return {
    normalized: `+91${digits}`,
    valid: true,
  };
}

export function formatIndianPhoneDisplayClient(normalized: string): string {
  if (!normalized || !normalized.startsWith('+91') || normalized.length !== 13) {
    return normalized;
  }
  const d = normalized.slice(3);
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}

// API Calls
export async function checkIdentityAvailabilityApi(params: {
  email?: string;
  phone?: string;
  role?: UserRole;
}): Promise<IdentityAvailabilityResult> {
  try {
    const res = await fetch('/api/auth/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    // Fallback if offline
    return {
      emailAvailable: true,
      phoneAvailable: true,
      isConflict: false,
    };
  }
}

export async function lookupPhoneApi(phone: string): Promise<{
  success: boolean;
  intelligence: PhoneIntelligence;
}> {
  try {
    const res = await fetch('/api/auth/phone/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      intelligence: {
        valid: false,
        reachable: false,
        lineStatus: 'UNKNOWN',
        country: 'IN',
        countryCode: '+91',
        lineType: 'UNKNOWN',
        isDisposable: false,
        isVoip: false,
        riskLevel: 'HIGH_RISK',
        riskScore: 90,
        normalizedPhone: '',
        formattedDisplay: phone,
        maskedPhone: phone,
        safeErrorMessage: 'Unable to check mobile number reachability right now.',
      },
    };
  }
}

export async function sendPhoneOTPApi(params: {
  phone: string;
  purpose?: OTPPurpose;
  deviceId?: string;
}): Promise<{
  success: boolean;
  status?: string;
  sessionId?: string;
  verificationSessionId?: string;
  normalizedPhone?: string;
  expiresInSeconds?: number;
  resendAvailableInSeconds?: number;
  maskedPhone?: string;
  error?: string;
  code?: string;
}> {
  try {
    const res = await fetch('/api/auth/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while sending verification OTP.',
    };
  }
}

export async function resendPhoneOTPApi(params: {
  phone: string;
  purpose?: OTPPurpose;
  deviceId?: string;
}): Promise<{
  success: boolean;
  status?: string;
  sessionId?: string;
  verificationSessionId?: string;
  normalizedPhone?: string;
  expiresInSeconds?: number;
  resendAvailableInSeconds?: number;
  maskedPhone?: string;
  error?: string;
  code?: string;
}> {
  try {
    const res = await fetch('/api/auth/phone/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while resending verification OTP.',
    };
  }
}

export async function verifyPhoneOTPApi(params: {
  sessionId?: string;
  verificationSessionId?: string;
  phone: string;
  otpCode?: string;
  otp?: string;
  purpose?: OTPPurpose;
}): Promise<{
  success: boolean;
  status?: string;
  verificationToken?: string;
  normalizedPhone?: string;
  phoneVerification?: PhoneVerification;
  remainingAttempts?: number;
  error?: string;
  code?: string;
}> {
  try {
    const res = await fetch('/api/auth/phone/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while verifying OTP.',
    };
  }
}

export async function requestPhoneChangeApi(params: {
  userId: string;
  newPhone: string;
  deviceId?: string;
}): Promise<{
  success: boolean;
  sessionId?: string;
  normalizedPhone?: string;
  maskedPhone?: string;
  error?: string;
  code?: string;
}> {
  try {
    const res = await fetch('/api/auth/phone/change-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error requesting phone change.',
    };
  }
}

export async function verifyPhoneChangeApi(params: {
  userId: string;
  newPhone: string;
  otpCode: string;
  sessionId?: string;
  deviceId?: string;
}): Promise<{ success: boolean; user?: User; error?: string; code?: string }> {
  try {
    const res = await fetch('/api/auth/phone/change-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error confirming phone change.',
    };
  }
}

export async function signupApi(params: {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  emailVerificationToken?: string;
  phoneVerificationToken?: string;
  password?: string;
  city?: string;
  organizationName?: string;
  deviceId?: string;
}): Promise<{ success: boolean; user?: User; error?: string; code?: string; existingRole?: UserRole }> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error during signup. Please try again.',
    };
  }
}

export async function fetchBlockedPhonesApi(): Promise<BlockedPhone[]> {
  try {
    const res = await fetch('/api/admin/phone-blocks');
    const data = await res.json();
    return data.blocked || [];
  } catch (err) {
    return [];
  }
}

export async function blockPhoneApi(params: {
  phone: string;
  reasonCode: BlockedPhoneReason;
  notes?: string;
  createdBy?: string;
  expiresInDays?: number;
}): Promise<{ success: boolean; blockedPhone?: BlockedPhone; error?: string }> {
  try {
    const res = await fetch('/api/admin/phone-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to block number.' };
  }
}

export async function unblockPhoneApi(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/phone-blocks/${encodeURIComponent(phone)}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to unblock number.' };
  }
}

export async function adminOverridePhoneApi(params: {
  adminId: string;
  targetUserId: string;
  verifiedPhone: string;
  reason: string;
  evidenceReference: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch('/api/admin/phone-override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to override phone verification.' };
  }
}

export async function loginApi(params: {
  identifier: string;
  password?: string;
  deviceId?: string;
}): Promise<{
  success: boolean;
  user?: User;
  error?: string;
  isDeviceMismatch?: boolean;
  registeredDeviceId?: string;
}> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error during sign in. Please try again.',
    };
  }
}

export async function adminChangeRoleApi(params: {
  adminId: string;
  adminEmail: string;
  targetUserId: string;
  newRole: UserRole;
  reason: string;
}): Promise<{ success: boolean; error?: string; user?: User; auditLog?: AdminRoleChangeLog }> {
  try {
    const res = await fetch('/api/admin/change-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to execute administrative role change.',
    };
  }
}

export async function fetchAdminUsersApi(): Promise<User[]> {
  try {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    return data.users || [];
  } catch (err) {
    return [];
  }
}

export async function resetPasswordApi(params: {
  identifier: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to reset password.',
    };
  }
}
