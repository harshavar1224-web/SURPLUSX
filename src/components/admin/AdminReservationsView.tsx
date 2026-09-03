import React from 'react';
import { CalendarCheck, CreditCard, IndianRupee } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminReservationsView: React.FC = () => {
  const { orders } = useApp();
  const reservations = (orders || []).filter((o) => o.status === 'RESERVED');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-purple-600" /> Consumer Reservations Oversight
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Active surplus holds and reservation timers awaiting pickup completion.
          </p>
        </div>
        <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
          Active Holds: {(reservations || []).length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Reservation / Order ID</th>
              <th className="py-3.5 px-6">Consumer</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {(reservations || []).length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  No active consumer reservations.
                </td>
              </tr>
            ) : (
              (reservations || []).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{r.id}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{r.consumerName || 'Consumer'}</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-600">₹{r.totalAmount}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      RESERVED HOLD
                    </span>
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
