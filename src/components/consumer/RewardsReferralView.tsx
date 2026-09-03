import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  TrendingUp, 
  Award, 
  IndianRupee, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface WalletData {
  pointsBalance: number;
  rupeeEquivalent: number;
  totalEarned: number;
  totalRedeemed: number;
  pendingPoints: number;
  referralCode: string;
  stats: {
    invited: number;
    completed: number;
    pending: number;
  };
  ledger: Array<{
    id: string;
    transaction: string;
    points: number;
    status: 'Earned' | 'Redeemed' | 'Pending';
    date: string;
  }>;
}

export const RewardsReferralView: React.FC = () => {
  const { currentUser } = useApp();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchWalletData();
  }, [currentUser]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rewards/wallet?userId=${currentUser?.id}`);
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (err) {
      console.error('Failed to fetch rewards wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (wallet?.referralCode) {
      navigator.clipboard.writeText(wallet.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Join me on SurplusX and rescue surplus food while saving money! Use my referral code *${wallet?.referralCode}* when you sign up and complete your first order to get started.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">Loading SurplusX Rewards & Referral Wallet...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none">
          <Gift className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 text-emerald-100 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> SurplusX Rewards — Refer & Earn
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Invite Friends. Earn Surplus Points. Rescue More.
          </h1>
          <p className="text-sm text-emerald-100 leading-relaxed">
            Give your friend a SurplusX referral link. When they complete their first eligible order, you receive <strong className="text-white">5,000 Surplus Points (₹50)</strong> instantly!
          </p>
        </div>
      </div>

      {/* Wallet Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Points Balance Card */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Surplus Points Wallet</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                100 Points = ₹1
              </span>
            </div>
            
            <div className="mt-4 flex items-baseline gap-3">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {wallet?.pointsBalance?.toLocaleString() || 0}
              </h2>
              <span className="text-sm font-bold text-slate-500">Points Available</span>
            </div>

            <div className="mt-2 text-xl font-bold text-emerald-600 flex items-center gap-1">
              <span>≈ ₹{wallet?.rupeeEquivalent?.toFixed(2) || '0.00'}</span>
              <span className="text-xs font-normal text-slate-400">Rupee Value at Checkout</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-100">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Earned</p>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">+{wallet?.totalEarned?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Redeemed</p>
              <p className="text-base font-extrabold text-blue-600 mt-0.5">-{wallet?.totalRedeemed?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Pending</p>
              <p className="text-base font-extrabold text-amber-600 mt-0.5">{wallet?.pendingPoints?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Unique Referral Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> Your Referral Code
            </h3>
            <p className="text-xs text-slate-500 mt-1">Share this code with friends to earn ₹50 per successful referral.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <span className="font-mono text-2xl font-black text-slate-900 tracking-widest block">
              {wallet?.referralCode || 'SX8K4P2M'}
            </span>
            <button
              onClick={handleCopyCode}
              className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Code Copied!' : 'Copy Code'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-600" /> WhatsApp
            </button>
            <button
              onClick={handleCopyCode}
              className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4 text-slate-500" /> Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Referral Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Friends Invited</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{wallet?.stats.invited || 0}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Completed Orders</p>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">{wallet?.stats.completed || 0}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending Verification</p>
            <h4 className="text-2xl font-black text-amber-600 mt-1">{wallet?.stats.pending || 0}</h4>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Points & Referral Transaction Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Points & Referral Ledger</h3>
            <p className="text-xs text-slate-500">Immutable audit trail of all earned, redeemed, and pending points.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Audited & Secured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Transaction Details</th>
                <th className="p-4">Points</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {wallet?.ledger && wallet.ledger.length > 0 ? (
                wallet.ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        item.status === 'Earned' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Redeemed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status === 'Earned' ? '+' : '-'}
                      </div>
                      <span>{item.transaction}</span>
                    </td>
                    <td className={`p-4 font-black ${item.status === 'Earned' ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {item.status === 'Earned' ? `+${item.points.toLocaleString()}` : `-${item.points.toLocaleString()}`} pts
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.status === 'Earned' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Redeemed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-slate-500 font-mono">
                      {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">No point transactions recorded yet. Share your code to start earning!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
