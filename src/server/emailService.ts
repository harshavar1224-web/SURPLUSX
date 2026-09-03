/**
 * SurplusX Transactional Email Service — Official Google Gmail API Provider
 * 
 * Production-Grade Architecture:
 * - Provider: Google Gmail API (googleapis) with OAuth 2.0 Offline Refresh Token
 * - Scope: https://www.googleapis.com/auth/gmail.send
 * - Environment Variables:
 *     GOOGLE_CLIENT_ID: Google Cloud OAuth 2.0 Web Application Client ID
 *     GOOGLE_CLIENT_SECRET: Google Cloud OAuth 2.0 Client Secret (Server-side ONLY)
 *     GOOGLE_REFRESH_TOKEN: Authorized SurplusX Sending Mailbox Offline Refresh Token (Server-side ONLY)
 *     GOOGLE_SENDER_EMAIL: Authorized SurplusX Mailbox Address (e.g., surplusx.notifications@gmail.com)
 * 
 * Strict Security Mandates:
 * 1. Single Authorized SurplusX Sender Mailbox sends to all recipient addresses.
 * 2. OTP is generated server-side using crypto.randomInt() and rendered ONLY inside the outgoing Gmail message.
 * 3. Plaintext OTP is NEVER returned in API responses, NEVER stored, NEVER logged, and NEVER present on frontend.
 * 4. GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN are strictly server-side secrets.
 * 5. Returns EMAIL_SEND_FAILED or EMAIL_PROVIDER_NOT_CONFIGURED on failure — never fake success, no mock fallback.
 */

import { google } from 'googleapis';

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
  provider: 'GMAIL_API';
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
// Google Gmail API Email Provider (OAuth 2.0)
// ---------------------------------------------------------------------------
export class GmailEmailProvider implements EmailProvider {
  name = 'GMAIL_API';
  private gmailClient: any = null;
  private oauth2Client: any = null;
  private cachedConfigKey = '';

  private getCredentials() {
    return {
      clientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
      refreshToken: (process.env.GOOGLE_REFRESH_TOKEN || '').trim(),
      senderEmail: (process.env.GOOGLE_SENDER_EMAIL || '').trim().toLowerCase(),
    };
  }

  isConfigured(): boolean {
    const { clientId, clientSecret, refreshToken, senderEmail } = this.getCredentials();
    return !!(clientId && clientSecret && refreshToken && senderEmail);
  }

  private getGmailClient() {
    const { clientId, clientSecret, refreshToken } = this.getCredentials();
    if (!clientId || !clientSecret || !refreshToken) {
      return null;
    }

    const currentKey = `${clientId}:${clientSecret.slice(0, 4)}:${refreshToken.slice(0, 4)}`;
    if (!this.gmailClient || this.cachedConfigKey !== currentKey) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      this.gmailClient = google.gmail({
        version: 'v1',
        auth: this.oauth2Client,
      });
      this.cachedConfigKey = currentKey;
    }

    return this.gmailClient;
  }

  /**
   * Constructs an RFC 5322 MIME email message with UTF-8 support and Base64URL encoding
   */
  private createBase64UrlMimeMessage(options: SendEmailOptions, senderEmail: string): string {
    const fromName = options.fromName || 'SurplusX';
    const fromAddress = options.from || senderEmail;
    const fromHeader = `${fromName} <${fromAddress}>`;
    const toAddress = options.to.trim().toLowerCase();
    const encodedSubject = `=?utf-8?B?${Buffer.from(options.subject, 'utf-8').toString('base64')}?=`;
    const boundary = `__SurplusX_Boundary_${Date.now().toString(16)}_${Math.random().toString(36).slice(2)}__`;

    const mimeHeaders = [
      `From: ${fromHeader}`,
      `To: ${toAddress}`,
      ...(options.replyTo ? [`Reply-To: ${options.replyTo}`] : []),
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      options.text || options.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      options.html,
      '',
      `--${boundary}--`,
    ];

    const rawMime = mimeHeaders.join('\r\n');
    return Buffer.from(rawMime, 'utf-8').toString('base64url');
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { clientId, clientSecret, refreshToken, senderEmail } = this.getCredentials();

    if (!clientId || !clientSecret || !refreshToken || !senderEmail) {
      return {
        success: false,
        provider: 'GMAIL_API',
        status: 'EMAIL_PROVIDER_NOT_CONFIGURED',
        error: 'Google Gmail OAuth sending account is not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, and GOOGLE_SENDER_EMAIL in server environment variables.',
      };
    }

    try {
      const gmail = this.getGmailClient();
      if (!gmail) {
        return {
          success: false,
          provider: 'GMAIL_API',
          status: 'EMAIL_PROVIDER_NOT_CONFIGURED',
          error: 'Failed to initialize Gmail API OAuth 2.0 client.',
        };
      }

      const raw = this.createBase64UrlMimeMessage(options, senderEmail);

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw,
        },
      });

      const messageId = response.data?.id || `gmail_${Date.now()}`;

      return {
        success: true,
        provider: 'GMAIL_API',
        status: 'OTP_SENT',
        messageId,
      };
    } catch (err: any) {
      const errorDetails = err?.response?.data?.error?.message || err?.message || 'Unknown Gmail API Error';
      const isAuthError =
        errorDetails.includes('invalid_grant') ||
        errorDetails.includes('invalid_client') ||
        errorDetails.includes('unauthorized_client') ||
        errorDetails.includes('Token has been expired or revoked');

      if (isAuthError) {
        return {
          success: false,
          provider: 'GMAIL_API',
          status: 'EMAIL_PROVIDER_NOT_CONFIGURED',
          error: 'Google OAuth refresh token is invalid or expired. The sending account must be re-authorized.',
        };
      }

      return {
        success: false,
        provider: 'GMAIL_API',
        status: 'EMAIL_SEND_FAILED',
        error: 'Unable to send verification email via Gmail API. Please try again.',
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Centralized SurplusX Email Service (Application Interface)
// ---------------------------------------------------------------------------
export class EmailService {
  private static instance: EmailService;
  private provider: EmailProvider;

  private constructor() {
    this.provider = new GmailEmailProvider();
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
   * Check if Gmail API provider is configured on the server
   */
  public isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  /**
   * Diagnostic summary (safe for logs & internal checks — NEVER exposes secrets)
   */
  public getConfigurationStatus() {
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
    const refreshToken = (process.env.GOOGLE_REFRESH_TOKEN || '').trim();
    const senderEmail = (process.env.GOOGLE_SENDER_EMAIL || '').trim();

    return {
      provider: 'GMAIL_API',
      isConfigured: !!(clientId && clientSecret && refreshToken && senderEmail),
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
      senderEmail: senderEmail ? this.maskEmail(senderEmail) : 'not_set',
      clientIdPrefix: clientId ? `${clientId.slice(0, 12)}...` : 'not_set',
      scope: 'https://www.googleapis.com/auth/gmail.send',
    };
  }

  /**
   * Dispatch transactional email via Gmail API
   */
  public async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const maskedRecipient = this.maskEmail(options.to);

    if (!this.provider.isConfigured()) {
      const errorMsg = 'Google Gmail API credentials are not configured on the server. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, and GOOGLE_SENDER_EMAIL in environment variables.';
      console.warn(`[Gmail EmailService] Cannot send email to ${maskedRecipient}: ${errorMsg}`);
      return {
        success: false,
        provider: 'GMAIL_API',
        status: 'EMAIL_PROVIDER_NOT_CONFIGURED',
        error: errorMsg,
      };
    }

    try {
      const result = await this.provider.sendEmail(options);
      if (result.success) {
        // Safe diagnostic log (NEVER logs OTP, tokens, secrets, or passwords)
        console.log(`[Gmail EmailService] Email dispatched successfully via Gmail API for ${maskedRecipient} (messageId: ${result.messageId})`);
      } else {
        console.warn(`[Gmail EmailService] Gmail API dispatch failed for ${maskedRecipient}: ${result.error}`);
      }
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Dispatch exception';
      console.warn(`[Gmail EmailService] Exception dispatching to ${maskedRecipient}: ${errorMsg}`);
      return {
        success: false,
        provider: 'GMAIL_API',
        status: 'EMAIL_SEND_FAILED',
        error: 'Unable to send email via Gmail API. Please try again.',
      };
    }
  }

  /**
   * 1. Send 6-Digit Email Verification OTP via Gmail API
   * CRITICAL SECURITY REQUIREMENT:
   * The actual OTP is inserted into the email body ONLY and delivered directly to the user's inbox.
   */
  public async sendVerificationOTP(
    email: string,
    otp: string,
    expiresInMinutes = 5
  ): Promise<SendEmailResult> {
    const subject = 'Verify your SurplusX account';

    const text = `SurplusX

Your verification code is: ${otp}

This code expires in ${expiresInMinutes} minutes.

Do not share this code with anyone.

If you did not request this code, ignore this email.

SurplusX Security Team
https://surplusx.org`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your SurplusX account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #047857; padding: 28px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">SurplusX</h1>
              <p style="margin: 4px 0 0 0; color: #a7f3d0; font-size: 13px; font-weight: 500;">Zero-Waste Surplus Food Rescue Platform</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">Verify your SurplusX account</h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Your SurplusX verification code is:
              </p>

              <!-- OTP Display Box -->
              <div style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 700; color: #065f46; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">Verification Code</div>
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #047857; line-height: 1.2;">
                  <strong>${otp}</strong>
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #047857; margin-top: 8px;">
                  This code expires in ${expiresInMinutes} minutes.
                </div>
              </div>

              <!-- Security Alert Notice -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 12px; line-height: 1.5; font-weight: 500;">
                  <strong>Security Notice:</strong> Do not share this code with anyone.
                </p>
              </div>

              <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                If you did not request this code, ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.4;">
                &copy; ${new Date().getFullYear()} SurplusX. All rights reserved.<br>
                Official notification from SurplusX sending mailbox.
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
   * 2. Send Password Reset Email via Gmail API
   */
  public async sendPasswordResetEmail(
    email: string,
    resetTokenOrCode: string
  ): Promise<SendEmailResult> {
    const subject = 'Reset your SurplusX password';
    const text = `Hello,\n\nWe received a request to reset your SurplusX password.\nYour reset code is: ${resetTokenOrCode}\n\nThis code expires in 15 minutes.\n\nSurplusX Security Team`;
    const html = `<p>Hello,</p><p>Your password reset code is: <strong>${resetTokenOrCode}</strong> (Valid for 15 minutes).</p><p>Do not share this code with anyone.</p>`;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * 3. Send Order Receipt Email via Gmail API
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
   * 4. Send Order Confirmation Email via Gmail API
   */
  public async sendOrderConfirmation(
    email: string,
    orderDetails: {
      orderId: string;
      customerName: string;
      itemsCount: number;
      totalAmount: number;
      pickupStore: string;
    }
  ): Promise<SendEmailResult> {
    return this.sendOrderReceipt(email, orderDetails);
  }

  /**
   * 5. Send Notification Email via Gmail API
   */
  public async sendNotification(
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
   * 6. Test Email Dispatch (Internal Diagnostics via Gmail API)
   * Sends "SurplusX Gmail API test" to verify end-to-end backend -> Gmail API -> Recipient flow
   */
  public async sendTestEmail(toEmail: string): Promise<SendEmailResult> {
    const subject = 'SurplusX Gmail API test';
    const text = `Hello,\n\nThis is an authoritative test email confirming that the Google Gmail API email service is configured and operational for SurplusX.\n\nTimestamp: ${new Date().toISOString()}\nSurplusX Platform`;
    const html = `<h2>SurplusX Gmail API test</h2><p>This is an authoritative test email confirming that the Google Gmail API email service is configured and operational for SurplusX.</p><p><strong>Timestamp:</strong> ${new Date().toISOString()}</p><p>Sent from official SurplusX sending Gmail mailbox.</p>`;

    return this.sendEmail({
      to: toEmail,
      subject,
      text,
      html,
    });
  }

  /**
   * 7. Business Verification Approved Email Notification
   */
  public async sendBusinessVerificationApprovalEmail(
    email: string,
    businessName: string,
    contactName: string,
    dashboardUrl?: string
  ): Promise<SendEmailResult> {
    const targetDashboardUrl = dashboardUrl || `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?view=business-dashboard`;
    const subject = '🎉 Welcome to SurplusX — Your Business Has Been Approved!';
    const text = `Hello ${contactName || 'Valued Business Partner'},\n\n` +
      `Warm greetings from SurplusX! 👋\n\n` +
      `We are delighted to inform you that ${businessName} has successfully completed our business verification process and has been approved and activated on the SurplusX platform. 🎉\n\n` +
      `Your business account is now officially active, and you can start using SurplusX to list your surplus food, connect with customers and organizations, and contribute towards reducing food waste.\n\n` +
      `We're excited to have you as part of the SurplusX community! 🌱\n\n` +
      `Together, let's Rescue Surplus. Create Impact.\n\n` +
      `You can now access your business dashboard and start managing your SurplusX activities:\n${targetDashboardUrl}\n\n` +
      `If you have any questions or need assistance, our support team is always here to help.\n` +
      `Support: surplusx.support@gmail.com\n\n` +
      `Warm regards,\n` +
      `Team SurplusX\n` +
      `Rescue Surplus. Create Impact.`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SurplusX Business Approval</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px; background-color:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color:#047857; padding:28px 32px; text-align:left;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; letter-spacing:-0.5px;">SurplusX</h1>
              <p style="margin:4px 0 0 0; color:#a7f3d0; font-size:13px; font-weight:500;">Rescue Surplus. Create Impact.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0; color:#0f172a; font-size:20px; font-weight:800;">🎉 Welcome to SurplusX — Your Business Has Been Approved!</h2>
              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                Hello <strong>${contactName || 'Valued Business Partner'}</strong>,
              </p>
              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                Warm greetings from SurplusX! 👋
              </p>
              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                We are delighted to inform you that <strong>${businessName}</strong> has successfully completed our business verification process and has been approved and activated on the SurplusX platform. 🎉
              </p>
              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                Your business account is now officially active, and you can start using SurplusX to list your surplus food, connect with customers and organizations, and contribute towards reducing food waste.
              </p>
              <p style="margin:0 0 20px 0; color:#334155; font-size:14px; line-height:1.6;">
                We're excited to have you as part of the SurplusX community! 🌱<br>
                <em>Together, let's Rescue Surplus. Create Impact.</em>
              </p>
              <div style="text-align:center; margin:28px 0;">
                <a href="${targetDashboardUrl}" style="background-color:#047857; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:12px; font-weight:700; font-size:14px; inline-block; box-shadow:0 2px 4px rgba(4,120,87,0.2);">
                  Open Business Dashboard
                </a>
              </div>
              <div style="background-color:#f1f5f9; border-radius:12px; padding:16px; margin-top:24px;">
                <p style="margin:0; color:#475569; font-size:13px; line-height:1.5;">
                  If you have any questions or need assistance, our support team is always here to help.<br>
                  <strong>Support Email:</strong> <a href="mailto:surplusx.support@gmail.com" style="color:#047857; font-weight:600;">surplusx.support@gmail.com</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0; text-align:center;">
              <p style="margin:0 0 4px 0; color:#64748b; font-size:12px; font-weight:600;">Warm regards,<br>Team SurplusX</p>
              <p style="margin:4px 0 0 0; color:#94a3b8; font-size:11px;">Rescue Surplus. Create Impact. &bull; &copy; 2026 SurplusX. All rights reserved.</p>
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
      from: 'surplusx.support@gmail.com',
      fromName: 'SurplusX',
      replyTo: 'surplusx.support@gmail.com',
      subject,
      text,
      html,
    });
  }

  /**
   * 8. Business Verification Rejection Email Notification
   */
  public async sendBusinessVerificationRejectionEmail(
    email: string,
    businessName: string,
    contactName: string,
    rejectionReason: string
  ): Promise<SendEmailResult> {
    const subject = 'Update on Your SurplusX Business Verification';
    const text = `Hello ${contactName || 'Valued Business Partner'},\n\n` +
      `Thank you for submitting your business verification for ${businessName}.\n\n` +
      `After careful review by our Super Admin team, we regret to inform you that your business verification request could not be approved at this time.\n\n` +
      `Reason for Rejection:\n${rejectionReason}\n\n` +
      `If you believe this decision was made in error or if you have any questions regarding your application, please reach out to our support team at surplusx.support@gmail.com.\n\n` +
      `Warm regards,\nTeam SurplusX\nRescue Surplus. Create Impact.\n\n` +
      `© 2026 SurplusX. All rights reserved.`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SurplusX Business Verification Update</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px; background-color:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color:#1e293b; padding:28px 32px; text-align:left;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; letter-spacing:-0.5px;">SurplusX</h1>
              <p style="margin:4px 0 0 0; color:#cbd5e1; font-size:13px; font-weight:500;">Rescue Surplus. Create Impact.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0; color:#0f172a; font-size:18px; font-weight:700;">Update on Your SurplusX Business Verification</h2>
              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                Hello <strong>${contactName || 'Valued Business Partner'}</strong>,
              </p>
              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                Thank you for submitting your business verification for <strong>${businessName}</strong>.
              </p>
              <p style="margin:0 0 20px 0; color:#334155; font-size:14px; line-height:1.6;">
                After careful review by our Super Admin team, we regret to inform you that your business verification request could not be approved at this time.
              </p>
              <div style="background-color:#fef2f2; border-left:4px solid #ef4444; border-radius:8px; padding:16px; margin:20px 0;">
                <div style="font-size:12px; font-weight:700; color:#991b1b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Reason for Rejection</div>
                <div style="color:#7f1d1d; font-size:14px; line-height:1.5;">${rejectionReason}</div>
              </div>
              <p style="margin:20px 0 0 0; color:#475569; font-size:13px; line-height:1.6;">
                If you believe this decision was made in error or if you have any questions regarding your application, please reach out to our support team at <a href="mailto:surplusx.support@gmail.com" style="color:#047857; font-weight:600;">surplusx.support@gmail.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0; text-align:center;">
              <p style="margin:0 0 4px 0; color:#64748b; font-size:12px; font-weight:600;">Warm regards,<br>Team SurplusX</p>
              <p style="margin:4px 0 0 0; color:#94a3b8; font-size:11px;">Rescue Surplus. Create Impact. &bull; &copy; 2026 SurplusX. All rights reserved.</p>
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
      from: 'surplusx.support@gmail.com',
      fromName: 'SurplusX',
      replyTo: 'surplusx.support@gmail.com',
      subject,
      text,
      html,
    });
  }

  /**
   * 9. Business Verification Resubmission Required Email Notification
   */
  public async sendBusinessVerificationResubmissionEmail(
    email: string,
    businessName: string,
    contactName: string,
    resubmissionReason: string,
    verificationUrl?: string
  ): Promise<SendEmailResult> {
    const targetUrl = verificationUrl || `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?view=business-verification`;
    const subject = 'Action Required: Resubmit Your SurplusX Business Verification';
    const text = `Hello ${contactName || 'Valued Business Partner'},\n\n` +
      `Thank you for submitting your business verification for ${businessName}.\n\n` +
      `Our Super Admin team has reviewed your application and requires you to resubmit or update specific document(s) before your business can be approved.\n\n` +
      `Reason / Action Required:\n${resubmissionReason}\n\n` +
      `Please log into your SurplusX account, navigate to the Business Verification section, and upload the updated document(s):\n${targetUrl}\n\n` +
      `If you have any questions or need assistance, please contact us at surplusx.support@gmail.com.\n\n` +
      `Warm regards,\nTeam SurplusX\nRescue Surplus. Create Impact.\n\n` +
      `© 2026 SurplusX. All rights reserved.`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SurplusX Business Verification Action Required</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px; background-color:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color:#d97706; padding:28px 32px; text-align:left;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; letter-spacing:-0.5px;">SurplusX</h1>
              <p style="margin:4px 0 0 0; color:#fef3c7; font-size:13px; font-weight:500;">Rescue Surplus. Create Impact.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px 0; color:#0f172a; font-size:18px; font-weight:700;">Action Required: Resubmit Your Business Verification</h2>
              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                Hello <strong>${contactName || 'Valued Business Partner'}</strong>,
              </p>
              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                Thank you for submitting your business verification for <strong>${businessName}</strong>.
              </p>
              <p style="margin:0 0 16px 0; color:#334155; font-size:14px; line-height:1.6;">
                Our Super Admin team has reviewed your application and requires you to resubmit or update specific document(s) before your business can be approved.
              </p>
              <div style="background-color:#fffbeb; border-left:4px solid #f59e0b; border-radius:8px; padding:16px; margin:20px 0;">
                <div style="font-size:12px; font-weight:700; color:#92400e; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Reason / Action Required</div>
                <div style="color:#78350f; font-size:14px; line-height:1.5;">${resubmissionReason}</div>
              </div>
              <p style="margin:0 0 24px 0; color:#334155; font-size:14px; line-height:1.6;">
                Please log into your SurplusX account, navigate to the Business Verification section, and upload the updated document(s).
              </p>
              <div style="text-align:center; margin:28px 0;">
                <a href="${targetUrl}" style="background-color:#d97706; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:12px; font-weight:700; font-size:14px; inline-block; box-shadow:0 2px 4px rgba(217,119,6,0.2);">
                  Review &amp; Resubmit Verification
                </a>
              </div>
              <p style="margin:20px 0 0 0; color:#475569; font-size:13px; line-height:1.6;">
                If you have any questions or need assistance, please contact us at <a href="mailto:surplusx.support@gmail.com" style="color:#047857; font-weight:600;">surplusx.support@gmail.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0; text-align:center;">
              <p style="margin:0 0 4px 0; color:#64748b; font-size:12px; font-weight:600;">Warm regards,<br>Team SurplusX</p>
              <p style="margin:4px 0 0 0; color:#94a3b8; font-size:11px;">Rescue Surplus. Create Impact. &bull; &copy; 2026 SurplusX. All rights reserved.</p>
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
      from: 'surplusx.support@gmail.com',
      fromName: 'SurplusX',
      replyTo: 'surplusx.support@gmail.com',
      subject,
      text,
      html,
    });
  }
}

export const emailService = EmailService.getInstance();
