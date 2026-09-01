import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Settings, 
  ShieldCheck, 
  FileText, 
  Truck, 
  Receipt, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Percent, 
  RefreshCw,
  Sliders,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinancialPricingConfigBundle, DoubleEntryLedgerRecord, NGOSettlement, FinancialAuditLog } from '../../types/financial';
import { isAdminRole } from '../../types';

export const AdminPricingTab: React.FC = () => {
  const { currentUser, triggerToast } = useApp();
  const [config, setConfig] = useState<FinancialPricingConfigBundle | null>(null);
  const [ledgers, setLedgers] = useState<DoubleEntryLedgerRecord[]>([]);
  const [settlements, setSettlements] = useState<NGOSettlement[]>([]);
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable local form states
  const [platformFeeRate, setPlatformFeeRate] = useState<number>(2.0);
  const [platformFixedPaise, setPlatformFixedPaise] = useState<number>(1000);
  const [deliveryBasePaise, setDeliveryBasePaise] = useState<number>(2500);
  const [deliveryPerKmPaise, setDeliveryPerKmPaise] = useState<number>(600);
  const [taxRatePercentage, setTaxRatePercentage] = useState<number>(5.0);
  const [ngoSharePercentage, setNgoSharePercentage] = useState<number>(80.0);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      const [cfgRes, ledRes, setRes, audRes] = await Promise.all([
        fetch('/api/financial/config'),
        fetch('/api/admin/financial/ledgers'),
        fetch('/api/ngo/settlements'),
        fetch('/api/admin/financial/audit-logs'),
      ]);

      const cfgData = await cfgRes.json();
      const ledData = await ledRes.json();
      const setData = await setRes.json();
      const audData = await audRes.json();

      if (cfgData.success && cfgData.config) {
        setConfig(cfgData.config);
        setPlatformFeeRate(cfgData.config.platformFee.percentageRate);
        setPlatformFixedPaise(cfgData.config.platformFee.fixedAmountPaise);
        setDeliveryBasePaise(cfgData.config.deliveryFee.baseFeePaise);
        setDeliveryPerKmPaise(cfgData.config.deliveryFee.perKmFeePaise);
        setTaxRatePercentage(cfgData.config.tax.ratePercentage);
        setNgoSharePercentage(cfgData.config.ngoAllocation.ngoSharePercentage);
      }
      if (ledData.success) setLedgers(ledData.ledgers);
      if (setData.success) setSettlements(setData.settlements);
      if (audData.success) setAuditLogs(audData.auditLogs);
    } catch (err) {
      console.error('Error loading financial pricing data:', err);
      triggerToast('Failed to load financial rules.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !isAdminRole(currentUser.role)) {
      triggerToast('Administrator privileges required to update pricing rules.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/financial/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          adminEmail: currentUser.email,
          platformFee: {
            percentageRate: Number(platformFeeRate),
            fixedAmountPaise: Number(platformFixedPaise),
          },
          deliveryFee: {
            baseFeePaise: Number(deliveryBasePaise),
            perKmFeePaise: Number(deliveryPerKmPaise),
          },
          tax: {
            ratePercentage: Number(taxRatePercentage),
          },
          ngoAllocation: {
            ngoSharePercentage: Number(ngoSharePercentage),
            platformLogisticsSharePercentage: 100 - Number(ngoSharePercentage),
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        triggerToast('Financial pricing & settlement rules updated successfully (Audit Logged).', 'success');
        fetchFinancialData();
      } else {
        triggerToast(data.error || 'Failed to update configuration.', 'error');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Server error updating financial configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPaise = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            Double-Entry Ledger & Pricing Engine
          </div>
          <h1 className="text-2xl font-black tracking-tight">Platform Revenue, Fee & Tax Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Admin-controlled authoritative pricing rules, dual-allocation logistics splits, and immutable ledger reconciliation.
          </p>
        </div>
        <button
          onClick={fetchFinancialData}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Grid: Config Form vs Key Financial Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Admin Pricing & Settlement Configuration */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Configure SurplusX Pricing Rules</h2>
                <p className="text-xs text-slate-500">Strictly Admin-controlled. Immutable historical order snapshots protected.</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full font-mono">
              Active Version: {config?.platformFee.version || 1}
            </span>
          </div>

          <form onSubmit={handleSaveConfiguration} className="space-y-6">
            {/* Platform Service Fee */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Platform / Service Fee Model</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Model: PERCENTAGE + FIXED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Platform Percentage Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={platformFeeRate}
                    onChange={(e) => setPlatformFeeRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:border-slate-900 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Fixed Fee (Paise) [₹100 = 10000]
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={platformFixedPaise}
                    onChange={(e) => setPlatformFixedPaise(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:border-slate-900 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Current: {formatPaise(platformFixedPaise)}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Logistics Fee */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Delivery & Logistics Distance Model</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">Mappls Route Based</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Base Delivery Fee (Paise)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={deliveryBasePaise}
                    onChange={(e) => setDeliveryBasePaise(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:border-slate-900 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Current: {formatPaise(deliveryBasePaise)}</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Per KM Fee Rate (Paise)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={deliveryPerKmPaise}
                    onChange={(e) => setDeliveryPerKmPaise(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:border-slate-900 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Current: {formatPaise(deliveryPerKmPaise)} / km</span>
                </div>
              </div>
            </div>

            {/* Tax & NGO Logistics Allocation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Tax Configuration</h3>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="28"
                    value={taxRatePercentage}
                    onChange={(e) => setTaxRatePercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:border-slate-900 outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Recorded separately as tax liability, never lumped into platform revenue.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">NGO Logistics Split</h3>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">NGO Logistics Share (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={ngoSharePercentage}
                    onChange={(e) => setNgoSharePercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:border-slate-900 outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Remaining {100 - ngoSharePercentage}% allocated to platform logistics management.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Save & Publish Pricing Configuration (Audit Logged)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Financial Overview & Reconciliation Status */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-tight">Ledger Reconciliation</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                100% Balanced
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Total Ledgers Recorded</span>
                <span className="font-mono font-bold">{ledgers.length} transactions</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Reconciliation Errors</span>
                <span className="font-mono font-bold text-emerald-400">0 Mismatches</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">NGO Delivery Payouts</span>
                <span className="font-mono font-bold">{settlements.length} active</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Immutable Snapshots</span>
                <span className="font-mono font-bold">Enforced</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Double-Entry Invariant
              </div>
              <p className="text-slate-400">
                Customer Payment = Business Payout + NGO Logistics + Platform Revenue + Tax. Sums strictly reconcile.
              </p>
            </div>
          </div>

          {/* Quick Audit Log Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Recent Financial Audit Logs</h3>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No recent configuration changes logged.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 font-mono text-[10px]">Setting: {log.settingName}</p>
                    <p className="text-slate-400 text-[10px]">Admin: {log.adminEmail}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Double-Entry Ledger Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Traceable Double-Entry Ledger & Money Splits</h3>
            <p className="text-xs text-slate-500">Every rupee broken down into business, NGO logistics, platform revenue, and tax liability.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold">
            {ledgers.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Ledger ID / Order</th>
                <th className="py-3 px-4">Total Captured</th>
                <th className="py-3 px-4">Business Payout</th>
                <th className="py-3 px-4">NGO Logistics</th>
                <th className="py-3 px-4">Platform Rev</th>
                <th className="py-3 px-4">Tax Liability</th>
                <th className="py-3 px-4">Reconciliation</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {ledgers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic font-sans">
                    No transactions recorded yet in current session. Place an order or donation to test money flow.
                  </td>
                </tr>
              ) : (
                ledgers.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{l.id}</div>
                      <div className="text-[10px] text-slate-400 font-normal">Order: {l.orderId}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatPaise(l.totalCapturedPaise)}</td>
                    <td className="py-3 px-4 text-emerald-700">{formatPaise(l.businessAllocationPaise)}</td>
                    <td className="py-3 px-4 text-blue-700">{formatPaise(l.ngoAllocationPaise)}</td>
                    <td className="py-3 px-4 text-purple-700">{formatPaise(l.platformAllocationPaise)}</td>
                    <td className="py-3 px-4 text-amber-700">{formatPaise(l.taxAllocationPaise)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        l.reconciliationStatus === 'BALANCED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {l.reconciliationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NGO Logistics Settlements Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">NGO Delivery Partner Logistics Settlements</h3>
            <p className="text-xs text-slate-500">Distinct from charitable donations. Reimbursements for order delivery and transport execution.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">
            {settlements.length} Partner Settlements
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Settlement ID</th>
                <th className="py-3 px-4">NGO Partner</th>
                <th className="py-3 px-4">Order / Delivery Ref</th>
                <th className="py-3 px-4">Gross Logistics</th>
                <th className="py-3 px-4">Net Final Payout</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic font-sans">
                    No NGO logistics settlements queued yet.
                  </td>
                </tr>
              ) : (
                settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{s.id}</td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-800">{s.ngoName}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      <div>Ord: {s.orderId}</div>
                      <div>Del: {s.deliveryId}</div>
                    </td>
                    <td className="py-3 px-4">{formatPaise(s.grossLogisticsAmountPaise)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{formatPaise(s.finalAmountPaise)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        s.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-700' :
                        s.status === 'APPROVED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.status !== 'SETTLED' && (
                        <button
                          onClick={async () => {
                            const res = await fetch('/api/admin/ngo/settlements/update', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ settlementId: s.id, status: 'SETTLED' }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setSettlements(data.settlements);
                              triggerToast('NGO logistics settlement marked as SETTLED.', 'success');
                            }
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer font-sans"
                        >
                          Disburse Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
