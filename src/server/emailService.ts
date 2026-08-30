/**
 * SurplusX Transactional Email Service — Exclusively Brevo Powered
 * 
 * Production-Grade Architecture:
 * - Provider: Brevo (https://brevo.com / Sendinblue)
 * - Endpoint: POST https://api.brevo.com/v3/smtp/email
 * - Authentication: api-key: BREVO_API_KEY
 * - Environment Variables:
 *     BREVO_API_KEY: Secret API key for Brevo transactional email API
 *     BREVO_FROM_EMAIL: Verified sender email (e.g., no-reply@surplusx.in or verify@surplusx.in)
 *     BREVO_FROM_NAME: Verified sender name (e.g., SurplusX or SurplusX Security)
 * 
 * Strict Zero-Leakage Security Rules:
 * 1. OTP is rendered ONLY inside the outgoing email dispatched to the user's real inbox.
 * 2. OTP is NEVER logged, never returned in API responses, and never stored in plaintext.
 * 3. BREVO_API_KEY is server-side only and never exposed to the frontend.
 * 4. Masked recipient logging only (e.g. h****a@gmail.com).
 * 5. Returns EMAIL_SEND_FAILED or EMAIL_SERVICE_NOT_CONFIGURED on failure — never fake success.
 */

export interface SendEmailOptions {
  to: string;
  toName?: string;
  fromEmail?: string;
  fromName?: string;
  subject: string;
  textContent: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}

export interface SendEmailResult {
  success: boolean;
  provider: 'Brevo';
  status?: string;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private static instance: EmailService;
  private readonly brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

  private constructor() {}

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
   * Check if Brevo is fully configured on the server
   */
  public isConfigured(): boolean {
    const apiKey = (process.env.BREVO_API_KEY || '').trim();
    const fromEmail = (process.env.BREVO_FROM_EMAIL || '').trim();
    return !!apiKey && !!fromEmail;
  }

  /**
   * Diagnostic summary (safe for logs & internal checks)
   */
  public getConfigurationStatus() {
    const apiKey = (process.env.BREVO_API_KEY || '').trim();
    const fromEmail = (process.env.BREVO_FROM_EMAIL || '').trim();
    const fromName = (process.env.BREVO_FROM_NAME || 'SurplusX').trim();

    return {
      provider: 'Brevo',
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? `${apiKey.slice(0, 4)}...` : 'not_set',
      fromEmail: fromEmail || 'not_set',
      fromName,
      isConfigured: !!apiKey && !!fromEmail,
    };
  }

  /**
   * Dispatch transactional email via Brevo API (POST https://api.brevo.com/v3/smtp/email)
   */
  public async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const apiKey = (process.env.BREVO_API_KEY || '').trim();
    const defaultFromEmail = (process.env.BREVO_FROM_EMAIL || '').trim();
    const defaultFromName = (process.env.BREVO_FROM_NAME || 'SurplusX').trim();

    const maskedRecipient = this.maskEmail(options.to);

    if (!apiKey) {
      const errorMsg = 'BREVO_API_KEY is not configured on the server. Please set BREVO_API_KEY in environment variables.';
      console.warn(`[Brevo EmailService] Cannot send email to ${maskedRecipient}: ${errorMsg}`);
      return {
        success: false,
        provider: 'Brevo',
        status: 'EMAIL_SERVICE_NOT_CONFIGURED',
        error: errorMsg,
      };
    }

    const senderEmail = (options.fromEmail || defaultFromEmail).trim();
    const senderName = (options.fromName || defaultFromName).trim();

    if (!senderEmail) {
      const errorMsg = 'BREVO_FROM_EMAIL is not configured. Please set a verified sender address (e.g., no-reply@surplusx.in) in BREVO_FROM_EMAIL.';
      console.warn(`[Brevo EmailService] Cannot send email to ${maskedRecipient}: ${errorMsg}`);
      return {
        success: false,
        provider: 'Brevo',
        status: 'EMAIL_SERVICE_NOT_CONFIGURED',
        error: errorMsg,
      };
    }

    const payload = {
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: options.to.trim().toLowerCase(),
          name: options.toName || options.to.split('@')[0],
        },
      ],
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    };

    try {
      const response = await fetch(this.brevoApiUrl, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData: any = {};
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (!response.ok) {
        const errorMsg = responseData.message || responseData.error || `Brevo API returned HTTP ${response.status} (${responseData.code || 'unknown'})`;
        console.warn(`[Brevo EmailService] Brevo rejected dispatch to ${maskedRecipient}: ${errorMsg}`);
        return {
          success: false,
          provider: 'Brevo',
          status: 'EMAIL_SEND_FAILED',
          error: `Brevo API error: ${errorMsg}`,
        };
      }

      const messageId = responseData.messageId || `brevo_${Date.now()}`;
      // Safe diagnostic log (NEVER logs OTP or API keys)
      console.log(`[Brevo EmailService] Email successfully accepted by Brevo for ${maskedRecipient} (messageId: ${messageId})`);

      return {
        success: true,
        provider: 'Brevo',
        status: 'OTP_SENT',
        messageId,
      };
    } catch (err: any) {
      const errorMsg = err.message || 'Network dispatch exception';
      console.warn(`[Brevo EmailService] Network error dispatching to ${maskedRecipient}: ${errorMsg}`);
      return {
        success: false,
        provider: 'Brevo',
        status: 'EMAIL_SEND_FAILED',
        error: `Unable to connect to Brevo email service: ${errorMsg}`,
      };
    }
  }

  /**
   * 1. Send 6-Digit Email Verification OTP via Brevo
   * CRITICAL SECURITY REQUIREMENT:
   * The actual OTP is inserted into the email body ONLY and delivered directly to the user's inbox.
   */
  public async sendVerificationOTP(
    email: string,
    otp: string,
    expiresInMinutes = 5
  ): Promise<SendEmailResult> {
    const subject = 'Verify your SurplusX account';

    const textContent = `Hello,

Your SurplusX verification code is:

${otp}

This code expires in ${expiresInMinutes} minutes.

Do not share this code with anyone.

If you did not request this code, ignore this email.

Thanks,
SurplusX Team
https://surplusx.in`;

    const htmlContent = `<!DOCTYPE html>
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
                If you did not request this code, you can safely ignore this email.
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
      textContent,
      htmlContent,
    });
  }

  /**
   * 2. Send Password Reset Email via Brevo
   */
  public async sendPasswordResetEmail(
    email: string,
    resetTokenOrCode: string
  ): Promise<SendEmailResult> {
    const subject = 'Reset your SurplusX password';
    const textContent = `Hello,\n\nWe received a request to reset your SurplusX password.\nYour reset code is: ${resetTokenOrCode}\n\nThis code expires in 15 minutes.\n\nSurplusX Security Team`;
    const htmlContent = `<p>Hello,</p><p>Your password reset code is: <strong>${resetTokenOrCode}</strong> (Valid for 15 minutes).</p>`;

    return this.sendEmail({
      to: email,
      subject,
      textContent,
      htmlContent,
    });
  }

  /**
   * 3. Send Order Receipt Email via Brevo
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
    const textContent = `Hello ${orderDetails.customerName},\n\nThank you for rescuing food with SurplusX!\nOrder ID: ${orderDetails.orderId}\nTotal: ₹${orderDetails.totalAmount}\nPickup Store: ${orderDetails.pickupStore}\n\nSurplusX`;
    const htmlContent = `<p>Hello ${orderDetails.customerName},</p><p>Thank you for rescuing food with SurplusX!</p><p>Order ID: <strong>${orderDetails.orderId}</strong><br>Total: ₹${orderDetails.totalAmount}<br>Store: ${orderDetails.pickupStore}</p>`;

    return this.sendEmail({
      to: email,
      subject,
      textContent,
      htmlContent,
    });
  }

  /**
   * 4. Send Order / Donation Notification Email via Brevo
   */
  public async sendOrderNotification(
    email: string,
    title: string,
    message: string
  ): Promise<SendEmailResult> {
    return this.sendEmail({
      to: email,
      subject: `SurplusX Notification: ${title}`,
      textContent: `${title}\n\n${message}\n\nSurplusX`,
      htmlContent: `<h3>${title}</h3><p>${message}</p>`,
    });
  }

  /**
   * 5. Test Email Dispatch (Internal Diagnostics) via Brevo
   */
  public async sendTestEmail(toEmail: string): Promise<SendEmailResult> {
    const subject = 'SurplusX Brevo Transactional Email Test';
    const textContent = `Hello,\n\nThis is a test transactional email confirming that Brevo API is configured and operational for SurplusX.\n\nTimestamp: ${new Date().toISOString()}\nSurplusX Team`;
    const htmlContent = `<h2>SurplusX Brevo Transactional Email Test</h2><p>This is a test transactional email confirming that Brevo API is configured and operational for SurplusX.</p><p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`;

    return this.sendEmail({
      to: toEmail,
      subject,
      textContent,
      htmlContent,
    });
  }
}

export const emailService = EmailService.getInstance();
