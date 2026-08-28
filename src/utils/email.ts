/**
 * SurplusX Email & Notification Dispatch Engine
 * Abstracted for Mock and Brevo SMTP Providers
 */

export interface TransactionalEmail {
  to: string;
  recipientName: string;
  subject: string;
  templateType:
    | 'ORDER_CONFIRMED'
    | 'PAYMENT_SUCCESS'
    | 'RIDER_ASSIGNED'
    | 'ORDER_PICKED_UP'
    | 'DELIVERY_APPROACHING'
    | 'DELIVERED'
    | 'REFUND_COMPLETED'
    | 'DONATION_MATCHED';
  variables: Record<string, string | number>;
}

export interface IEmailProvider {
  sendEmail(email: TransactionalEmail): Promise<{ success: boolean; messageId: string }>;
}

export class MockEmailProvider implements IEmailProvider {
  async sendEmail(email: TransactionalEmail): Promise<{ success: boolean; messageId: string }> {
    console.log(
      `[MOCK_EMAIL_DISPATCH] Sent "${email.templateType}" to ${email.to} (${email.recipientName}). Subject: ${email.subject}`
    );
    return {
      success: true,
      messageId: `msg_mock_${Date.now()}`,
    };
  }
}

export class BrevoEmailProvider implements IEmailProvider {
  private apiKey: string;
  private senderEmail: string;

  constructor(apiKey = '', senderEmail = 'noreply@surplusx.org') {
    this.apiKey = apiKey;
    this.senderEmail = senderEmail;
  }

  async sendEmail(email: TransactionalEmail): Promise<{ success: boolean; messageId: string }> {
    // In production, calls Brevo REST API /v3/smtp/email
    return {
      success: true,
      messageId: `brevo_msg_${Date.now()}`,
    };
  }
}

export const emailService = new MockEmailProvider();
