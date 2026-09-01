import React from 'react';
import { Package, Search, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminOrdersView: React.FC = () => {
  const { orders } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" /> Platform Order Operations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time state machine tracking across all customer orders, pickups, and escrow payments.
          </p>
        </div>
        <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
          Total Orders: {orders.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Order ID</th>
              <th className="py-3.5 px-6">Consumer</th>
              <th className="py-3.5 px-6">Total Amount</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No orders recorded in the system.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{o.id}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{o.consumerName || 'Consumer'}</td>
                  <td className="py-3.5 px-6 font-extrabold text-emerald-600">₹{o.totalAmount}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">{o.createdAt || 'Just now'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
