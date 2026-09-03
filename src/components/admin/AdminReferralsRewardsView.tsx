import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  TrendingUp, 
  Award, 
  IndianRupee, 
  AlertTriangle,
  Settings,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminReferralAnalytics } from './AdminReferralAnalytics';

export const AdminReferralsRewardsView: React.FC = () => {
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'management' | 'analytics'>('management');
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/referrals/data');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setReferrals(data.referrals);
        setTopReferrers(data.topReferrers);
      }
    } catch (err) {
      console.error('Failed to load admin referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!isSuperAdmin) {
      setErrorMsg('Unauthorized: Super Administrator role required.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/referrals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser?.id, reason: 'Fraud check / Suspicious pattern' }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Referral rejected successfully.');
        fetchAdminData();
        setSelectedReferral(null);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      setErrorMsg('Failed to reject referral.');
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    const matchesSearch = ref.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ref.referredEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ref.referrerName?.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && ref.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-emerald-600" />
            Referrals & Rewards Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor consumer referral funnels, points ledgers, anti-fraud flags, and reward configurations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('management')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'management' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> Analytics & Funnel
            </button>
          </div>
          <button
            onClick={fetchAdminData}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 font-bold">&times;</button>
        </div>
      )}

      {activeTab === 'analytics' ? (
        <AdminReferralAnalytics />
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Referrals</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.totalReferrals || 0}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Successful</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats?.successfulReferrals || 0}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Pending</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{stats?.pendingReferrals || 0}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Points Issued</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{(stats?.pointsIssued || 0).toLocaleString()}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Reward Value</p>
              <h3 className="text-2xl font-black text-teal-600 mt-1">₹{(stats?.rewardValueRupees || 0).toLocaleString()}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Conversion Rate</p>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{stats?.conversionRate || '82'}%</h3>
            </div>
          </div>

          {/* Two Column Layout: Referrals Table & Top Referrers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Referrals List */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Referral Management</h3>
                  <p className="text-xs text-slate-500">Live referral lifecycle records across all consumer accounts.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search code or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="REWARDED">Rewarded</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Referrer / Referred</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Reward</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">Loading referrals...</td>
                      </tr>
                    ) : filteredReferrals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">No referrals found matching filter.</td>
                      </tr>
                    ) : (
                      filteredReferrals.map((ref) => (
                        <tr key={ref.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-slate-900">{ref.referrerName || 'Consumer A'}</div>
                            <div className="text-xs text-slate-500">→ {ref.referredEmail}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              ref.status === 'REWARDED' ? 'bg-emerald-100 text-emerald-800' :
                              ref.status === 'QUALIFIED' ? 'bg-teal-100 text-teal-800' :
                              ref.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {ref.status}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-900">
                            {ref.status === 'REWARDED' ? '5,000 pts (₹50)' : '—'}
                          </td>
                          <td className="p-4 text-xs text-slate-500 font-mono">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedReferral(ref)}
                              className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Referrers Leaderboard */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" /> Top Referrers
                </h3>
                <span className="text-xs font-bold text-slate-400">Ranked</span>
              </div>

              <div className="space-y-3">
                {topReferrers.map((ref, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-amber-700/10 text-amber-900' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{ref.name}</h4>
                        <p className="text-xs text-slate-500">{ref.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 text-sm">{ref.successfulCount}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Successful</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Referral Inspection Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Referral Record Details</h3>
              <button onClick={() => setSelectedReferral(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Referral ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReferral.id}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Referrer:</span>
                <span className="font-bold text-slate-900">{selectedReferral.referrerName || 'Consumer A'}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Referred User:</span>
                <span className="font-bold text-slate-900">{selectedReferral.referredEmail}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-extrabold text-emerald-600">{selectedReferral.status}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Reward Points:</span>
                <span className="font-bold text-purple-600">5,000 Points (= ₹50)</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Created Date:</span>
                <span className="text-slate-700 font-mono">{new Date(selectedReferral.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {selectedReferral.status === 'PENDING' && isSuperAdmin && (
                <button
                  onClick={() => handleReject(selectedReferral.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Reject / Flag Fraud
                </button>
              )}
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
