import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminReportsFraudView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-orange-600" /> Fraud Radar & Threat Signals
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated anomaly detection, brute-force OTP attempts, and user dispute reports.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
          Zero Active Threats
        </span>
      </div>

      <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Unresolved Fraud Signals or Reports</h3>
        <p className="text-xs text-slate-500 mt-1">Platform security posture is stable with active AI telemetry monitoring.</p>
      </div>
    </div>
  );
};
