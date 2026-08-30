/**
 * SurplusX Transactional Email Service — Exclusively Resend Powered
 * 
 * Production-Grade Architecture:
 * - Provider: Resend (https://resend.com)
 * - Official SDK & API Integration
 * - Environment Variables:
 *     RESEND_API_KEY: Secret key for Resend API
 *     EMAIL_FROM: Verified sender address (e.g., no-reply@surplusx.in or onboarding@resend.dev)
 *     EMAIL_FROM_NAME: Sender name (e.g., SurplusX or SurplusX Security)
 * 
 * Strict Security Rules:
 * 1. OTP is rendered ONLY inside the outgoing email dispatched to the user's real inbox.
 * 2. OTP is NEVER logged, never returned in API responses, and never stored in plaintext.
 * 3. RESEND_API_KEY is server-side only and never exposed to the frontend.
 * 4. Safe masked logging only (e.g. h****a@gmail.com).
 * 5. Returns EMAIL_SEND_FAILED or EMAIL_SERVICE_NOT_CONFIGURED on failure — never fake success.
 */

import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string;
  from?: string;
  fromName?: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  provider: 'Resend';
  status?: string;
  messageId?: string;
  error?: string;
}

export interface EmailProvider {
  name: string;
  isConfigured(): boolean;
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}

// ---------------------------------------------------------------------------
// Resend Email Provider Adapter
// ---------------------------------------------------------------------------
export class ResendEmailProvider implements EmailProvider {
  name = 'Resend';
  private resendClient: Resend | null = null;
  private cachedApiKey = '';

  private getApiKey(): string {
    return (process.env.RESEND_API_KEY || '').trim();
  }

  private getResendClient(): Resend | null {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    if (!this.resendClient || this.cachedApiKey !== apiKey) {
      this.resendClient = new Resend(apiKey);
      this.cachedApiKey = apiKey;
    }
    return this.resendClient;
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  private getFormattedFrom(customFrom?: string, customFromName?: string): string {
    if (customFrom) {
      if (customFrom.includes('<') && customFrom.includes('>')) {
        return customFrom;
      }
      const name = customFromName || (process.env.EMAIL_FROM_NAME || 'SurplusX').trim();
      return `${name} <${customFrom}>`;
    }

    const rawFrom = (process.env.EMAIL_FROM || '').trim();
    const fromName = (process.env.EMAIL_FROM_NAME || 'SurplusX').trim();

    if (rawFrom) {
      if (rawFrom.includes('<') && rawFrom.includes('>')) {
        return rawFrom;
      }
      return `${fromName} <${rawFrom}>`;
    }

    // Default Resend sandbox sender if custom domain is not yet configured
    return `${fromName} <onboarding@resend.dev>`;
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        success: false,
        provider: 'Resend',
        status: 'EMAIL_SERVICE_NOT_CONFIGURED',
        error: 'RESEND_API_KEY is not configured on the server. Please set RESEND_API_KEY in environment variables.',
      };
    }

    const from = this.getFormattedFrom(options.from, options.fromName);
    const to = options.to.trim().toLowerCase();

    try {
      const client = this.getResendClient();
      if (client) {
        const { data, error } = await client.emails.send({
          from,
          to: [to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          ...(options.replyTo ? { reply_to: options.replyTo } : {}),
        });

        if (error) {
          const errorMsg = error.message || error.name || 'Resend rejected email dispatch';
          return {
            success: false,
            provider: 'Resend',
            status: 'EMAIL_SEND_FAILED',
            error: `Resend API error: ${errorMsg}`,
          };
        }

        return {
          success: true,
          provider: 'Resend',
          status: 'OTP_SENT',
          messageId: data?.id || `resend_${Date.now()}`,
        };
      }

      // Fallback direct REST API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
        }),
      });

      const responseText = await response.text();
      let resData: any = {};
      try {
        resData = JSON.parse(responseText);
      } catch {
        resData = { message: responseText };
      }

      if (!response.ok) {
        const errorMsg = resData.message || resData.error?.message || resData.error || `Resend returned HTTP ${response.status}`;
        return {
          success: false,
          provider: 'Resend',
          status: 'EMAIL_SEND_FAILED',
          error: `Resend API error: ${errorMsg}`,
        };
      }

      return {
        success: true,
        provider: 'Resend',
        status: 'OTP_SENT',
        messageId: resData.id || `resend_${Date.now()}`,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'Resend',
        status: 'EMAIL_SEND_FAILED',
        error: `Resend network dispatch failed: ${err.message || err}`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Centralized Email Service
// ---------------------------------------------------------------------------
export class EmailService {
  private static instance: EmailService;
  private provider: EmailProvider;

  private constructor() {
    this.provider = new ResendEmailProvider();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Helper to mask email address for safe logging and UI display (e.g., h****a@gmail.com)
   */
  public maskEmail(email: string): string {
    if (!email) return '';
    const norm = email.trim().toLowerCase();
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

  /**
   * Check if Resend is configured on the server
   */
  public isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  /**
   * Diagnostic summary (safe for logs & internal checks)
   */
  public getConfigurationStatus() {
    const apiKey = (process.env.RESEND_API_KEY || '').trim();
    const fromEmail = (process.env.EMAIL_FROM || '').trim();
    const fromName = (process.env.EMAIL_FROM_NAME || 'SurplusX').trim();

    return {
      provider: 'Resend',
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? `${apiKey.slice(0, 5)}...` : 'not_set',
      fromEmail: fromEmail || 'onboarding@resend.dev (default)',
      fromName,
      isConfigured: !!apiKey,
    };
  }

  /**
   * Dispatch transactional email via Resend
   */
  public async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const maskedRecipient = this.maskEmail(options.to);

    if (!this.provider.isConfigured()) {
      const errorMsg = 'RESEND_API_KEY is not configured on the server. Please configure RESEND_API_KEY in environment variables.';
      console.warn(`[Resend EmailService] Cannot send email to ${maskedRecipient}: ${errorMsg}`);
      return {
        success: false,
        provider: 'Resend',
        status: 'EMAIL_SERVICE_NOT_CONFIGURED',
        error: errorMsg,
      };
    }

    try {
      const result = await this.provider.sendEmail(options);
      if (result.success) {
        // Safe diagnostic log (NEVER logs OTP, secrets, or passwords)
        console.log(`[Resend EmailService] Verification email accepted by Resend for ${maskedRecipient} (messageId: ${result.messageId})`);
      } else {
        console.warn(`[Resend EmailService] Resend dispatch failed for ${maskedRecipient}: ${result.error}`);
      }
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Dispatch exception';
      console.warn(`[Resend EmailService] Exception dispatching to ${maskedRecipient}: ${errorMsg}`);
      return {
        success: false,
        provider: 'Resend',
        status: 'EMAIL_SEND_FAILED',
        error: `Failed to deliver email: ${errorMsg}`,
      };
    }
  }

  /**
   * 1. Send 6-Digit Email Verification OTP via Resend
   * CRITICAL SECURITY REQUIREMENT:
   * The actual OTP is inserted into the email body ONLY and delivered directly to the user's inbox.
   */
  public async sendVerificationOTP(
    email: string,
    otp: string,
    expiresInMinutes = 5
  ): Promise<SendEmailResult> {
    const subject = 'Verify your SurplusX account';

    const text = `Hello,

Your SurplusX verification code is:

${otp}

This code expires in ${expiresInMinutes} minutes.

Do not share this code with anyone.

If you did not request this verification, you can safely ignore this email.

Thanks,
SurplusX Team
https://surplusx.in`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SurplusX Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f8; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #047857; padding: 28px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SurplusX</h1>
              <p style="margin: 4px 0 0 0; color: #a7f3d0; font-size: 13px; font-weight: 500;">Zero-Waste Food Rescue Network</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">Verify your email address</h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Hello,<br>
                Thank you for joining SurplusX. To complete your account registration and verify your email address, please enter the following 6-digit verification code:
              </p>

              <!-- OTP Display Box -->
              <div style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 700; color: #065f46; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Your 6-Digit Verification Code</div>
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #047857; line-height: 1.2;">
                  ${otp}
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #047857; margin-top: 8px;">
                  Expires in ${expiresInMinutes} minutes
                </div>
              </div>

              <!-- Security Alert Notice -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 12px; line-height: 1.5; font-weight: 500;">
                  <strong>Security Alert:</strong> Do not share this code with anyone. SurplusX team members will never ask you for your verification code.
                </p>
              </div>

              <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                If you did not request this verification, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.4;">
                &copy; ${new Date().getFullYear()} SurplusX Technologies India. All rights reserved.<br>
                Empowering zero-hunger communities through hyper-local surplus food redirection.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * 2. Send Password Reset Email via Resend
   */
  public async sendPasswordResetEmail(
    email: string,
    resetTokenOrCode: string
  ): Promise<SendEmailResult> {
    const subject = 'Reset your SurplusX password';
    const text = `Hello,\n\nWe received a request to reset your SurplusX password.\nYour reset code is: ${resetTokenOrCode}\n\nThis code expires in 15 minutes.\n\nSurplusX Security Team`;
    const html = `<p>Hello,</p><p>Your password reset code is: <strong>${resetTokenOrCode}</strong> (Valid for 15 minutes).</p>`;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * 3. Send Order Receipt Email via Resend
   */
  public async sendOrderReceipt(
    email: string,
    orderDetails: {
      orderId: string;
      customerName: string;
      itemsCount: number;
      totalAmount: number;
      pickupStore: string;
    }
  ): Promise<SendEmailResult> {
    const subject = `Your SurplusX Order Receipt (#${orderDetails.orderId})`;
    const text = `Hello ${orderDetails.customerName},\n\nThank you for rescuing food with SurplusX!\nOrder ID: ${orderDetails.orderId}\nTotal: ₹${orderDetails.totalAmount}\nPickup Store: ${orderDetails.pickupStore}\n\nSurplusX`;
    const html = `<p>Hello ${orderDetails.customerName},</p><p>Thank you for rescuing food with SurplusX!</p><p>Order ID: <strong>${orderDetails.orderId}</strong><br>Total: ₹${orderDetails.totalAmount}<br>Store: ${orderDetails.pickupStore}</p>`;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * 4. Send Order / Donation Notification Email via Resend
   */
  public async sendOrderNotification(
    email: string,
    title: string,
    message: string
  ): Promise<SendEmailResult> {
    return this.sendEmail({
      to: email,
      subject: `SurplusX Notification: ${title}`,
      text: `${title}\n\n${message}\n\nSurplusX`,
      html: `<h3>${title}</h3><p>${message}</p>`,
    });
  }

  /**
   * 5. Test Email Dispatch (Internal Diagnostics) via Resend
   */
  public async sendTestEmail(toEmail: string): Promise<SendEmailResult> {
    const subject = 'SurplusX Resend Transactional Email Test';
    const text = `Hello,\n\nThis is a test transactional email confirming that Resend API is configured and operational for SurplusX.\n\nTimestamp: ${new Date().toISOString()}\nSurplusX Team`;
    const html = `<h2>SurplusX Resend Transactional Email Test</h2><p>This is a test transactional email confirming that Resend API is configured and operational for SurplusX.</p><p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`;

    return this.sendEmail({
      to: toEmail,
      subject,
      text,
      html,
    });
  }
}

export const emailService = EmailService.getInstance();
