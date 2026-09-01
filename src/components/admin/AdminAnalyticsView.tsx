import React from 'react';
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAnalyticsView: React.FC = () => {
  const { orders, allUsers, businesses, ngos } = useApp();

  const totalGMV = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" /> Platform Analytics & Growth Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deep financial metrics, platform fee take-rates, order velocity, and user acquisition.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Gross Merchandise Value (GMV)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">₹{totalGMV.toLocaleString()}</div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">↑ 14.2% this month</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Platform Take Rate (5%)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">₹{(totalGMV * 0.05).toLocaleString()}</div>
          <span className="text-xs text-purple-600 font-semibold mt-1 block">Escrow settled</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Ecosystem Accounts</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{allUsers.length}</div>
          <span className="text-xs text-blue-600 font-semibold mt-1 block">{businesses.length} merchants, {ngos.length} NGOs</span>
        </div>
      </div>
    </div>
  );
};
