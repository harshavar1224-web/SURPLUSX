import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AccessDeniedProps {
  attemptedView?: string;
  requiredRole?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ attemptedView, requiredRole }) => {
  const { currentUser, setActiveView } = useApp();

  const getDashboardTarget = () => {
    return 'dashboard';
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'CONSUMER':
        return 'Consumer';
      case 'BUSINESS':
        return 'Business Partner';
      case 'NGO':
        return 'NGO Partner';
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Administrator';
      case 'RIDER':
        return 'Rider';
      case 'RETAILER':
        return 'Retailer';
      default:
        return 'Authorized Role';
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/60 text-rose-800 text-[11px] font-bold uppercase tracking-wider">
            <span>403 • Role Access Restricted</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Access Denied
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your account ({currentUser?.role || 'Guest'}) does not have permission to access this area.
            {requiredRole && ` This section requires ${getRoleLabel(requiredRole)} credentials.`}
          </p>
        </div>

        {/* Current Identity Box */}
        {currentUser && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-left flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Signed In As</div>
              <div className="font-bold text-slate-800">{currentUser.name}</div>
              <div className="text-slate-500 text-[11px]">{currentUser.email}</div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 font-extrabold text-[11px]">
              {currentUser.role}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            onClick={() => setActiveView(getDashboardTarget())}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to My Dashboard</span>
          </button>

          <button
            onClick={() => setActiveView('browse')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Public Marketplace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
