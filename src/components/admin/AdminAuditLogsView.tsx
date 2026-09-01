import React from 'react';
import { Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600" /> Cryptographic Audit Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all administrative actions, logins, updates, and configuration modifications.
          </p>
        </div>
        <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
          Total Logs: {auditLogs.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Timestamp</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Action</th>
              <th className="py-3.5 px-6">Details</th>
              <th className="py-3.5 px-6">Actor ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No audit log entries recorded.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="py-3.5 px-6 font-bold text-purple-700">{log.category}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{log.action}</td>
                  <td className="py-3.5 px-6 text-slate-600">{log.details}</td>
                  <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500">{log.actorId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
