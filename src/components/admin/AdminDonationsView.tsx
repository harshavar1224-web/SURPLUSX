import React from 'react';
import { Gift, HeartHandshake } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDonationsView: React.FC = () => {
  const { donations } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-emerald-600" /> Administrative Donation Governance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervise food donations matching businesses and authorized NGO partners.
          </p>
        </div>
        <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
          Total Donations: {donations.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Donation Title</th>
              <th className="py-3.5 px-6">Donor Business</th>
              <th className="py-3.5 px-6">Quantity</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {donations.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  No donations recorded.
                </td>
              </tr>
            ) : (
              donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{d.title}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-800">{d.donorName}</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-600">{d.quantity} units</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {d.status}
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
