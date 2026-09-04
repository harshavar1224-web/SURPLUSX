/**
 * SurplusX MSG91 OTP Client SDK
 * 
 * Implements client-side MSG91 OTP operations:
 * - Direct, secure backend API proxy (/api/auth/otp/msg91/*) to keep MSG91_TOKEN_AUTH protected on the server.
 * - Public Widget ID accessed via import.meta.env.VITE_MSG91_WIDGET_ID or server config endpoint.
 * - Full support for send, resend/retry, and verification flows.
 */

declare global {
  interface Window {
    initSendOTP?: (config: any) => void;
    sendOtp?: (identifier: string, success: (data: any) => void, failure: (err: any) => void) => void;
    retryOtp?: (channel: number, success: (data: any) => void, failure: (err: any) => void, reqId?: string | null) => void;
    verifyOtp?: (otp: string, success: (data: any) => void, failure: (err: any) => void, reqId?: string | null) => void;
    isCaptchaVerified?: () => boolean;
  }
}

export interface Msg91SendResult {
  success: boolean;
  reqId?: string;
  normalizedPhone?: string;
  maskedPhone?: string;
  message?: string;
  error?: string;
  isMockFallback?: boolean;
}

export interface Msg91RetryResult {
  success: boolean;
  reqId?: string;
  message?: string;
  error?: string;
  isMockFallback?: boolean;
}

export interface Msg91VerifyResult {
  success: boolean;
  verificationToken?: string;
  normalizedPhone?: string;
  message?: string;
  error?: string;
  isMockFallback?: boolean;
}

let lastClientReqId: string | null = null;

/**
 * Get public widget ID configured in environment (safe for client-side)
 */
export function getPublicWidgetId(): string {
  try {
    return (import.meta as any).env?.VITE_MSG91_WIDGET_ID || '';
  } catch {
    return '';
  }
}

/**
 * Fetch public MSG91 configuration (widget ID and configuration status, NEVER tokenAuth)
 */
export async function getMsg91PublicConfig(): Promise<{ widgetId: string; isConfigured: boolean }> {
  try {
    const res = await fetch('/api/auth/otp/msg91/config');
    const data = await res.json();
    return {
      widgetId: data?.widgetId || getPublicWidgetId(),
      isConfigured: Boolean(data?.isConfigured),
    };
  } catch {
    return {
      widgetId: getPublicWidgetId(),
      isConfigured: false,
    };
  }
}

/**
 * Request SMS OTP via MSG91
 */
export async function sendMsg91PhoneOtp(phone: string): Promise<Msg91SendResult> {
  try {
    const res = await fetch('/api/auth/otp/msg91/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || 'Failed to send SMS OTP via MSG91.',
      };
    }

    if (data.reqId) {
      lastClientReqId = data.reqId;
    }

    return {
      success: true,
      reqId: data.reqId,
      normalizedPhone: data.normalizedPhone || phone,
      maskedPhone: data.maskedPhone,
      message: data.message || 'SMS OTP sent successfully via MSG91.',
      isMockFallback: Boolean(data.isMockFallback),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while requesting MSG91 SMS OTP.',
    };
  }
}

/**
 * Resend SMS OTP via MSG91
 */
export async function retryMsg91PhoneOtp(reqId: string, phone?: string): Promise<Msg91RetryResult> {
  const activeReqId = reqId || lastClientReqId;

  try {
    const res = await fetch('/api/auth/otp/msg91/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reqId: activeReqId, phone }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || 'Failed to resend SMS OTP via MSG91.',
      };
    }

    if (data.reqId) {
      lastClientReqId = data.reqId;
    }

    return {
      success: true,
      reqId: data.reqId,
      message: data.message || 'SMS OTP resent successfully via MSG91.',
      isMockFallback: Boolean(data.isMockFallback),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while requesting OTP resend.',
    };
  }
}

/**
 * Verify SMS OTP via MSG91
 */
export async function verifyMsg91PhoneOtp(params: {
  reqId: string;
  otp: string;
  phone: string;
  purpose?: string;
}): Promise<Msg91VerifyResult> {
  const activeReqId = params.reqId || lastClientReqId || '';

  try {
    const res = await fetch('/api/auth/otp/msg91/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reqId: activeReqId,
        otp: params.otp,
        phone: params.phone,
        purpose: params.purpose || 'SIGNUP',
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || 'Invalid OTP code. Please check your SMS and try again.',
      };
    }

    return {
      success: true,
      verificationToken: data.verificationToken,
      normalizedPhone: data.normalizedPhone || params.phone,
      message: data.message || 'Mobile number verified successfully via MSG91.',
      isMockFallback: Boolean(data.isMockFallback),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while verifying MSG91 OTP.',
    };
  }
}

/**
 * Check MSG91 status on backend
 */
export async function getMsg91Status(): Promise<{
  success: boolean;
  provider: string;
  isConfigured: boolean;
  widgetId?: string;
}> {
  try {
    const res = await fetch('/api/internal/msg91-status');
    return await res.json();
  } catch {
    return {
      success: false,
      provider: 'MSG91',
      isConfigured: false,
    };
  }
}
