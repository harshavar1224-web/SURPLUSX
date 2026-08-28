import React from 'react';
import { Lock, ArrowRight, Sparkles, ShoppingBag, Store, HeartHandshake, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';

interface AuthRequiredProps {
  title?: string;
  description?: string;
  targetView?: string;
}

export const AuthRequired: React.FC<AuthRequiredProps> = ({
  title = 'Please sign in to access your account',
  description = 'SurplusX accounts let you reserve surplus food at 50-70% discount, manage orders, track deliveries with live GPS, and measure your CO₂ rescue impact.',
  targetView,
}) => {
  const { setIsAuthModalOpen, setAuthMode, setPendingIntent, setActiveView } = useApp();

  const handleSignIn = () => {
    if (targetView) {
      setPendingIntent({
        type: 'NAVIGATE',
        targetView,
        description: `Access ${targetView}`,
      });
    }
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSignUp = () => {
    if (targetView) {
      setPendingIntent({
        type: 'NAVIGATE',
        targetView,
        description: `Access ${targetView}`,
      });
    }
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
            <span>Authentication Required</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-xs text-left space-y-2.5">
          <div className="flex items-center gap-2.5 text-slate-700">
            <ShoppingBag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Lock & reserve surplus food before expiry</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Secure 6-digit OTP verification at store pickup</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-700">
            <HeartHandshake className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Track live fleet deliveries & NGO meal rescues</span>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleSignIn}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSignUp}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-extrabold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Create New Account</span>
          </button>

          <button
            onClick={() => setActiveView('browse')}
            className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Continue Browsing as Guest</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
