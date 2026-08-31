export type CurrencyCode = 'INR';

export type FeeModelType = 'PERCENTAGE' | 'FIXED' | 'PERCENTAGE_PLUS_FIXED' | 'FREE';

export type DeliveryFeeModelType = 'FIXED' | 'DISTANCE_BASED' | 'ZONE_BASED' | 'FREE';

export type TaxType = 'GST' | 'CGST_SGST' | 'IGST' | 'EXEMPT';

export type OrderCancellationState =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CANCELLED_BEFORE_PAYMENT'
  | 'CANCELLED_AFTER_PAYMENT'
  | 'CANCELLED_BEFORE_PICKUP'
  | 'CANCELLED_AFTER_PICKUP'
  | 'DELIVERY_FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'COMPLETED';

export type NGOSettlementStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'SETTLED'
  | 'FAILED'
  | 'CANCELLED';

export interface PlatformFeeConfig {
  id: string;
  modelType: FeeModelType;
  percentageRate: number; // e.g. 2.5 for 2.5%
  fixedAmountPaise: number; // e.g. 1500 for ₹15.00
  effectiveFrom: string; // ISO date string
  effectiveUntil?: string;
  active: boolean;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export interface DeliveryFeeConfig {
  id: string;
  modelType: DeliveryFeeModelType;
  baseFeePaise: number; // e.g. 3000 for ₹30.00
  perKmFeePaise: number; // e.g. 800 for ₹8.00/km
  maxDeliveryFeePaise: number; // e.g. 15000 for ₹150.00
  zoneFees: { [zoneName: string]: number }; // in paise
  effectiveFrom: string;
  effectiveUntil?: string;
  active: boolean;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export interface TaxConfiguration {
  id: string;
  name: string; // e.g. "GST Standard Restaurant Food"
  ratePercentage: number; // e.g. 5.0 for 5% GST
  taxType: TaxType;
  applicableTo: 'ALL_FOOD' | 'GROCERY' | 'DELIVERY_SERVICES' | 'PACKAGING';
  effectiveFrom: string;
  effectiveUntil?: string;
  active: boolean;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export interface NGOLogisticsAllocationConfig {
  id: string;
  ngoSharePercentage: number; // e.g. 80.0 for 80% of delivery fee goes to NGO partner
  platformLogisticsSharePercentage: number; // e.g. 20.0 for 20%
  effectiveFrom: string;
  effectiveUntil?: string;
  active: boolean;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export interface FinancialPricingConfigBundle {
  platformFee: PlatformFeeConfig;
  deliveryFee: DeliveryFeeConfig;
  tax: TaxConfiguration;
  ngoAllocation: NGOLogisticsAllocationConfig;
  minimumOrderValuePaise: number;
  updatedAt: string;
}

export interface OrderPricingSnapshot {
  subtotalPaise: number;
  discountPaise: number;
  platformFeePaise: number;
  deliveryFeePaise: number;
  taxPaise: number;
  totalPayablePaise: number;
  businessAmountPaise: number;
  ngoLogisticsAmountPaise: number;
  platformRevenueAmountPaise: number;
  taxAmountPaise: number;
  currency: CurrencyCode;
  pricingRuleVersion: string;
  createdAt: string;
}

export interface DoubleEntryLedgerRecord {
  id: string;
  orderId: string;
  transactionType: 'PAYMENT_CAPTURED' | 'REFUND_ISSUED' | 'SETTLEMENT_DISBURSED';
  currency: CurrencyCode;
  totalCapturedPaise: number;
  businessAllocationPaise: number;
  ngoAllocationPaise: number;
  platformAllocationPaise: number;
  taxAllocationPaise: number;
  reconciliationStatus: 'BALANCED' | 'SETTLEMENT_RECONCILIATION_ERROR';
  reconciliationNotes?: string;
  createdAt: string;
}

export interface NGOSettlement {
  id: string;
  ngoId: string;
  ngoName: string;
  orderId: string;
  deliveryId: string;
  grossLogisticsAmountPaise: number;
  adjustmentsPaise: number;
  finalAmountPaise: number;
  status: NGOSettlementStatus;
  createdAt: string;
  settledAt?: string;
}

export interface FinancialAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  settingName: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  action: string;
}
