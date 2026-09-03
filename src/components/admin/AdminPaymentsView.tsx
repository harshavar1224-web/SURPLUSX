import React from 'react';
import { CreditCard, IndianRupee } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminPaymentsView: React.FC = () => {
  const { orders } = useApp();
  const safeOrders = orders || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" /> Payment Records & Escrow
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time gateway payment logs, transaction statuses, and escrow settlements.
          </p>
        </div>
        <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
          Total Transactions: {safeOrders.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Transaction ID</th>
              <th className="py-3.5 px-6">Order Ref</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6">Gateway Status</th>
              <th className="py-3.5 px-6">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {safeOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No payment records found.
                </td>
              </tr>
            ) : (
              safeOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">PAY-TXN-{o.id}</td>
                  <td className="py-3.5 px-6 font-mono text-slate-600">{o.id}</td>
                  <td className="py-3.5 px-6 font-extrabold text-emerald-600">₹{o.totalAmount}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      SUCCESSFUL
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">{o.createdAt || 'Today'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
