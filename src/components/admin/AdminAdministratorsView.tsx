import React from 'react';
import { Users2, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAdministratorsView: React.FC = () => {
  const { allUsers, currentUser, triggerToast, addAuditLog } = useApp();

  const admins = allUsers.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');

  const handleCreateAdmin = () => {
    triggerToast('New administrator account creation prompt initiated.', 'success');
    addAuditLog('ADMIN_CREATED', 'SUPER_ADMIN', 'Super Admin initiated new administrator credential creation.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
              SUPER ADMIN ONLY
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users2 className="w-6 h-6 text-purple-600" /> Administrator Account Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage platform admin and super admin credentials, role permissions, and access logs.
          </p>
        </div>

        {currentUser?.role === 'SUPER_ADMIN' && (
          <button
            onClick={handleCreateAdmin}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" /> Provision New Admin
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Administrator Name</th>
              <th className="py-3.5 px-6">Email</th>
              <th className="py-3.5 px-6">Role Privilege</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                    {admin.name.charAt(0)}
                  </div>
                  <div>
                    <span>{admin.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{admin.id}</span>
                  </div>
                </td>
                <td className="py-3.5 px-6 text-slate-600">{admin.email}</td>
                <td className="py-3.5 px-6">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      admin.role === 'SUPER_ADMIN'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {admin.role}
                  </span>
                </td>
                <td className="py-3.5 px-6">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                  </span>
                </td>
                <td className="py-3.5 px-6 text-right">
                  {admin.role !== 'SUPER_ADMIN' && currentUser?.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => {
                        triggerToast(`Revoked admin access for ${admin.name}.`, 'warning');
                        addAuditLog('ADMIN_REVOKED', 'SUPER_ADMIN', `Revoked admin role from ${admin.email}.`);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Revoke Admin Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
