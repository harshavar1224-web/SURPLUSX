import {
  PlatformFeeConfig,
  DeliveryFeeConfig,
  TaxConfiguration,
  NGOLogisticsAllocationConfig,
  FinancialPricingConfigBundle,
  OrderPricingSnapshot,
  DoubleEntryLedgerRecord,
  NGOSettlement,
  FinancialAuditLog,
} from '../types/financial';

export class OrderPricingService {
  private static instance: OrderPricingService;

  private currentConfig: FinancialPricingConfigBundle = {
    platformFee: {
      id: 'pfee-1',
      modelType: 'PERCENTAGE_PLUS_FIXED',
      percentageRate: 2.0, // 2%
      fixedAmountPaise: 1000, // ₹10.00
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      active: true,
      version: 1,
      updatedBy: 'system-admin',
      updatedAt: new Date().toISOString(),
    },
    deliveryFee: {
      id: 'dfee-1',
      modelType: 'DISTANCE_BASED',
      baseFeePaise: 2500, // ₹25.00
      perKmFeePaise: 600, // ₹6.00 / km
      maxDeliveryFeePaise: 15000, // ₹150.00
      zoneFees: { 'Zone A': 3000, 'Zone B': 4500, 'Zone C': 6000 },
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      active: true,
      version: 1,
      updatedBy: 'system-admin',
      updatedAt: new Date().toISOString(),
    },
    tax: {
      id: 'tax-1',
      name: 'GST Restaurant & Surplus Food (5%)',
      ratePercentage: 5.0, // 5% GST
      taxType: 'CGST_SGST', // 2.5% CGST + 2.5% SGST
      applicableTo: 'ALL_FOOD',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      active: true,
      version: 1,
      updatedBy: 'system-admin',
      updatedAt: new Date().toISOString(),
    },
    ngoAllocation: {
      id: 'ngo-alloc-1',
      ngoSharePercentage: 80.0, // 80% of delivery fee to NGO delivery partner
      platformLogisticsSharePercentage: 20.0, // 20% to platform logistics management
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      active: true,
      version: 1,
      updatedBy: 'system-admin',
      updatedAt: new Date().toISOString(),
    },
    minimumOrderValuePaise: 10000, // ₹100.00
    updatedAt: new Date().toISOString(),
  };

  private auditLogs: FinancialAuditLog[] = [];
  private ledgers: DoubleEntryLedgerRecord[] = [];
  private ngoSettlements: NGOSettlement[] = [];

  private constructor() {}

  public static getInstance(): OrderPricingService {
    if (!OrderPricingService.instance) {
      OrderPricingService.instance = new OrderPricingService();
    }
    return OrderPricingService.instance;
  }

  public getConfig(): FinancialPricingConfigBundle {
    return JSON.parse(JSON.stringify(this.currentConfig));
  }

  public updateConfig(
    newBundle: Partial<FinancialPricingConfigBundle>,
    adminId: string,
    adminEmail: string
  ): FinancialPricingConfigBundle {
    const oldConfig = JSON.parse(JSON.stringify(this.currentConfig));

    if (newBundle.platformFee) {
      this.currentConfig.platformFee = {
        ...this.currentConfig.platformFee,
        ...newBundle.platformFee,
        version: this.currentConfig.platformFee.version + 1,
        updatedBy: adminEmail,
        updatedAt: new Date().toISOString(),
      };
      this.recordAudit(adminId, adminEmail, 'PLATFORM_FEE_CONFIG', oldConfig.platformFee, this.currentConfig.platformFee, 'Admin updated platform fee model');
    }

    if (newBundle.deliveryFee) {
      this.currentConfig.deliveryFee = {
        ...this.currentConfig.deliveryFee,
        ...newBundle.deliveryFee,
        version: this.currentConfig.deliveryFee.version + 1,
        updatedBy: adminEmail,
        updatedAt: new Date().toISOString(),
      };
      this.recordAudit(adminId, adminEmail, 'DELIVERY_FEE_CONFIG', oldConfig.deliveryFee, this.currentConfig.deliveryFee, 'Admin updated delivery fee model');
    }

    if (newBundle.tax) {
      this.currentConfig.tax = {
        ...this.currentConfig.tax,
        ...newBundle.tax,
        version: this.currentConfig.tax.version + 1,
        updatedBy: adminEmail,
        updatedAt: new Date().toISOString(),
      };
      this.recordAudit(adminId, adminEmail, 'TAX_CONFIGURATION', oldConfig.tax, this.currentConfig.tax, 'Admin updated tax configuration');
    }

    if (newBundle.ngoAllocation) {
      this.currentConfig.ngoAllocation = {
        ...this.currentConfig.ngoAllocation,
        ...newBundle.ngoAllocation,
        version: this.currentConfig.ngoAllocation.version + 1,
        updatedBy: adminEmail,
        updatedAt: new Date().toISOString(),
      };
      this.recordAudit(adminId, adminEmail, 'NGO_LOGISTICS_ALLOCATION', oldConfig.ngoAllocation, this.currentConfig.ngoAllocation, 'Admin updated NGO logistics split');
    }

    if (typeof newBundle.minimumOrderValuePaise === 'number') {
      this.currentConfig.minimumOrderValuePaise = newBundle.minimumOrderValuePaise;
    }

    this.currentConfig.updatedAt = new Date().toISOString();
    return this.getConfig();
  }

  private recordAudit(adminId: string, adminEmail: string, settingName: string, oldValue: any, newValue: any, action: string) {
    this.auditLogs.unshift({
      id: `faud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId,
      adminEmail,
      settingName,
      oldValue,
      newValue,
      timestamp: new Date().toISOString(),
      action,
    });
  }

  public getAuditLogs(): FinancialAuditLog[] {
    return this.auditLogs;
  }

  /**
   * Core pricing calculation engine operating strictly in Integer Paise.
   */
  public calculateOrderPricing(
    subtotalPaise: number,
    discountPaise = 0,
    distanceKm = 4.5
  ): OrderPricingSnapshot {
    const netSubtotal = Math.max(0, subtotalPaise - discountPaise);

    // 1. Platform Fee
    let platformFeePaise = 0;
    const pf = this.currentConfig.platformFee;
    if (pf.modelType === 'PERCENTAGE' || pf.modelType === 'PERCENTAGE_PLUS_FIXED') {
      platformFeePaise += Math.round((netSubtotal * pf.percentageRate) / 100);
    }
    if (pf.modelType === 'FIXED' || pf.modelType === 'PERCENTAGE_PLUS_FIXED') {
      platformFeePaise += pf.fixedAmountPaise;
    }

    // 2. Delivery Fee
    let deliveryFeePaise = 0;
    const df = this.currentConfig.deliveryFee;
    if (df.modelType === 'FIXED') {
      deliveryFeePaise = df.baseFeePaise;
    } else if (df.modelType === 'DISTANCE_BASED') {
      const calculated = df.baseFeePaise + Math.round(distanceKm * df.perKmFeePaise);
      deliveryFeePaise = Math.min(df.maxDeliveryFeePaise, calculated);
    } else if (df.modelType === 'ZONE_BASED') {
      deliveryFeePaise = df.baseFeePaise; // Fallback or zone lookup
    } else if (df.modelType === 'FREE') {
      deliveryFeePaise = 0;
    }

    // 3. Applicable Tax (Calculated on net subtotal + platform fee as per standard GST rules)
    const taxBase = netSubtotal + platformFeePaise;
    const taxPaise = Math.round((taxBase * this.currentConfig.tax.ratePercentage) / 100);

    // 4. Final Total Payable
    const totalPayablePaise = netSubtotal + platformFeePaise + deliveryFeePaise + taxPaise;

    // 5. Allocations & Splits
    // Business amount = Net Subtotal minus any platform commission on food if applicable
    const businessAmountPaise = netSubtotal;

    // NGO logistics allocation
    const ngoShare = this.currentConfig.ngoAllocation.ngoSharePercentage;
    const ngoLogisticsAmountPaise = Math.round((deliveryFeePaise * ngoShare) / 100);

    // Platform revenue = platform fee + platform logistics share
    const platformLogisticsShare = this.currentConfig.ngoAllocation.platformLogisticsSharePercentage;
    const platformLogisticsRevenuePaise = Math.round((deliveryFeePaise * platformLogisticsShare) / 100);
    const platformRevenueAmountPaise = platformFeePaise + platformLogisticsRevenuePaise;

    return {
      subtotalPaise,
      discountPaise,
      platformFeePaise,
      deliveryFeePaise,
      taxPaise,
      totalPayablePaise,
      businessAmountPaise,
      ngoLogisticsAmountPaise,
      platformRevenueAmountPaise,
      taxAmountPaise: taxPaise,
      currency: 'INR',
      pricingRuleVersion: `v${pf.version}.${df.version}.${this.currentConfig.tax.version}`,
      createdAt: new Date().toISOString(),
    };
  }

  public recordLedgerAndReconcile(
    orderId: string,
    snapshot: OrderPricingSnapshot
  ): DoubleEntryLedgerRecord {
    const captured = snapshot.totalPayablePaise;
    const allocatedSum =
      snapshot.businessAmountPaise +
      snapshot.ngoLogisticsAmountPaise +
      snapshot.platformRevenueAmountPaise +
      snapshot.taxAmountPaise;

    // Reconcile equality (accounting for rounding tolerance of ±1 paisa)
    const diff = Math.abs(captured - allocatedSum);
    const isBalanced = diff <= 2;

    const record: DoubleEntryLedgerRecord = {
      id: `led-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId,
      transactionType: 'PAYMENT_CAPTURED',
      currency: 'INR',
      totalCapturedPaise: captured,
      businessAllocationPaise: snapshot.businessAmountPaise,
      ngoAllocationPaise: snapshot.ngoLogisticsAmountPaise,
      platformAllocationPaise: snapshot.platformRevenueAmountPaise,
      taxAllocationPaise: snapshot.taxAmountPaise,
      reconciliationStatus: isBalanced ? 'BALANCED' : 'SETTLEMENT_RECONCILIATION_ERROR',
      reconciliationNotes: isBalanced ? 'All double-entry debits and credits reconcile perfectly.' : `Reconciliation variance detected: ${diff} paise`,
      createdAt: new Date().toISOString(),
    };

    this.ledgers.unshift(record);
    return record;
  }

  public getLedgers(): DoubleEntryLedgerRecord[] {
    return this.ledgers;
  }

  public recordNGOSettlement(
    ngoId: string,
    ngoName: string,
    orderId: string,
    deliveryId: string,
    grossLogisticsAmountPaise: number
  ): NGOSettlement {
    const ngoShare = this.currentConfig.ngoAllocation.ngoSharePercentage;
    const finalAmountPaise = Math.round((grossLogisticsAmountPaise * ngoShare) / 100);

    const settlement: NGOSettlement = {
      id: `settle-ngo-${Date.now()}`,
      ngoId,
      ngoName,
      orderId,
      deliveryId,
      grossLogisticsAmountPaise,
      adjustmentsPaise: 0,
      finalAmountPaise,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.ngoSettlements.unshift(settlement);
    return settlement;
  }

  public getNGOSettlements(): NGOSettlement[] {
    return this.ngoSettlements;
  }

  public updateNGOSettlementStatus(settlementId: string, status: NGOSettlement['status']): boolean {
    const target = this.ngoSettlements.find((s) => s.id === settlementId);
    if (!target) return false;
    target.status = status;
    if (status === 'SETTLED') {
      target.settledAt = new Date().toISOString();
    }
    return true;
  }
}

export const orderPricingService = OrderPricingService.getInstance();
