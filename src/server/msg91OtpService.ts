/**
 * SurplusX MSG91 OTP Integration Service
 * 
 * Official MSG91 OTP Implementation:
 * - Direct REST API (Primary for backend server execution, unrestricted by client datacenter IP filters)
 * - Widget ID & Token Auth support via MSG91_WIDGET_ID and MSG91_TOKEN_AUTH
 * - Secure server-side credential isolation (never leaks MSG91_TOKEN_AUTH to client browser)
 */

export interface Msg91SendOtpResponse {
  success: boolean;
  reqId?: string;
  message?: string;
  error?: string;
  isMockFallback?: boolean;
}

export interface Msg91RetryOtpResponse {
  success: boolean;
  reqId?: string;
  message?: string;
  error?: string;
  isMockFallback?: boolean;
}

export interface Msg91VerifyOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
  isMockFallback?: boolean;
}

export class Msg91OtpService {
  private static instance: Msg91OtpService;

  private constructor() {}

  public static getInstance(): Msg91OtpService {
    if (!Msg91OtpService.instance) {
      Msg91OtpService.instance = new Msg91OtpService();
    }
    return Msg91OtpService.instance;
  }

  public getWidgetId(): string {
    return process.env.MSG91_WIDGET_ID?.trim() || '';
  }

  public getTokenAuth(): string {
    return process.env.MSG91_TOKEN_AUTH?.trim() || '';
  }

  public getAuthKey(): string {
    // Both MSG91_AUTH_KEY and MSG91_TOKEN_AUTH serve as authentication credentials for MSG91 APIs
    return (
      process.env.MSG91_AUTH_KEY?.trim() ||
      process.env.MSG91_TOKEN_AUTH?.trim() ||
      ''
    );
  }

  /**
   * Determine whether MSG91 is configured in the environment.
   * True only when MSG91_WIDGET_ID and MSG91_TOKEN_AUTH (or MSG91_AUTH_KEY) are defined.
   */
  public isConfigured(): boolean {
    const widgetId = this.getWidgetId();
    const tokenAuth = this.getTokenAuth();
    const authKey = this.getAuthKey();
    return Boolean(widgetId && (tokenAuth || authKey));
  }

  public getStatus() {
    const configured = this.isConfigured();
    const widgetId = this.getWidgetId();
    return {
      provider: 'MSG91',
      isConfigured: configured,
      widgetId: widgetId ? `${widgetId.slice(0, 4)}••••` : 'Not configured',
      tokenAuthSet: Boolean(this.getTokenAuth()),
      authKeySet: Boolean(process.env.MSG91_AUTH_KEY?.trim()),
    };
  }

  /**
   * Public configuration served to the client browser.
   * STRICT SECURITY: Never returns tokenAuth or secret keys to the browser.
   */
  public getPublicConfig() {
    return {
      widgetId: this.getWidgetId(),
      isConfigured: this.isConfigured(),
    };
  }

  /**
   * Normalize phone for MSG91 (e.g. +919876543210 -> 919876543210)
   */
  private formatPhoneForMsg91(phone: string): string {
    return phone.replace(/^\+/, '').replace(/\s+/g, '');
  }

  /**
   * Send OTP via MSG91 OTP API
   */
  public async sendOtp(phone: string): Promise<Msg91SendOtpResponse> {
    const configured = this.isConfigured();
    const authKey = this.getAuthKey();
    const widgetId = this.getWidgetId();
    const identifier = this.formatPhoneForMsg91(phone);

    // If credentials are not configured in environment variables, provide sandbox fallback
    if (!configured) {
      console.warn(
        '[MSG91 OTP] MSG91 credentials not configured in environment. Using sandbox test OTP mode (code: 123456).'
      );
      return {
        success: true,
        reqId: `sandbox_msg91_${Date.now()}`,
        message: 'MSG91 credentials not configured in environment. Development test OTP is 123456.',
        isMockFallback: true,
      };
    }

    // Real MSG91 credentials are confirmed configured: dispatch real SMS OTP
    try {
      console.log(`[MSG91 OTP] Dispatching SMS OTP to ${identifier.slice(0, 4)}••••${identifier.slice(-2)} via MSG91 API`);
      const otpUrl = new URL('https://api.msg91.com/api/v5/otp');
      otpUrl.searchParams.set('template_id', '');
      otpUrl.searchParams.set('mobile', identifier);
      otpUrl.searchParams.set('authkey', authKey);
      otpUrl.searchParams.set('otp_length', '6');
      if (widgetId) {
        otpUrl.searchParams.set('widgetId', widgetId);
      }

      const res = await fetch(otpUrl.toString(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.type === 'success') {
        console.log('[MSG91 OTP] OTP successfully dispatched via MSG91. Request ID:', data.request_id);
        return {
          success: true,
          reqId: data.request_id || `msg91_${Date.now()}`,
          message: 'SMS OTP sent successfully via MSG91.',
          isMockFallback: false,
        };
      }

      console.error('[MSG91 OTP] Send OTP error from MSG91:', data);
      return {
        success: false,
        error: data?.message || 'Failed to dispatch SMS OTP via MSG91.',
        isMockFallback: false,
      };
    } catch (err: any) {
      console.error('[MSG91 OTP] Exception while contacting MSG91 gateway:', err.message);
      return {
        success: false,
        error: err.message || 'Network error while contacting MSG91 SMS gateway.',
        isMockFallback: false,
      };
    }
  }

  /**
   * Resend / Retry OTP via MSG91 OTP API
   */
  public async retryOtp(reqId: string, phone?: string, retryChannel: number = 11): Promise<Msg91RetryOtpResponse> {
    const configured = this.isConfigured();
    const authKey = this.getAuthKey();

    if (!configured) {
      return {
        success: true,
        message: 'Development OTP retry acknowledged (Code: 123456).',
        isMockFallback: true,
      };
    }

    if (!phone) {
      return {
        success: false,
        error: 'Mobile number is required to resend SMS OTP.',
        isMockFallback: false,
      };
    }

    const identifier = this.formatPhoneForMsg91(phone);

    // 1. Attempt MSG91 retry endpoint
    try {
      const retryUrl = new URL('https://api.msg91.com/api/v5/otp/retry');
      retryUrl.searchParams.set('authkey', authKey);
      retryUrl.searchParams.set('mobile', identifier);
      retryUrl.searchParams.set('retrytype', retryChannel === 11 ? 'text' : 'voice');

      const res = await fetch(retryUrl.toString());
      const data = await res.json().catch(() => null);

      if (data?.type === 'success' || (data?.message && !data.message.includes('error') && !data.message.includes('invalid'))) {
        return {
          success: true,
          message: data?.message || 'OTP resent successfully via MSG91.',
          isMockFallback: false,
        };
      }
    } catch (err: any) {
      console.warn('[MSG91 OTP] Retry API note:', err.message);
    }

    // 2. If MSG91 retry is in cooldown or rejects text retry, dispatch fresh OTP via sendOtp
    console.log(`[MSG91 OTP] Dispatched fresh SMS OTP for retry to ${identifier.slice(0, 4)}••••${identifier.slice(-2)}`);
    const sendResult = await this.sendOtp(phone);
    if (sendResult.success) {
      return {
        success: true,
        reqId: sendResult.reqId,
        message: 'New verification OTP sent successfully via MSG91 SMS.',
        isMockFallback: false,
      };
    }

    return {
      success: false,
      error: sendResult.error || 'Failed to resend SMS OTP via MSG91.',
      isMockFallback: false,
    };
  }

  /**
   * Verify OTP via MSG91 OTP API
   */
  public async verifyOtp(reqId: string, otp: string, phone?: string): Promise<Msg91VerifyOtpResponse> {
    const configured = this.isConfigured();
    const authKey = this.getAuthKey();
    const cleanOtp = otp.trim();

    // Sandbox test mode is ONLY enabled when MSG91 credentials are NOT configured
    if (!configured) {
      if (cleanOtp === '123456' || cleanOtp === '1234' || reqId.startsWith('sandbox_msg91_')) {
        return {
          success: true,
          message: 'Development sandbox OTP verified successfully.',
          isMockFallback: true,
        };
      }
      return {
        success: false,
        error: 'Invalid test OTP. Use 123456 in development test mode.',
        isMockFallback: true,
      };
    }

    // When real MSG91 credentials ARE configured: REAL VERIFICATION MANDATORY
    if (!phone) {
      return {
        success: false,
        error: 'Mobile number is required for MSG91 verification.',
        isMockFallback: false,
      };
    }

    const identifier = this.formatPhoneForMsg91(phone);

    try {
      const verifyUrl = new URL('https://api.msg91.com/api/v5/otp/verify');
      verifyUrl.searchParams.set('otp', cleanOtp);
      verifyUrl.searchParams.set('mobile', identifier);
      verifyUrl.searchParams.set('authkey', authKey);

      const res = await fetch(verifyUrl.toString(), {
        method: 'GET',
      });

      const data = await res.json().catch(() => null);

      if (res.ok && (data?.type === 'success' || data?.message === 'OTP verified success' || data?.message?.toLowerCase().includes('verified'))) {
        console.log('[MSG91 OTP] Code successfully verified via MSG91 for', identifier.slice(0, 4) + '••••');
        return {
          success: true,
          message: 'Mobile number verified successfully via MSG91.',
          isMockFallback: false,
        };
      }

      if (data?.message === 'OTP not match') {
        return {
          success: false,
          error: 'Incorrect OTP code. Please check your SMS and try again.',
          isMockFallback: false,
        };
      }

      if (data?.message?.toLowerCase().includes('expired')) {
        return {
          success: false,
          error: 'OTP has expired. Please request a new code.',
          isMockFallback: false,
        };
      }

      return {
        success: false,
        error: data?.message || 'Verification failed. Please check the code received via SMS.',
        isMockFallback: false,
      };
    } catch (err: any) {
      console.error('[MSG91 OTP] REST API verify exception:', err.message);
      return {
        success: false,
        error: 'Failed to verify OTP with MSG91 SMS gateway.',
        isMockFallback: false,
      };
    }
  }

  /**
   * Verify Access Token from MSG91 Client-Side OTP Widget verification
   */
  public async verifyAccessToken(accessToken: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const authKey = this.getAuthKey();
    if (!authKey) {
      return {
        success: false,
        error: 'MSG91 credentials are not configured on server.',
      };
    }

    try {
      const res = await fetch('https://api.msg91.com/api/v5/widget/verifyAccessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authkey: authKey,
        },
        body: JSON.stringify({
          'access-token': accessToken,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && (data.type === 'error' || data.status === 'error' || data.hasError))) {
        return {
          success: false,
          error: data?.message || 'Invalid or expired access token.',
        };
      }

      return {
        success: true,
        data: data?.data || data,
      };
    } catch (err: any) {
      console.error('[MSG91 OTP] Exception validating access token:', err);
      return {
        success: false,
        error: err.message || 'Network error validating MSG91 access token.',
      };
    }
  }
}

export const msg91OtpService = Msg91OtpService.getInstance();
