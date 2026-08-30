/**
 * SurplusX Email Types and Helpers
 * Server-side transactional emails are dispatched via the Google Gmail API.
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
  variables?: Record<string, string | number>;
}
