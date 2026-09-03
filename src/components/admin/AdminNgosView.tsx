import React, { useState } from 'react';
import { HeartHandshake, Search, CheckCircle, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminNgosView: React.FC = () => {
  const { ngos, triggerToast, addAuditLog } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNgos = (ngos || []).filter((n) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (name: string) => {
    triggerToast(`NGO partner ${name} approved & 80G certified.`, 'success');
    addAuditLog('NGO_APPROVED', 'ADMIN', `Approved NGO partner ${name}.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-amber-600" /> NGO Partner Governance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervise registered NGOs, food distribution capacity, and 80G / Darpan compliance.
          </p>
        </div>
        <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
          Total NGOs: {(ngos || []).length}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search NGOs by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">NGO Name</th>
              <th className="py-3.5 px-6">Contact Person</th>
              <th className="py-3.5 px-6">Address</th>
              <th className="py-3.5 px-6">Capacity</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {(filteredNgos || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No NGO partners registered.
                </td>
              </tr>
            ) : (
              (filteredNgos || []).map((n) => (
                <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                      {n.name.charAt(0)}
                    </div>
                    <div>
                      <span>{n.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{n.id}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-800">{n.contactPerson}</td>
                  <td className="py-3.5 px-6 text-slate-600 flex items-center gap-1 pt-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {n.address}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-emerald-600">{n.mealsCapacity} meals/day</td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleApprove(n.name)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      Verify
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
