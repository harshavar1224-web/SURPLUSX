import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Building,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Store,
  HeartHandshake,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldQuestion,
  Fingerprint,
  Radio,
  Smartphone,
  Timer,
  RefreshCw,
  Edit2,
  Check,
  Send,
  HelpCircle,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';
import { UserRole, PhoneIntelligence, EmailVerificationStatus } from '../../types';
import {
  normalizeEmailClient,
  maskEmailClient,
  validateEmailClient,
  checkEmailApi,
  sendEmailVerificationApi,
  verifyEmailCodeApi,
  normalizeIndianPhoneClient,
  formatIndianPhoneDisplayClient,
  checkIdentityAvailabilityApi,
  resetPasswordApi,
  lookupPhoneApi,
  sendPhoneOTPApi,
  verifyPhoneOTPApi,
} from '../../services/identityClient';

type AuthViewMode = 'login' | 'signup' | 'forgot_password';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    loginWithCredentials,
    signup,
    pendingIntent,
    setPendingIntent,
    triggerToast,
  } = useApp();

  // Active view: login, signup, or forgot_password
  const [viewMode, setViewMode] = useState<AuthViewMode>(authMode === 'signup' ? 'signup' : 'login');

  // Sign In Form States (NO ROLE SELECTOR - SERVER AUTHORITATIVE)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form States
  const [selectedRole, setSelectedRole] = useState<'CONSUMER' | 'BUSINESS' | 'NGO'>('CONSUMER');
  const [fullName, setFullName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [orgName, setOrgName] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [signupPassword, setSignupPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Request tracking refs for race condition prevention during typing
  const latestEmailQueryRef = useRef('');
  const latestAvailQueryRef = useRef('');
  const latestPhoneQueryRef = useRef('');

  // Email Authoritative Verification States
  const [isCheckingEmailDomain, setIsCheckingEmailDomain] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<{
    valid?: boolean;
    domainValid?: boolean;
    domain?: string;
    isDisposable?: boolean;
    status?: EmailVerificationStatus;
    emailRegistered?: boolean;
    verificationRequired?: boolean;
    existingRole?: UserRole;
    message?: string;
    error?: string;
  }>({});
  const [emailOtpSessionId, setEmailOtpSessionId] = useState<string | null>(null);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [maskedEmailDisplay, setMaskedEmailDisplay] = useState<string | null>(null);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null);
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);
  const [emailVerificationError, setEmailVerificationError] = useState<string | null>(null);

  // Phone Intelligence & Real-Time Verification States
  const [phoneIntelligence, setPhoneIntelligence] = useState<PhoneIntelligence | null>(null);
  const [isLookingUpPhone, setIsLookingUpPhone] = useState(false);
  const [phoneOtpSessionId, setPhoneOtpSessionId] = useState<string | null>(null);
  const [phoneOtpInput, setPhoneOtpInput] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerificationToken, setPhoneVerificationToken] = useState<string | null>(null);
  const [phoneResendCooldown, setPhoneResendCooldown] = useState(0);
  const [phoneVerificationError, setPhoneVerificationError] = useState<string | null>(null);

  // Real-time Identity Availability Check states
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    emailChecked?: boolean;
    emailValid?: boolean;
    emailAvailable?: boolean;
    emailRegistered?: boolean;
    phoneChecked?: boolean;
    phoneValid?: boolean;
    phoneAvailable?: boolean;
    phoneRegistered?: boolean;
    conflictType?: string;
    errorMessage?: string;
    existingRole?: UserRole;
  }>({});

  // Forgot Password / Recovery States
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'IDENTIFY' | 'SET_NEW_PASSWORD'>('IDENTIFY');
  const [simulatedOtpHint, setSimulatedOtpHint] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Email resend cooldown timer effect
  useEffect(() => {
    if (emailResendCooldown <= 0) return;
    const timer = setInterval(() => {
      setEmailResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [emailResendCooldown]);

  // Phone resend cooldown timer effect
  useEffect(() => {
    if (phoneResendCooldown <= 0) return;
    const timer = setInterval(() => {
      setPhoneResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneResendCooldown]);

  // Keep viewMode in sync when external authMode triggers open
  useEffect(() => {
    if (isAuthModalOpen) {
      setViewMode(authMode === 'signup' ? 'signup' : 'login');
      setErrorMsg('');
      setEmailVerificationError(null);
      setPhoneVerificationError(null);
    }
  }, [isAuthModalOpen, authMode]);

  // Real-time Email Domain & SurplusX Registration Check with Race Condition Protection
  useEffect(() => {
    if (viewMode !== 'signup') return;
    const norm = normalizeEmailClient(emailInput);
    latestEmailQueryRef.current = norm;

    if (!norm) {
      setEmailCheckResult({});
      setIsCheckingEmailDomain(false);
      return;
    }

    if (!validateEmailClient(norm)) {
      setEmailCheckResult({
        valid: false,
        status: 'INVALID_FORMAT',
        message: 'Enter a valid email address.',
      });
      setIsCheckingEmailDomain(false);
      return;
    }

    setIsCheckingEmailDomain(true);
    const timer = setTimeout(async () => {
      try {
        const res = await checkEmailApi(norm);
        if (latestEmailQueryRef.current === norm) {
          setEmailCheckResult(res);
        }
      } catch {
        // Fallback
      } finally {
        if (latestEmailQueryRef.current === norm) {
          setIsCheckingEmailDomain(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [emailInput, viewMode]);

  // Real-time Phone Intelligence Lookup with Race Condition Protection
  useEffect(() => {
    if (viewMode !== 'signup') return;
    const phoneRes = normalizeIndianPhoneClient(phoneInput);
    latestPhoneQueryRef.current = phoneRes.normalized;

    if (!phoneRes.valid) {
      setPhoneIntelligence(null);
      setIsLookingUpPhone(false);
      return;
    }

    setIsLookingUpPhone(true);
    const timer = setTimeout(async () => {
      try {
        const res = await lookupPhoneApi(phoneRes.normalized);
        if (latestPhoneQueryRef.current === phoneRes.normalized && res.intelligence) {
          setPhoneIntelligence(res.intelligence);
        }
      } catch {
        // Silent catch
      } finally {
        if (latestPhoneQueryRef.current === phoneRes.normalized) {
          setIsLookingUpPhone(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [phoneInput, viewMode]);

  // Debounced real-time availability check when email, phone, or role changes during signup
  useEffect(() => {
    if (viewMode !== 'signup') return;

    const normEmail = normalizeEmailClient(emailInput);
    const emailValid = validateEmailClient(normEmail);
    const phoneRes = normalizeIndianPhoneClient(phoneInput);
    const queryKey = `${normEmail}|${phoneRes.normalized}|${selectedRole}`;
    latestAvailQueryRef.current = queryKey;

    if (!normEmail && !phoneInput) {
      setAvailabilityResult({});
      setIsCheckingAvailability(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingAvailability(true);
      try {
        const res = await checkIdentityAvailabilityApi({
          email: emailValid ? normEmail : undefined,
          phone: phoneRes.valid ? phoneRes.normalized : undefined,
          role: selectedRole,
        });

        if (latestAvailQueryRef.current === queryKey) {
          setAvailabilityResult({
            emailChecked: Boolean(normEmail && emailValid),
            emailValid,
            emailAvailable: res.emailAvailable,
            emailRegistered: res.emailRegistered,
            phoneChecked: Boolean(phoneInput && phoneRes.valid),
            phoneValid: phoneRes.valid,
            phoneAvailable: res.phoneAvailable,
            phoneRegistered: res.phoneRegistered,
            conflictType: res.conflictType,
            errorMessage: res.errorMessage,
            existingRole: res.existingEmailRole || res.existingPhoneRole,
          });
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (latestAvailQueryRef.current === queryKey) {
          setIsCheckingAvailability(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [emailInput, phoneInput, selectedRole, viewMode]);

  if (!isAuthModalOpen) return null;

  // --------------------------------------------------------------------------
  // Handlers for Email Verification
  // --------------------------------------------------------------------------

  const handleSendEmailVerification = async () => {
    setEmailVerificationError(null);
    const normEmail = normalizeEmailClient(emailInput);
    if (!validateEmailClient(normEmail)) {
      setEmailVerificationError('Please enter a valid email address before requesting verification.');
      return;
    }

    if (emailCheckResult.domainValid === false) {
      setEmailVerificationError(emailCheckResult.message || 'Email domain is invalid or unreachable.');
      return;
    }

    setIsSendingEmailOtp(true);
    try {
      const res = await sendEmailVerificationApi({ email: normEmail });
      if (!res.success) {
        setEmailVerificationError(res.error || 'Failed to dispatch email verification code.');
      } else {
        setEmailOtpSent(true);
        setEmailOtpSessionId(res.sessionId || null);
        setEmailResendCooldown(res.resendAvailableInSeconds || 30);
        setMaskedEmailDisplay(res.maskedEmail || maskEmailClient(normEmail));
        // Strict Security: Never set or autofill OTP in frontend state
        setEmailOtpInput('');
        triggerToast('Verification code sent to your email inbox.', 'info');
      }
    } catch (err: any) {
      setEmailVerificationError(err.message || 'Network error sending email verification code.');
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    setEmailVerificationError(null);
    const normEmail = normalizeEmailClient(emailInput);
    if (!validateEmailClient(normEmail)) {
      setEmailVerificationError('Invalid email format.');
      return;
    }
    if (!emailOtpInput || emailOtpInput.trim().length !== 6) {
      setEmailVerificationError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsVerifyingEmailOtp(true);
    try {
      const res = await verifyEmailCodeApi({
        sessionId: emailOtpSessionId || undefined,
        email: normEmail,
        code: emailOtpInput.trim(),
      });

      if (!res.success) {
        setEmailVerificationError(res.error || 'Incorrect verification code. Please try again.');
      } else {
        setEmailVerified(true);
        setEmailVerificationToken(res.verificationToken || null);
        triggerToast('Email verified successfully! ✓', 'success');
      }
    } catch (err: any) {
      setEmailVerificationError(err.message || 'Failed to verify email code.');
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  const handleResetEmail = () => {
    setEmailVerified(false);
    setEmailVerificationToken(null);
    setEmailOtpSent(false);
    setEmailOtpInput('');
    setEmailOtpSessionId(null);
    setMaskedEmailDisplay(null);
    setEmailVerificationError(null);
  };

  // --------------------------------------------------------------------------
  // Handlers for Phone Verification
  // --------------------------------------------------------------------------

  const handleSendPhoneOtp = async () => {
    setPhoneVerificationError(null);
    const phoneRes = normalizeIndianPhoneClient(phoneInput);
    if (!phoneRes.valid) {
      setPhoneVerificationError(phoneRes.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (phoneIntelligence?.lineStatus === 'INACTIVE' || phoneIntelligence?.lineStatus === 'UNREACHABLE') {
      setPhoneVerificationError(phoneIntelligence.safeErrorMessage || 'This mobile number is not active or reachable.');
      return;
    }

    setIsSendingPhoneOtp(true);
    try {
      const res = await sendPhoneOTPApi({
        phone: phoneRes.normalized,
        purpose: 'SIGNUP',
      });

      if (!res.success) {
        setPhoneVerificationError(res.error || 'Unable to send verification OTP.');
      } else {
        setPhoneOtpSent(true);
        setPhoneOtpSessionId(res.sessionId || res.verificationSessionId || null);
        setPhoneResendCooldown(res.resendAvailableInSeconds || 45);
        triggerToast(`Verification code sent via SMS to ${formatIndianPhoneDisplayClient(phoneRes.normalized)}`, 'info');
      }
    } catch (err: any) {
      setPhoneVerificationError(err.message || 'Network error while sending verification OTP.');
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setPhoneVerificationError(null);
    const phoneRes = normalizeIndianPhoneClient(phoneInput);
    if (!phoneRes.valid) {
      setPhoneVerificationError('Invalid mobile number format.');
      return;
    }
    if (!phoneOtpInput || phoneOtpInput.trim().length !== 6) {
      setPhoneVerificationError('Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifyingPhoneOtp(true);
    try {
      const res = await verifyPhoneOTPApi({
        sessionId: phoneOtpSessionId || undefined,
        verificationSessionId: phoneOtpSessionId || undefined,
        phone: phoneRes.normalized,
        otpCode: phoneOtpInput.trim(),
        otp: phoneOtpInput.trim(),
        purpose: 'SIGNUP',
      });

      if (!res.success) {
        setPhoneVerificationError(res.error || 'Invalid or expired verification code.');
      } else {
        setPhoneVerified(true);
        setPhoneVerificationToken(res.verificationToken || null);
        triggerToast('Mobile number verified successfully! ✓', 'success');
      }
    } catch (err: any) {
      setPhoneVerificationError(err.message || 'Failed to verify OTP.');
    } finally {
      setIsVerifyingPhoneOtp(false);
    }
  };

  const handleResetPhone = () => {
    setPhoneVerified(false);
    setPhoneVerificationToken(null);
    setPhoneOtpSent(false);
    setPhoneOtpInput('');
    setPhoneOtpSessionId(null);
    setPhoneVerificationError(null);
  };

  // Authoritative Sign In (NO ROLE SELECTOR)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your registered email address or mobile number.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithCredentials(loginIdentifier.trim(), loginPassword);
      if (res.success) {
        setIsAuthModalOpen(false);
      } else {
        setErrorMsg(res.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Transactional Sign Up (Strict 1 Verified Email + 1 Verified Mobile + 1 Role)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field validations
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }

    const normEmail = normalizeEmailClient(emailInput);
    if (!validateEmailClient(normEmail)) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    const phoneRes = normalizeIndianPhoneClient(phoneInput);
    if (!phoneRes.valid) {
      setErrorMsg(phoneRes.error || 'Please provide a valid 10-digit Indian mobile number.');
      return;
    }

    // Strict Email Verification Requirement
    if (!emailVerified || !emailVerificationToken) {
      setErrorMsg('Please verify your email address with the verification code before registering.');
      return;
    }

    // Strict Phone Verification Requirement
    if (!phoneVerified || !phoneVerificationToken) {
      setErrorMsg('Please verify your mobile number with the SMS OTP code before registering.');
      return;
    }

    if (selectedRole !== 'CONSUMER' && !orgName.trim()) {
      setErrorMsg(
        selectedRole === 'BUSINESS'
          ? 'Please provide your registered Business / Store name.'
          : 'Please provide your registered NGO entity name.'
      );
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('You must agree to the Terms of Service & SurplusX Food Safety Pledge.');
      return;
    }

    // Check if availability check flagged any conflict
    if (availabilityResult.conflictType && availabilityResult.conflictType !== 'NONE') {
      setErrorMsg(availabilityResult.errorMessage || 'Identity conflict detected. Please resolve before continuing.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup(
        fullName.trim(),
        normEmail,
        selectedRole,
        phoneRes.normalized,
        orgName.trim() || undefined,
        signupPassword,
        emailVerificationToken,
        phoneVerificationToken
      );

      if (res.success) {
        setIsAuthModalOpen(false);
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Request Password Reset
  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!recoveryIdentifier.trim()) {
      setErrorMsg('Please enter your registered email address or mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: recoveryIdentifier.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'No SurplusX account found with this identifier.');
      } else {
        setSimulatedOtpHint(data.simulatedOtp || '8492');
        setRecoveryOtp(data.simulatedOtp || '8492');
        setRecoveryStep('SET_NEW_PASSWORD');
        triggerToast('Recovery verification code sent!', 'info');
      }
    } catch (err: any) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!recoveryNewPassword || recoveryNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordApi({
        identifier: recoveryIdentifier.trim(),
        newPassword: recoveryNewPassword,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to reset password.');
      } else {
        triggerToast('Password reset successfully! Please sign in with your new password.', 'success');
        setViewMode('login');
        setLoginIdentifier(recoveryIdentifier.trim());
        setLoginPassword(recoveryNewPassword);
        setRecoveryStep('IDENTIFY');
      }
    } catch (err: any) {
      setErrorMsg('Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
  };

  const normalizedPhonePreview = normalizeIndianPhoneClient(phoneInput);
  const normalizedEmailPreview = normalizeEmailClient(emailInput);
  const isEmailFormatValid = validateEmailClient(normalizedEmailPreview);

  const canSubmitSignup =
    emailVerified &&
    phoneVerified &&
    Boolean(emailVerificationToken) &&
    Boolean(phoneVerificationToken) &&
    fullName.trim().length >= 2 &&
    signupPassword.length >= 6 &&
    agreedTerms &&
    !isLoading;

  return (
    <div
      id="surplusx-auth-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <SurplusXLogo size="md" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                {viewMode === 'login'
                  ? 'Sign In to SurplusX'
                  : viewMode === 'signup'
                  ? 'Create SurplusX Account'
                  : 'Account Recovery'}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Intent Notice */}
        {pendingIntent && (
          <div className="bg-emerald-50 border-b border-emerald-200/80 px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {pendingIntent.description ||
                  `Action pending: ${pendingIntent.type.replace(/_/g, ' ')}. Sign in to complete.`}
              </span>
            </div>
            <button
              onClick={() => setPendingIntent(null)}
              className="text-[11px] text-emerald-600 hover:underline font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Mode Switcher Tabs */}
          {viewMode !== 'forgot_password' && (
            <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  viewMode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm shadow-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('signup');
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  viewMode === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm shadow-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Message Display */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. AUTHORITATIVE SIGN IN MODE (NO ROLE SELECTOR)                          */}
          {/* ========================================================================= */}
          {viewMode === 'login' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Fingerprint className="w-4 h-4 text-emerald-600" />
                  <span>Authoritative Single-Sign-On</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Your primary role is permanently registered on the server. Simply sign in with your email or mobile.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Registered Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. priya@gmail.com or 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot_password');
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 2. CREATE ACCOUNT MODE (STRICT ONE VERIFIED EMAIL + ONE VERIFIED MOBILE)  */}
          {/* ========================================================================= */}
          {viewMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Account Role Selector (PUBLIC ADMIN SIGNUP STRICTLY PROHIBITED) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    1. Select Permanent SurplusX Role
                  </label>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Role Permanently Locked
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('CONSUMER')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'CONSUMER'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <ShoppingBag
                      className={`w-4 h-4 mb-1.5 ${
                        selectedRole === 'CONSUMER' ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="text-xs font-extrabold text-slate-900">Consumer</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Buy surplus food nearby
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('BUSINESS')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'BUSINESS'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Store
                      className={`w-4 h-4 mb-1.5 ${
                        selectedRole === 'BUSINESS' ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="text-xs font-extrabold text-slate-900">Business</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Sell surplus & cut food waste
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('NGO')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'NGO'
                        ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <HeartHandshake
                      className={`w-4 h-4 mb-1.5 ${
                        selectedRole === 'NGO' ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="text-xs font-extrabold text-slate-900">NGO Partner</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Rescue & distribute meals
                    </div>
                  </button>
                </div>
              </div>

              {/* SPECIFICATION RULE: Identity Conflict Prompt with Redirect */}
              {availabilityResult.conflictType === 'SAME_IDENTITY_DIFFERENT_ROLE' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        {availabilityResult.errorMessage ||
                          `This email/phone is already registered with an existing account. One SurplusX account can have only one role.`}
                      </p>
                      <p className="text-[11px] text-amber-700 mt-1">
                        SurplusX does not permit role-switching or multiple roles per identity. Please sign in to your existing account.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('login');
                        setLoginIdentifier(emailInput || phoneInput);
                        setErrorMsg('');
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Sign In to Existing Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailInput('');
                        setPhoneInput('');
                        handleResetEmail();
                        handleResetPhone();
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
                    >
                      Use Different Details
                    </button>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* 2. EMAIL VALIDATION & VERIFICATION SECTION                            */}
              {/* Flow: Syntax -> DNS/MX Check -> Verification Email -> Code Verified  */}
              {/* ===================================================================== */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>2. Email Address (Verified Mailbox)</span>
                    {emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" /> Verified & Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Verification Required
                      </span>
                    )}
                  </label>

                  {/* Status Indicator (DO NOT DISPLAY "Available" PREMATURELY) */}
                  {emailInput && (
                    <div>
                      {emailVerified ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified & Available</span>
                        </span>
                      ) : !isEmailFormatValid ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span>Enter a valid email address</span>
                        </span>
                      ) : isCheckingEmailDomain || isCheckingAvailability ? (
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                          <span>Checking...</span>
                        </span>
                      ) : emailCheckResult.status === 'DOMAIN_INVALID' || emailCheckResult.domainValid === false ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Email domain cannot receive email</span>
                        </span>
                      ) : emailCheckResult.status === 'REGISTERED' || availabilityResult.conflictType === 'EMAIL_TAKEN' || availabilityResult.conflictType === 'SAME_IDENTITY_DIFFERENT_ROLE' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Already registered</span>
                        </span>
                      ) : emailCheckResult.status === 'NOT_REGISTERED' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>Email not registered</span>
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (emailVerified) {
                          handleResetEmail();
                        }
                      }}
                      disabled={emailVerified}
                      placeholder="e.g. user@gmail.com"
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                        emailVerified
                          ? 'border-emerald-300 bg-emerald-50/50 text-slate-800 font-semibold'
                          : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500'
                      } outline-hidden transition-all`}
                    />
                  </div>

                  {emailVerified ? (
                    <button
                      type="button"
                      onClick={handleResetEmail}
                      className="px-2.5 py-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      title="Change email address"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendEmailVerification}
                      disabled={
                        isSendingEmailOtp ||
                        !isEmailFormatValid ||
                        isCheckingEmailDomain ||
                        emailCheckResult.domainValid === false ||
                        emailCheckResult.status === 'REGISTERED' ||
                        availabilityResult.conflictType === 'EMAIL_TAKEN' ||
                        availabilityResult.conflictType === 'SAME_IDENTITY_DIFFERENT_ROLE'
                      }
                      className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {isSendingEmailOtp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{emailOtpSent ? 'Resend Code' : 'Send Code'}</span>
                    </button>
                  )}
                </div>

                {/* Inline Notice if Email is Already Registered */}
                {(emailCheckResult.status === 'REGISTERED' || availabilityResult.conflictType === 'EMAIL_TAKEN' || availabilityResult.conflictType === 'SAME_IDENTITY_DIFFERENT_ROLE') && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-medium">This email is already registered with SurplusX.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('login');
                        setLoginIdentifier(emailInput);
                        setErrorMsg('');
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {/* Email Verification Error Message */}
                {emailVerificationError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{emailVerificationError}</span>
                  </div>
                )}

                {/* Email Verification Code Input Area */}
                {emailOtpSent && !emailVerified && (
                  <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span>📧 Verification code sent</span>
                      </div>
                      {emailResendCooldown > 0 ? (
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <Timer className="w-3 h-3 text-slate-400" />
                          <span>Resend in {emailResendCooldown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendEmailVerification}
                          disabled={isSendingEmailOtp}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      We sent a 6-digit verification code to: <strong className="font-semibold text-slate-900">{maskedEmailDisplay || emailInput}</strong>. Please check your email inbox to view the code.
                    </p>

                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="text"
                        value={emailOtpInput}
                        onChange={(e) => setEmailOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        placeholder="••••••"
                        className="w-32 text-center font-mono font-bold tracking-widest text-sm px-3 py-2 rounded-xl border border-emerald-300 bg-white focus:border-emerald-600 outline-hidden shadow-2xs"
                        autoFocus
                      />

                      <button
                        type="button"
                        onClick={handleVerifyEmailCode}
                        disabled={isVerifyingEmailOtp || emailOtpInput.length !== 6}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        {isVerifyingEmailOtp ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Verify Email</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-emerald-100/80">
                      <span>Expires in 5 minutes</span>
                      <span>Never share this code with anyone</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ===================================================================== */}
              {/* 3. MOBILE NUMBER VALIDATION & OTP VERIFICATION SECTION                */}
              {/* Flow: Normalize E.164 -> Network/Line Check -> SMS OTP -> OTP Verified */}
              {/* ===================================================================== */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>3. Mobile Number (E.164 Indian Mobile)</span>
                    {phoneVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" /> Verified & Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Verification Required
                      </span>
                    )}
                  </label>

                  {/* Phone Status Indicator */}
                  {phoneInput && (
                    <div>
                      {phoneVerified ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified & Available</span>
                        </span>
                      ) : !normalizedPhonePreview.valid ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span>Invalid format</span>
                        </span>
                      ) : isLookingUpPhone || isCheckingAvailability ? (
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                          <span>Checking...</span>
                        </span>
                      ) : phoneIntelligence?.lineStatus === 'INACTIVE' || phoneIntelligence?.lineStatus === 'UNREACHABLE' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Inactive Number</span>
                        </span>
                      ) : phoneIntelligence?.isDisposable ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Disposable/VOIP Not Supported</span>
                        </span>
                      ) : availabilityResult.conflictType === 'PHONE_TAKEN' || availabilityResult.conflictType === 'SAME_IDENTITY_DIFFERENT_ROLE' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Already registered</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-slate-500" />
                          <span>Mobile not registered</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value);
                        if (phoneVerified) {
                          handleResetPhone();
                        }
                      }}
                      disabled={phoneVerified}
                      placeholder="9876543210 or +91 98765 43210"
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                        phoneVerified
                          ? 'border-emerald-300 bg-emerald-50/50 text-slate-800 font-semibold'
                          : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500'
                      } outline-hidden transition-all`}
                    />
                  </div>

                  {phoneVerified ? (
                    <button
                      type="button"
                      onClick={handleResetPhone}
                      className="px-2.5 py-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      title="Change mobile number"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={
                        isSendingPhoneOtp ||
                        !normalizedPhonePreview.valid ||
                        isLookingUpPhone ||
                        phoneIntelligence?.lineStatus === 'INACTIVE' ||
                        phoneIntelligence?.lineStatus === 'UNREACHABLE' ||
                        phoneIntelligence?.isDisposable ||
                        availabilityResult.conflictType === 'PHONE_TAKEN' ||
                        availabilityResult.conflictType === 'SAME_IDENTITY_DIFFERENT_ROLE'
                      }
                      className="px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {isSendingPhoneOtp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5" />
                      )}
                      <span>{phoneOtpSent ? 'Resend OTP' : 'Send OTP'}</span>
                    </button>
                  )}
                </div>

                {/* Phone Intelligence Badges (Carrier, Reachability, Risk) */}
                {phoneInput && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {normalizedPhonePreview.valid ? (
                      <span className="text-[10px] text-slate-600 font-medium">
                        E.164: <strong className="font-mono text-slate-800">{formatIndianPhoneDisplayClient(normalizedPhonePreview.normalized)}</strong>
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600">
                        {normalizedPhonePreview.error || 'Enter 10 digits starting with 6, 7, 8, or 9'}
                      </span>
                    )}

                    {phoneIntelligence && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {phoneIntelligence.carrier || 'Indian Mobile Network'}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {phoneIntelligence.lineType}
                        </span>
                        {phoneIntelligence.lineStatus === 'ACTIVE' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active Number
                          </span>
                        )}
                        {phoneIntelligence.lineStatus === 'INACTIVE' && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            Inactive / Unassigned
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Phone Verification Error Notice */}
                {phoneVerificationError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{phoneVerificationError}</span>
                  </div>
                )}

                {/* OTP Input Section (active when OTP is sent and not yet verified) */}
                {phoneOtpSent && !phoneVerified && (
                  <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
                        <Smartphone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Verification code sent to <strong className="font-mono text-emerald-800">{phoneIntelligence?.maskedPhone || (phoneInput ? `******${phoneInput.slice(-4)}` : '******')}</strong></span>
                      </div>
                      {phoneResendCooldown > 0 ? (
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <Timer className="w-3 h-3 text-slate-400" />
                          <span>Resend in {phoneResendCooldown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={isSendingPhoneOtp}
                          className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Resend SMS
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={phoneOtpInput}
                          onChange={(e) => setPhoneOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          placeholder="_ _ _ _ _ _"
                          className="w-full sm:w-36 text-center font-mono font-bold tracking-[0.3em] text-base px-3 py-2 rounded-xl border border-emerald-300 bg-white focus:border-emerald-600 outline-hidden shadow-2xs placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400"
                          autoFocus
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={isVerifyingPhoneOtp || phoneOtpInput.length !== 6}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isVerifyingPhoneOtp ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>VERIFY MOBILE</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
                      <span>SMS OTP valid for 10 minutes via telecom SMS.</span>
                      <span className="font-semibold text-emerald-700">Official SMS Gateway</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Name & Org Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name / Contact Person
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Harsha Vardhan"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bangalore, India"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {selectedRole !== 'CONSUMER' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {selectedRole === 'BUSINESS' ? 'Store / Business Name' : 'Registered NGO Name'}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder={
                        selectedRole === 'BUSINESS'
                          ? 'e.g. Daily Fresh Organic Bakery'
                          : 'e.g. Feeding India Trust'
                      }
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="agree-terms" className="text-[11px] text-slate-600 leading-tight">
                  I understand that my role will be <span className="font-bold text-slate-800">permanently bound</span> to
                  this verified email and verified mobile number, and I agree to the SurplusX{' '}
                  <span className="font-semibold text-emerald-700">Terms of Service</span>.
                </label>
              </div>

              {/* Pre-submission Dual-Verification Checklist Guidance */}
              {(!emailVerified || !phoneVerified) && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dual-Verification Requirements:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
                      emailVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      {emailVerified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span>1. Verify Email Code</span>
                    </div>

                    <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
                      phoneVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      {phoneVerified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
                      <span>2. Verify Mobile OTP</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmitSignup}
                className={`w-full py-3.5 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  canSubmitSignup
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/20 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      Create Permanent {selectedRole === 'CONSUMER' ? 'Consumer' : selectedRole === 'BUSINESS' ? 'Business' : 'NGO'} Account
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 3. FORGOT PASSWORD / RECOVERY (SPECIFICATION #25, #31)                    */}
          {/* ========================================================================= */}
          {viewMode === 'forgot_password' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Account Password Recovery</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Reset your password without creating a new account or losing your permanently locked SurplusX role.
                </p>
              </div>

              {recoveryStep === 'IDENTIFY' ? (
                <form onSubmit={handleRequestRecovery} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Enter Registered Email or Mobile Number
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        placeholder="e.g. priya@gmail.com or 9876543210"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {isLoading ? 'Searching...' : 'Send Recovery OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    Enter OTP code <strong className="font-mono font-bold">{simulatedOtpHint}</strong> and choose your new password.
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Verification OTP</label>
                    <input
                      type="text"
                      value={recoveryOtp}
                      onChange={(e) => setRecoveryOtp(e.target.value)}
                      placeholder="8492"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
                    <input
                      type="password"
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {isLoading ? 'Resetting...' : 'Set New Password & Sign In'}
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrorMsg('');
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* Continue Browsing Action */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 py-1.5 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>Continue browsing as guest</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
