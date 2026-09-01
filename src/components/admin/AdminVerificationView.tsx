import React from 'react';
import { FileCheck2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminVerificationView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-rose-600" /> Compliance Verification Queue
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review and approve pending business FSSAI licenses and NGO 80G / Darpan certificates.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
          Queue Clear (0 Pending)
        </span>
      </div>

      <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Pending Verification Documents</h3>
        <p className="text-xs text-slate-500 mt-1">All registered business merchants and NGO partners are fully verified.</p>
      </div>
    </div>
  );
};
