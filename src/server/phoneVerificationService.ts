/**
 * SurplusX Authoritative Phone Verification Service — Exclusively Exotel Voice OTP Powered
 * 
 * Production-Grade Architecture:
 * 1. Provider: Exotel Voice Call API (https://exotel.com)
 * 2. Mobile Verification Flow:
 *    - Server generates secure 6-digit OTP (never sent to client, never logged).
 *    - Server requests Exotel to place an automated voice call to the user.
 *    - User receives and answers the voice call to hear the OTP.
 *    - User submits 6-digit OTP in SurplusX UI.
 *    - Server verifies HMAC SHA-256 hash and validates session.
 * 3. Zero 2Factor / SMS / Mock / Frontend / Demo OTP: Plaintext OTP is NEVER generated on frontend,
 *    NEVER returned in API responses, NEVER stored, NEVER logged, and NEVER shown in the UI.
 * 4. India Mobile Number Validation & E.164 Normalization (+91XXXXXXXXXX).
 * 5. Multi-Tier Rate Limiting & 60s Call Cooldown.
 * 6. SurplusX Uniqueness Enforcement (One Mobile = One Account = One Role).
 * 7. Single-Use Cryptographic Verification Tokens (15-min TTL) for transactional registration.
 */

import libphonenumber from 'google-libphonenumber';
import {
  PhoneIntelligence,
  PhoneVerification,
  BlockedPhone,
  PhoneLineType,
  PhoneLineStatus,
  OTPPurpose,
  BlockedPhoneReason,
} from '../types';
import { exotelVoiceOtpService } from './exotelVoiceOtpService';

const { PhoneNumberUtil, PhoneNumberFormat } = libphonenumber;
const phoneUtil = PhoneNumberUtil.getInstance();

// India Mobile Carrier Prefix Map
const INDIA_CARRIER_PREFIXES: { prefix: string; carrier: string }[] = [
  { prefix: '98', carrier: 'Bharti Airtel' },
  { prefix: '97', carrier: 'Reliance Jio' },
  { prefix: '96', carrier: 'Vodafone Idea (Vi)' },
  { prefix: '95', carrier: 'Bharti Airtel' },
  { prefix: '94', carrier: 'BSNL Mobile' },
  { prefix: '93', carrier: 'Reliance Jio' },
  { prefix: '92', carrier: 'Tata Teleservices' },
  { prefix: '91', carrier: 'Reliance Jio' },
  { prefix: '90', carrier: 'Vodafone Idea (Vi)' },
  { prefix: '89', carrier: 'Bharti Airtel' },
  { prefix: '88', carrier: 'Vodafone Idea (Vi)' },
  { prefix: '87', carrier: 'Reliance Jio' },
  { prefix: '86', carrier: 'Bharti Airtel' },
  { prefix: '85', carrier: 'BSNL Mobile' },
  { prefix: '84', carrier: 'Vodafone Idea (Vi)' },
  { prefix: '83', carrier: 'Reliance Jio' },
  { prefix: '82', carrier: 'Bharti Airtel' },
  { prefix: '81', carrier: 'Vodafone Idea (Vi)' },
  { prefix: '80', carrier: 'Reliance Jio' },
  { prefix: '79', carrier: 'Vodafone Idea (Vi)' },
  { prefix: '78', carrier: 'Bharti Airtel' },
  { prefix: '77', carrier: 'Reliance Jio' },
  { prefix: '76', carrier: 'Bharti Airtel' },
  { prefix: '75', carrier: 'Vodafone Idea (Vi)' },
  { prefix: '74', carrier: 'BSNL Mobile' },
  { prefix: '73', carrier: 'Reliance Jio' },
  { prefix: '72', carrier: 'Bharti Airtel' },
  { prefix: '70', carrier: 'Reliance Jio' },
  { prefix: '63', carrier: 'Reliance Jio' },
  { prefix: '62', carrier: 'Bharti Airtel' },
];

const KNOWN_DISPOSABLE_PREFIXES = ['+9199999', '+9188888', '+9177777', '+9100000', '+9111111'];

export class PhoneVerificationService {
  private static instance: PhoneVerificationService;

  private phoneVerifications = new Map<string, PhoneVerification>();
  private blockedNumbers = new Map<string, BlockedPhone>();

  private constructor() {
    this.seedInitialBlockedNumbers();
  }

  public static getInstance(): PhoneVerificationService {
    if (!PhoneVerificationService.instance) {
      PhoneVerificationService.instance = new PhoneVerificationService();
    }
    return PhoneVerificationService.instance;
  }

  public isConfigured(): boolean {
    return exotelVoiceOtpService.isConfigured();
  }

  public getConfigurationStatus() {
    return exotelVoiceOtpService.getDiagnosticStatus();
  }

  private seedInitialBlockedNumbers() {
    const blockedSeeds: BlockedPhone[] = [
      {
        id: 'block-001',
        normalizedPhone: '+919999900000',
        reasonCode: 'SPAM',
        status: 'ACTIVE',
        notes: 'High-frequency synthetic disposable bot origin',
        createdBy: 'SYSTEM_FRAUD_MONITOR',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'block-002',
        normalizedPhone: '+919999911111',
        reasonCode: 'FRAUD',
        status: 'ACTIVE',
        notes: 'Flagged for spoofing and velocity tampering',
        createdBy: 'ADMIN_SECURITY_OPS',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const b of blockedSeeds) {
      this.blockedNumbers.set(b.normalizedPhone, b);
    }
  }

  public maskPhone(phone: string): string {
    return exotelVoiceOtpService.maskPhone(phone);
  }

  public normalizePhone(rawPhone: string, defaultCountry = 'IN') {
    return exotelVoiceOtpService.normalizePhone(rawPhone);
  }

  public consumeVerificationToken(token: string, expectedPhone: string, expectedPurpose: OTPPurpose = 'SIGNUP') {
    const valid = this.verifyToken(token, expectedPhone, expectedPurpose);
    if (!valid) {
      return { valid: false, error: 'Invalid or expired phone verification token.' };
    }
    return { valid: true };
  }

  public lookupPhone(phone: string): PhoneIntelligence {
    const norm = this.normalizePhone(phone);
    if (!norm.valid || !norm.normalized) {
      return {
        phone,
        normalizedPhone: '',
        formattedDisplay: phone,
        maskedPhone: phone,
        valid: false,
        country: 'IN',
        lineType: 'UNKNOWN',
        lineStatus: 'INACTIVE',
        riskLevel: 'BLOCKED',
        isDisposable: false,
        isVoip: false,
        reachable: false,
        safeErrorMessage: 'Please enter a valid 10-digit Indian mobile number.',
      };
    }

    const normalized = norm.normalized;
    const nationalNumber = norm.nationalNumber;

    if (this.isNumberBlocked(normalized)) {
      return {
        phone,
        normalizedPhone: normalized,
        nationalNumber,
        formattedDisplay: phone,
        maskedPhone: this.maskPhone(normalized),
        valid: false,
        country: 'IN',
        lineType: 'MOBILE',
        lineStatus: 'SUSPENDED',
        riskLevel: 'BLOCKED',
        isDisposable: false,
        isVoip: false,
        reachable: false,
        safeErrorMessage: 'This mobile number is blocked from registering on SurplusX.',
      };
    }

    const isDisposable = KNOWN_DISPOSABLE_PREFIXES.some((p) => normalized.startsWith(p));
    if (isDisposable) {
      return {
        phone,
        normalizedPhone: normalized,
        nationalNumber,
        formattedDisplay: phone,
        maskedPhone: this.maskPhone(normalized),
        valid: false,
        country: 'IN',
        lineType: 'VOIP',
        lineStatus: 'UNREACHABLE',
        riskLevel: 'HIGH_RISK',
        isDisposable: true,
        isVoip: true,
        reachable: false,
        safeErrorMessage: 'Disposable or virtual temporary numbers are not accepted on SurplusX.',
      };
    }

    const prefix = nationalNumber.slice(0, 2);
    const match = INDIA_CARRIER_PREFIXES.find((c) => c.prefix === prefix);
    const carrier = match ? match.carrier : 'India Telecom Operator';

    return {
      phone,
      normalizedPhone: normalized,
      nationalNumber,
      formattedDisplay: phone,
      maskedPhone: this.maskPhone(normalized),
      valid: true,
      country: 'IN',
      carrier,
      lineType: 'MOBILE',
      lineStatus: 'ACTIVE',
      riskLevel: 'LOW_RISK',
      isDisposable: false,
      isVoip: false,
      reachable: true,
    };
  }

  /**
   * Send Automated Exotel Voice Call OTP
   */
  public async sendOTP(params: {
    phone: string;
    purpose?: OTPPurpose;
    clientIp: string;
    deviceId?: string;
  }) {
    const result = await exotelVoiceOtpService.sendVoiceOtp(params);
    return {
      ...result,
      status: result.success ? ('VOICE_CALL_INITIATED' as const) : (result.status as any),
      verificationSessionId: result.sessionId,
      deliveryMethod: 'VOICE_CALL' as const,
    };
  }

  public async sendVoiceCallOTP(params: {
    phone: string;
    purpose?: OTPPurpose;
    clientIp: string;
    deviceId?: string;
  }) {
    return this.sendOTP(params);
  }

  /**
   * Verify Exotel Voice Call OTP
   */
  public async verifyOTP(params: {
    sessionId?: string;
    verificationSessionId?: string;
    phone: string;
    otpCode?: string;
    otp?: string;
    purpose?: OTPPurpose;
    clientIp: string;
  }) {
    const result = await exotelVoiceOtpService.verifyVoiceOtp(params);
    if (result.success && result.phoneVerification) {
      this.phoneVerifications.set(result.normalizedPhone || '', result.phoneVerification);
    }
    return result;
  }

  public async verifyVoiceCallOTP(params: {
    sessionId?: string;
    verificationSessionId?: string;
    phone: string;
    otpCode?: string;
    otp?: string;
    purpose?: OTPPurpose;
    clientIp: string;
  }) {
    return this.verifyOTP(params);
  }

  public async resendOTP(params: {
    phone: string;
    purpose?: OTPPurpose;
    clientIp: string;
    deviceId?: string;
  }) {
    return this.sendOTP(params);
  }

  public verifyToken(token: string, expectedPhone: string, expectedPurpose: OTPPurpose = 'SIGNUP'): boolean {
    return exotelVoiceOtpService.verifyToken(token, expectedPhone, expectedPurpose);
  }

  public isNumberBlocked(normalizedPhone: string): boolean {
    const blocked = this.blockedNumbers.get(normalizedPhone);
    if (!blocked) return false;
    if (blocked.status !== 'ACTIVE') return false;
    if (blocked.expiresAt && new Date(blocked.expiresAt).getTime() < Date.now()) {
      blocked.status = 'EXPIRED';
      return false;
    }
    return true;
  }

  public blockNumber(params: {
    phone: string;
    reasonCode: BlockedPhoneReason;
    notes?: string;
    createdBy: string;
    expiresInDays?: number;
  }) {
    const norm = this.normalizePhone(params.phone);
    if (!norm.valid || !norm.normalized) {
      return { success: false, error: 'Invalid phone number.' };
    }

    const expiresAt = params.expiresInDays
      ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const record: BlockedPhone = {
      id: `blk_${Date.now().toString(36)}`,
      normalizedPhone: norm.normalized,
      reasonCode: params.reasonCode,
      status: 'ACTIVE',
      notes: params.notes,
      createdBy: params.createdBy,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    this.blockedNumbers.set(norm.normalized, record);
    return { success: true, blockedPhone: record };
  }

  public unblockNumber(phone: string) {
    const norm = this.normalizePhone(phone);
    if (!norm.valid || !norm.normalized) {
      return { success: false, error: 'Invalid phone number.' };
    }
    const blocked = this.blockedNumbers.get(norm.normalized);
    if (blocked) {
      blocked.status = 'REVOKED';
      return { success: true };
    }
    return { success: false, error: 'Number was not found in blocked registry.' };
  }

  public getBlockedNumbers(): BlockedPhone[] {
    return Array.from(this.blockedNumbers.values());
  }

  public adminOverrideVerification(params: {
    phone: string;
    adminId: string;
    reason: string;
    evidenceReference: string;
  }) {
    const norm = this.normalizePhone(params.phone);
    if (!norm.valid || !norm.normalized) {
      return { success: false, error: 'Invalid phone number to override.' };
    }

    if (!params.reason || params.reason.trim().length < 5) {
      return { success: false, error: 'Admin override requires a documented justification reason.' };
    }

    const normalized = norm.normalized;
    const nowIso = new Date().toISOString();

    const verif: PhoneVerification = {
      id: `pv_override_${Date.now().toString(36)}`,
      phone: params.phone,
      normalizedPhone: normalized,
      provider: 'EXOTEL_VOICE',
      verificationStatus: 'VERIFIED',
      riskLevel: 'LOW_RISK',
      carrier: 'Manual Admin Verification',
      lineType: 'MOBILE',
      lineStatus: 'ACTIVE',
      country: 'IN',
      attemptCount: 1,
      verifiedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.phoneVerifications.set(normalized, verif);
    return { success: true, phoneVerification: verif };
  }

  public getPhoneVerificationRecord(phone: string): PhoneVerification | null {
    const norm = this.normalizePhone(phone);
    if (!norm.valid || !norm.normalized) return null;
    return this.phoneVerifications.get(norm.normalized) || null;
  }

  public isPhoneVerified(phone: string): boolean {
    const rec = this.getPhoneVerificationRecord(phone);
    return rec?.verificationStatus === 'VERIFIED';
  }
}

export const phoneVerificationService = PhoneVerificationService.getInstance();
