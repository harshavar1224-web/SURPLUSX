import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';

export const AdminLoginPage: React.FC = () => {
  const { setActiveView, setCurrentUser, triggerToast, addAuditLog } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please enter admin email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();

      if (data.success && data.user) {
        if (data.user.role !== 'ADMIN') {
          setErrorMsg('Access denied. Administrator privileges required.');
          setIsLoading(false);
          return;
        }
        setCurrentUser(data.user);
        triggerToast('Administrator session established securely.', 'success');
        addAuditLog('ADMIN_LOGIN_SUCCESS', 'AUTH', `Admin ${data.user.email} successfully authenticated.`);
        setActiveView('admin');
      } else {
        setErrorMsg(data.error || 'Invalid admin credentials.');
        addAuditLog('ADMIN_LOGIN_FAILED', 'AUTH', `Failed admin login attempt for identifier: ${email}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error during admin authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden">
        {/* Top security ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-slate-900/5 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-mono-code font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Restricted Admin Console
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              SurplusX Admin Sign In
            </h1>
            <p className="text-xs text-slate-500">
              Platform-wide governance & cryptographic audit authentication
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@surplusx.org"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password Hash / Credentials
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In as Platform Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <button
              onClick={() => setActiveView('landing')}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              ← Back to SurplusX Public
            </button>
            <span className="font-mono">ISO 14001 Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
};
