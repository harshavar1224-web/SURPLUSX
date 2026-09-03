// ============================================================================
// SURPLUSX REWARDS & REFERRAL PROGRAM ENGINE
// ============================================================================
export interface PointsLedgerItem {
  id: string;
  userId: string;
  transaction: string;
  points: number;
  status: 'Earned' | 'Redeemed' | 'Pending';
  date: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredEmail: string;
  referredUserId?: string;
  status: 'PENDING' | 'QUALIFIED' | 'REWARDED' | 'REJECTED';
  createdAt: string;
  completedAt?: string;
}

export class RewardsReferralEngine {
  private static instance: RewardsReferralEngine;

  private pointsBalances: Record<string, number> = {
    'consumer-1': 12500, // 12,500 points = ₹125.00
  };

  private referralCodes: Record<string, string> = {
    'consumer-1': 'HARSHA50',
  };

  private ledger: PointsLedgerItem[] = [
    {
      id: 'led-1',
      userId: 'consumer-1',
      transaction: 'Referral reward (Friend: Rahul M.)',
      points: 5000,
      status: 'Earned',
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'led-2',
      userId: 'consumer-1',
      transaction: 'Order #ORD-8492 redemption (-₹20)',
      points: 2000,
      status: 'Redeemed',
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'led-3',
      userId: 'consumer-1',
      transaction: 'Welcome Bonus & Profile Verification',
      points: 5500,
      status: 'Earned',
      date: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ];

  private referrals: ReferralRecord[] = [
    {
      id: 'ref-1',
      referrerId: 'consumer-1',
      referredEmail: 'rahul.m@example.com',
      status: 'REWARDED',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'ref-2',
      referrerId: 'consumer-1',
      referredEmail: 'priya.s@example.com',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  private constructor() {}

  public static getInstance(): RewardsReferralEngine {
    if (!RewardsReferralEngine.instance) {
      RewardsReferralEngine.instance = new RewardsReferralEngine();
    }
    return RewardsReferralEngine.instance;
  }

  public getWallet(userId: string) {
    const pointsBalance = this.pointsBalances[userId] || 0;
    const rupeeEquivalent = pointsBalance / 100; // 100 points = ₹1
    const userLedger = this.ledger.filter(l => l.userId === userId);
    const userReferrals = this.referrals.filter(r => r.referrerId === userId);

    const totalEarned = userLedger.filter(l => l.status === 'Earned').reduce((sum, l) => sum + l.points, 0);
    const totalRedeemed = userLedger.filter(l => l.status === 'Redeemed').reduce((sum, l) => sum + l.points, 0);
    const pendingPoints = userLedger.filter(l => l.status === 'Pending').reduce((sum, l) => sum + l.points, 0);

    let code = this.referralCodes[userId];
    if (!code) {
      code = `SX${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      this.referralCodes[userId] = code;
    }

    const invited = userReferrals.length;
    const completed = userReferrals.filter(r => r.status === 'REWARDED').length;
    const pending = userReferrals.filter(r => r.status === 'PENDING' || r.status === 'QUALIFIED').length;

    return {
      success: true,
      wallet: {
        pointsBalance,
        rupeeEquivalent,
        totalEarned,
        totalRedeemed,
        pendingPoints,
        referralCode: code,
        stats: { invited, completed, pending },
        ledger: userLedger,
      },
    };
  }

  public redeemPoints(userId: string, pointsToRedeem: number, orderId: string) {
    const current = this.pointsBalances[userId] || 0;
    if (pointsToRedeem <= 0 || pointsToRedeem > current) {
      return { success: false, error: 'Insufficient points balance or invalid redemption amount.' };
    }

    this.pointsBalances[userId] = current - pointsToRedeem;
    const rupeeVal = pointsToRedeem / 100;

    this.ledger.unshift({
      id: `led-${Date.now()}`,
      userId,
      transaction: `Order #${orderId} redemption (-₹${rupeeVal.toFixed(2)})`,
      points: pointsToRedeem,
      status: 'Redeemed',
      date: new Date().toISOString(),
    });

    return {
      success: true,
      remainingPoints: this.pointsBalances[userId],
      discountPaise: Math.round(rupeeVal * 100),
    };
  }

  public getAdminData() {
    const totalReferrals = this.referrals.length;
    const successfulReferrals = this.referrals.filter(r => r.status === 'REWARDED').length;
    const pendingReferrals = this.referrals.filter(r => r.status === 'PENDING' || r.status === 'QUALIFIED').length;
    const pointsIssued = this.ledger.filter(l => l.status === 'Earned').reduce((sum, l) => sum + l.points, 0);
    const rewardValueRupees = pointsIssued / 100;

    const topReferrerMap: Record<string, number> = {};
    this.referrals.filter(r => r.status === 'REWARDED').forEach(r => {
      topReferrerMap[r.referrerId] = (topReferrerMap[r.referrerId] || 0) + 1;
    });

    const topReferrers = Object.entries(topReferrerMap).map(([id, count]) => ({
      id,
      name: id === 'consumer-1' ? 'Harsha Vardhan' : `Consumer (${id})`,
      email: 'harsha@example.com',
      successfulCount: count,
    })).sort((a, b) => b.successfulCount - a.successfulCount);

    if (topReferrers.length === 0) {
      topReferrers.push(
        { id: 'consumer-1', name: 'Rahul Sharma', email: 'rahul@example.com', successfulCount: 48 },
        { id: 'consumer-2', name: 'Priya Verma', email: 'priya@example.com', successfulCount: 37 },
        { id: 'consumer-3', name: 'Kiran Rao', email: 'kiran@example.com', successfulCount: 31 },
      );
    }

    const enhancedReferrals = this.referrals.map(r => ({
      ...r,
      referrerName: r.referrerId === 'consumer-1' ? 'Rahul Sharma' : 'Consumer User',
    }));

    return {
      success: true,
      stats: {
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        pointsIssued,
        rewardValueRupees,
        conversionRate: 82,
      },
      referrals: enhancedReferrals,
      topReferrers,
    };
  }

  public rejectReferral(id: string, reason: string) {
    const ref = this.referrals.find(r => r.id === id);
    if (!ref) return { success: false, error: 'Referral not found.' };
    ref.status = 'REJECTED';
    return { success: true, referrals: this.referrals };
  }

  public adjustPoints(userId: string, points: number, reason: string) {
    this.pointsBalances[userId] = (this.pointsBalances[userId] || 0) + points;
    this.ledger.unshift({
      id: `led-${Date.now()}`,
      userId,
      transaction: `Admin Adjustment: ${reason}`,
      points: Math.abs(points),
      status: points >= 0 ? 'Earned' : 'Redeemed',
      date: new Date().toISOString(),
    });
    return { success: true, pointsBalance: this.pointsBalances[userId] };
  }
}

export const rewardsReferralEngine = RewardsReferralEngine.getInstance();
