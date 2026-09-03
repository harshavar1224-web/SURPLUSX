import React from 'react';
import { IndianRupee, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminSettlementsView: React.FC = () => {
  const { allUsers, triggerToast } = useApp();
  const safeUsers = allUsers || [];
  const businesses = safeUsers.filter(u => u.role === 'BUSINESS');

  const handleSettle = (name: string) => {
    triggerToast(`Settlement processed successfully for merchant ${name}.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-600" /> Business & NGO Payout Settlements
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile financial ledger accounts, platform commission take-rates, and bank payouts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Merchant / Partner</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Pending Payout</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {(businesses || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No payout accounts registered.
                </td>
              </tr>
            ) : (
              (businesses || []).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{b.name}</td>
                  <td className="py-3.5 px-6 text-slate-600">{b.category}</td>
                  <td className="py-3.5 px-6 font-extrabold text-emerald-600">₹4,250.00</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      READY TO SETTLE
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleSettle(b.name)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors"
                    >
                      Process Payout
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
