/**
 * SurplusX Authoritative Email Verification & Domain Validation Service
 * 
 * Strict Security Architecture:
 * 1. RFC 5322 Syntax Validation & Normalization
 * 2. Domain & DNS/MX Record Validation (detects non-existent / unreachable domains)
 * 3. Cryptographically Secure 6-Digit Server-Side OTP Generation
 * 4. ZERO Plaintext OTP Storage: Stores strictly HMAC SHA-256 hash
 * 5. ZERO Plaintext OTP Transmission to Client: Dispatched strictly via transactional email to user inbox
 * 6. Single-Use Invalidation & 5-Minute Expiry
 * 7. Rate Limiting, Max 5 Attempts Lockout & Cooldown Protection
 * 8. 15-Minute Consumable Verification Token for Transactional Registration
 */

import dns from 'dns';
import crypto from 'crypto';
import {
  EmailVerificationStatus,
  EmailVerification,
} from '../types';
import { emailService } from './emailService';

const dnsPromises = dns.promises;

// Server-side HMAC secret for Email OTP hashing
const EMAIL_HASH_SECRET = process.env.EMAIL_SECRET_KEY || 'surplusx-super-secure-email-secret-key-2026';

// Known reputable public mail domains with guaranteed MX infrastructures
const KNOWN_MAJOR_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'zoho.in',
  'aol.com',
  'rediffmail.com',
  'yandex.com',
  'gmx.com',
  'mail.com',
  'surplusx.org',
  'greenbasket.com',
  'hopefoundation.org',
  'metromart.in',
]);

// Known fake / disposable email domain blacklist
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'sharklasers.com',
  'yopmail.com',
  'dispostable.com',
  'trashmail.com',
]);

export interface StoredEmailSession {
  id: string;
  email: string;
  normalizedEmail: string;
  tokenHash: string; // ONLY hashed OTP is stored
  expiresAt: number; // Unix ms (5 min TTL)
  attemptCount: number;
  maxAttempts: number;
  resendAvailableAt: number; // Unix ms (30s cooldown)
  verifiedAt?: number;
  verificationToken?: string;
  tokenExpiresAt?: number;
  clientIp: string;
  deviceId?: string;
  createdAt: number;
  lastSentAt: number;
  status: 'UNVERIFIED' | 'OTP_SENT' | 'VERIFIED' | 'EXPIRED' | 'FAILED' | 'LOCKED';
  deliveryStatus: 'DELIVERED' | 'BOUNCED' | 'FAILED' | 'PENDING';
}

export interface EmailRateLimitEntry {
  requests: number[];
}

export interface EmailCheckResult {
  valid: boolean;
  normalizedEmail: string;
  status: EmailVerificationStatus;
  domain: string;
  domainValid: boolean;
  isDisposable: boolean;
  requiresVerification: boolean;
  message: string;
  error?: string;
}

export class EmailVerificationService {
  private static instance: EmailVerificationService;

  // In-Memory Database for Email Sessions, Verifications, and Single-Use Tokens
  private emailVerifications = new Map<string, EmailVerification>();
  private emailSessions = new Map<string, StoredEmailSession>(); // sessionId -> StoredEmailSession
  private activeSessionByEmail = new Map<string, string>(); // normalizedEmail -> sessionId
  private verifiedEmailTokens = new Map<string, { email: string; expiresAt: number }>();

  // DNS MX Cache to prevent redundant DNS roundtrips
  private domainMxCache = new Map<string, { valid: boolean; cachedAt: number }>();

  // Rate Limiting Buckets
  private emailRateLimits = new Map<string, EmailRateLimitEntry>();
  private ipRateLimits = new Map<string, EmailRateLimitEntry>();
  private deviceRateLimits = new Map<string, EmailRateLimitEntry>();

  private constructor() {}

  public static getInstance(): EmailVerificationService {
    if (!EmailVerificationService.instance) {
      EmailVerificationService.instance = new EmailVerificationService();
    }
    return EmailVerificationService.instance;
  }

  /**
   * 1. Normalize Email (Lowercase & trim)
   */
  public normalizeEmail(email: string): string {
    if (!email) return '';
    return email.trim().toLowerCase();
  }

  /**
   * 2. Strict RFC 5322 Syntax Validator
   */
  public validateEmailFormat(email: string): boolean {
    const normalized = this.normalizeEmail(email);
    if (!normalized || normalized.length > 254) return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(normalized)) return false;

    const parts = normalized.split('@');
    if (parts.length !== 2) return false;
    const [localPart, domain] = parts;

    if (localPart.length === 0 || localPart.length > 64) return false;
    if (domain.length === 0 || domain.length > 255) return false;
    if (!domain.includes('.')) return false;
    if (normalized.includes('..')) return false;

    return true;
  }

  /**
   * 3. Domain & DNS MX Record Check
   */
  public async checkDomainMX(domain: string): Promise<boolean> {
    const lowerDomain = domain.trim().toLowerCase();

    // Fast-path known major providers
    if (KNOWN_MAJOR_DOMAINS.has(lowerDomain)) {
      return true;
    }

    // Fast-path academic/institutional domains
    if (
      lowerDomain.endsWith('.edu') ||
      lowerDomain.endsWith('.edu.in') ||
      lowerDomain.endsWith('.ac.in') ||
      lowerDomain.endsWith('.gov.in') ||
      lowerDomain.endsWith('.org.in') ||
      lowerDomain.endsWith('.res.in')
    ) {
      return true;
    }

    // Check Cache (TTL 1 hour)
    const cached = this.domainMxCache.get(lowerDomain);
    const ONE_HOUR = 60 * 60 * 1000;
    if (cached && Date.now() - cached.cachedAt < ONE_HOUR) {
      return cached.valid;
    }

    try {
      const mxPromise = dnsPromises.resolveMx(lowerDomain);
      const timeoutPromise = new Promise<dns.MxRecord[]>((_, reject) =>
        setTimeout(() => reject(new Error('DNS_TIMEOUT')), 3500)
      );
      const records = await Promise.race([mxPromise, timeoutPromise]);
      const isValid = Array.isArray(records) && records.length > 0;

      this.domainMxCache.set(lowerDomain, { valid: isValid, cachedAt: Date.now() });
      return isValid;
    } catch {
      try {
        const aPromise = dnsPromises.resolve(lowerDomain);
        const timeoutPromise = new Promise<string[]>((_, reject) =>
          setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2500)
        );
        const addresses = await Promise.race([aPromise, timeoutPromise]);
        const isValid = Array.isArray(addresses) && addresses.length > 0;
        this.domainMxCache.set(lowerDomain, { valid: isValid, cachedAt: Date.now() });
        return isValid;
      } catch {
        this.domainMxCache.set(lowerDomain, { valid: false, cachedAt: Date.now() });
        return false;
      }
    }
  }

  /**
   * 4. Comprehensive Email Check
   */
  public async checkEmail(rawEmail: string): Promise<EmailCheckResult> {
    const normalized = this.normalizeEmail(rawEmail);

    if (!normalized) {
      return {
        valid: false,
        normalizedEmail: '',
        status: 'INVALID_FORMAT',
        domain: '',
        domainValid: false,
        isDisposable: false,
        requiresVerification: true,
        message: 'Email address is required.',
        error: 'Please enter an email address.',
      };
    }

    if (!this.validateEmailFormat(normalized)) {
      return {
        valid: false,
        normalizedEmail: normalized,
        status: 'INVALID_FORMAT',
        domain: normalized.split('@')[1] || '',
        domainValid: false,
        isDisposable: false,
        requiresVerification: true,
        message: 'Invalid email format.',
        error: 'Please provide a valid email address (e.g. name@domain.com).',
      };
    }

    const domain = normalized.split('@')[1];

    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      return {
        valid: false,
        normalizedEmail: normalized,
        status: 'DOMAIN_INVALID',
        domain,
        domainValid: false,
        isDisposable: true,
        requiresVerification: true,
        message: 'Disposable email addresses cannot be used for SurplusX accounts.',
        error: 'Please use a permanent personal, institutional, or corporate email address.',
      };
    }

    const isDomainValid = await this.checkDomainMX(domain);
    if (!isDomainValid) {
      return {
        valid: false,
        normalizedEmail: normalized,
        status: 'DOMAIN_INVALID',
        domain,
        domainValid: false,
        isDisposable: false,
        requiresVerification: true,
        message: 'Email domain does not exist or has no mail servers configured.',
        error: `The domain "${domain}" does not exist or cannot receive mail. Please check spelling.`,
      };
    }

    return {
      valid: true,
      normalizedEmail: normalized,
      status: 'DOMAIN_VALID',
      domain,
      domainValid: true,
      isDisposable: false,
      requiresVerification: true,
      message: 'Email format and domain verified. Verification code required to confirm ownership.',
    };
  }

  /**
   * 5. Rate Limiting Check
   */
  public checkRateLimits(
    email: string,
    ip: string,
    deviceId?: string
  ): { allowed: boolean; retryAfterSeconds?: number; error?: string } {
    const now = Date.now();
    const WINDOW_15_MIN = 15 * 60 * 1000;

    const cleanAndCount = (
      map: Map<string, EmailRateLimitEntry>,
      key: string,
      limit: number
    ): { allowed: boolean; remaining: number } => {
      let entry = map.get(key);
      if (!entry) {
        entry = { requests: [] };
        map.set(key, entry);
      }
      entry.requests = entry.requests.filter((t) => now - t < WINDOW_15_MIN);
      if (entry.requests.length >= limit) {
        return { allowed: false, remaining: 0 };
      }
      return { allowed: true, remaining: limit - entry.requests.length };
    };

    // A. Email Limit: Max 5 verification codes per 15 minutes
    const emailLimit = cleanAndCount(this.emailRateLimits, email, 5);
    if (!emailLimit.allowed) {
      return {
        allowed: false,
        retryAfterSeconds: 300,
        error: 'Too many verification attempts for this email. Please wait 5 minutes before trying again.',
      };
    }

    // B. IP Limit: Max 25 verification requests per 15 minutes
    const ipLimit = cleanAndCount(this.ipRateLimits, ip, 25);
    if (!ipLimit.allowed) {
      return {
        allowed: false,
        retryAfterSeconds: 600,
        error: 'Too many verification requests from this network. Please try again in 10 minutes.',
      };
    }

    // C. Device Limit if present: Max 10 requests per 15 minutes
    if (deviceId) {
      const deviceLimit = cleanAndCount(this.deviceRateLimits, deviceId, 10);
      if (!deviceLimit.allowed) {
        return {
          allowed: false,
          retryAfterSeconds: 300,
          error: 'Verification rate limit exceeded on this device.',
        };
      }
    }

    return { allowed: true };
  }

  private recordRateLimitRequest(email: string, ip: string, deviceId?: string) {
    const now = Date.now();
    const record = (map: Map<string, EmailRateLimitEntry>, key: string) => {
      let entry = map.get(key);
      if (!entry) {
        entry = { requests: [] };
        map.set(key, entry);
      }
      entry.requests.push(now);
    };

    record(this.emailRateLimits, email);
    record(this.ipRateLimits, ip);
    if (deviceId) record(this.deviceRateLimits, deviceId);
  }

  /**
   * 6. Generate Cryptographic 6-Digit Verification Code (Server-Side Only)
   */
  private generateSecureCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * 7. Hash Code with HMAC SHA-256
   */
  private hashVerificationCode(code: string, email: string): string {
    return crypto
      .createHmac('sha256', EMAIL_HASH_SECRET)
      .update(`${email.toLowerCase()}:${code}`)
      .digest('hex');
  }

  /**
   * 8. Mask Email for Privacy Display (e.g. h****a@gmail.com)
   */
  public maskEmail(email: string): string {
    return emailService.maskEmail(email);
  }

  /**
   * 9. Send Real Email Verification OTP
   * CRITICAL: The plaintext OTP is dispatched strictly to the recipient's email address.
   * NO OTP IS RETURNED IN THE API RESPONSE.
   */
  public async sendVerificationEmail(params: {
    email: string;
    clientIp?: string;
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
    const normalized = this.normalizeEmail(params.email);
    const clientIp = params.clientIp || '127.0.0.1';

    // Validate format & domain
    const checkRes = await this.checkEmail(normalized);
    if (!checkRes.valid) {
      return {
        success: false,
        error: checkRes.error || checkRes.message,
      };
    }

    // Rate limit check
    const rateCheck = this.checkRateLimits(normalized, clientIp, params.deviceId);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: rateCheck.error,
      };
    }

    // Check Resend Cooldown (30s)
    const existingSessionId = this.activeSessionByEmail.get(normalized);
    if (existingSessionId) {
      const existingSession = this.emailSessions.get(existingSessionId);
      if (existingSession && Date.now() < existingSession.resendAvailableAt) {
        const remainingSec = Math.ceil((existingSession.resendAvailableAt - Date.now()) / 1000);
        return {
          success: false,
          error: `Please wait ${remainingSec}s before requesting a new verification email.`,
        };
      }
      // When a new OTP is requested, invalidate the previous OTP immediately
      if (existingSession) {
        existingSession.status = 'EXPIRED';
      }
    }

    // Generate Cryptographic 6-Digit OTP on Backend
    const verificationCode = this.generateSecureCode();
    const tokenHash = this.hashVerificationCode(verificationCode, normalized);
    const sessionId = `ems_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const now = Date.now();
    const expiresInSeconds = 300; // 5 minutes TTL
    const expiresAt = now + expiresInSeconds * 1000;
    const resendCooldownSeconds = 30; // 30s resend cooldown
    const resendAvailableAt = now + resendCooldownSeconds * 1000;

    // Dispatch via Centralized Transactional Email Service
    const emailResult = await emailService.sendVerificationOTP(normalized, verificationCode, 5);

    if (!emailResult.success) {
      return {
        success: false,
        error: 'Unable to send the verification code. Please check your email address and try again.',
      };
    }

    // Safe Audit Log (NEVER logs plaintext OTP or hash)
    console.log(`[EmailService] Email OTP requested and dispatched to ${this.maskEmail(normalized)}`);

    const session: StoredEmailSession = {
      id: sessionId,
      email: params.email,
      normalizedEmail: normalized,
      tokenHash,
      expiresAt,
      attemptCount: 0,
      maxAttempts: 5,
      resendAvailableAt,
      clientIp,
      deviceId: params.deviceId,
      createdAt: now,
      lastSentAt: now,
      status: 'OTP_SENT',
      deliveryStatus: 'DELIVERED',
    };

    this.emailSessions.set(sessionId, session);
    this.activeSessionByEmail.set(normalized, sessionId);
    this.recordRateLimitRequest(normalized, clientIp, params.deviceId);

    return {
      success: true,
      status: 'OTP_SENT',
      sessionId,
      maskedEmail: this.maskEmail(normalized),
      expiresInSeconds,
      resendAvailableInSeconds: resendCooldownSeconds,
      message: 'A verification code has been sent to your email address.',
    };
  }

  /**
   * 10. Verify Email OTP & Issue 15-Minute Single-Use Verification Token
   * CRITICAL: Never discloses expected/correct OTP in error responses.
   */
  public verifyEmailCode(params: {
    sessionId?: string;
    verification_session_id?: string;
    email: string;
    code?: string;
    otp?: string;
    clientIp?: string;
  }): {
    success: boolean;
    status?: string;
    verificationToken?: string;
    error?: string;
    remainingAttempts?: number;
  } {
    const normalized = this.normalizeEmail(params.email);
    const rawCode = params.code || params.otp || '';
    const cleanCode = rawCode.trim().replace(/\D/g, '');

    if (!cleanCode || cleanCode.length !== 6) {
      return {
        success: false,
        error: 'Please enter the 6-digit verification code sent to your email.',
      };
    }

    // Resolve active session
    const targetSessionId = params.sessionId || params.verification_session_id;
    let session: StoredEmailSession | undefined;
    if (targetSessionId) {
      session = this.emailSessions.get(targetSessionId);
    }
    if (!session) {
      const activeSessionId = this.activeSessionByEmail.get(normalized);
      if (activeSessionId) {
        session = this.emailSessions.get(activeSessionId);
      }
    }

    if (!session) {
      return {
        success: false,
        error: 'No active verification session found. Please request a new verification code.',
      };
    }

    if (session.normalizedEmail !== normalized) {
      return {
        success: false,
        error: 'Verification session does not match this email address.',
      };
    }

    if (session.status === 'LOCKED') {
      return {
        success: false,
        error: 'Too many incorrect attempts. Please request a new verification code.',
      };
    }

    if (session.status === 'EXPIRED') {
      return {
        success: false,
        error: 'Verification code has expired. Please request a new code.',
      };
    }

    const now = Date.now();
    if (now > session.expiresAt) {
      session.status = 'EXPIRED';
      return {
        success: false,
        error: 'Verification code expired. Please request a new code.',
      };
    }

    if (session.attemptCount >= session.maxAttempts) {
      session.status = 'LOCKED';
      return {
        success: false,
        error: 'Too many incorrect attempts. Please request a new verification code.',
      };
    }

    // Constant-time cryptographic verification
    const providedHash = this.hashVerificationCode(cleanCode, normalized);
    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(session.tokenHash, 'hex'),
        Buffer.from(providedHash, 'hex')
      );
    } catch {
      isValid = false;
    }

    // Development / Test environment safety:
    // When in non-production (NODE_ENV !== 'production') and ENABLE_TEST_OTP is not disabled,
    // permit standard dev test verification codes (e.g. 123456, 482913)
    const isDevMode = process.env.NODE_ENV !== 'production';
    const isTestOtpExplicitlyDisabled = process.env.ENABLE_TEST_OTP === 'false';
    const isTestOtpAllowed = isDevMode && !isTestOtpExplicitlyDisabled;

    if (!isValid && isTestOtpAllowed) {
      if (cleanCode === '123456' || cleanCode === '482913' || cleanCode === '000000') {
        isValid = true;
      }
    }

    if (!isValid) {
      session.attemptCount += 1;
      const remaining = session.maxAttempts - session.attemptCount;

      if (remaining <= 0) {
        session.status = 'LOCKED';
        console.warn(`[EmailService] Email OTP verification locked after max attempts for ${this.maskEmail(normalized)}`);
        return {
          success: false,
          remainingAttempts: 0,
          error: 'Too many incorrect attempts. Please request a new verification code.',
        };
      }

      console.warn(`[EmailService] Email OTP verification failed for ${this.maskEmail(normalized)} (${remaining} remaining)`);
      return {
        success: false,
        remainingAttempts: remaining,
        error: `Incorrect verification code. Please try again. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`,
      };
    }

    // SUCCESS: Mark single-use consumption & issue 15-Minute Token
    const verificationToken = `eml_tok_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
    const tokenExpiresAt = now + 15 * 60 * 1000; // 15 mins

    session.status = 'VERIFIED';
    session.verifiedAt = now;
    session.verificationToken = verificationToken;
    session.tokenExpiresAt = tokenExpiresAt;

    this.verifiedEmailTokens.set(verificationToken, {
      email: normalized,
      expiresAt: tokenExpiresAt,
    });

    // Record verified email entry
    this.emailVerifications.set(normalized, {
      id: `emv_${Date.now()}`,
      email: normalized,
      provider: 'SURPLUSX_TRANSACTIONAL',
      domainStatus: 'VALID',
      deliveryStatus: 'DELIVERED',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date(session.createdAt).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`[EmailService] Email OTP verified successfully for ${this.maskEmail(normalized)}`);

    return {
      success: true,
      status: 'EMAIL_VERIFIED',
      verificationToken,
    };
  }

  /**
   * 11. Consume Email Verification Token (Atomic Single-Use Check for Registration)
   */
  public consumeVerificationToken(
    token: string | undefined,
    expectedEmail: string
  ): { valid: boolean; error?: string } {
    if (!token) {
      return {
        valid: false,
        error: 'Email verification token is required. Please verify your email before submitting registration.',
      };
    }

    const normEmail = this.normalizeEmail(expectedEmail);
    const tokenData = this.verifiedEmailTokens.get(token);

    if (!tokenData) {
      return {
        valid: false,
        error: 'Invalid or already consumed email verification token. Please verify your email again.',
      };
    }

    if (tokenData.email !== normEmail) {
      return {
        valid: false,
        error: 'Email verification token does not match the provided email address.',
      };
    }

    if (Date.now() > tokenData.expiresAt) {
      this.verifiedEmailTokens.delete(token);
      return {
        valid: false,
        error: 'Email verification token has expired. Please verify your email again.',
      };
    }

    // Atomic consumption: Delete token so it cannot be used again
    this.verifiedEmailTokens.delete(token);

    return { valid: true };
  }

  /**
   * 12. Check if an email has already been verified
   */
  public isEmailVerified(email: string): boolean {
    const norm = this.normalizeEmail(email);
    const record = this.emailVerifications.get(norm);
    return record?.verificationStatus === 'VERIFIED';
  }

  /**
   * Periodic cleanup job for expired Email sessions and tokens
   */
  public cleanupExpiredSessions(): { cleanedSessions: number; cleanedTokens: number } {
    const now = Date.now();
    let cleanedSessions = 0;
    let cleanedTokens = 0;

    for (const [id, session] of this.emailSessions.entries()) {
      if (session.expiresAt < now && session.status !== 'VERIFIED') {
        this.emailSessions.delete(id);
        cleanedSessions++;
      }
    }

    for (const [token, data] of this.verifiedEmailTokens.entries()) {
      if (data.expiresAt < now) {
        this.verifiedEmailTokens.delete(token);
        cleanedTokens++;
      }
    }

    return { cleanedSessions, cleanedTokens };
  }
}

export const emailVerificationService = EmailVerificationService.getInstance();

// Background cleanup schedule
setInterval(() => {
  emailVerificationService.cleanupExpiredSessions();
}, 10 * 60 * 1000);
