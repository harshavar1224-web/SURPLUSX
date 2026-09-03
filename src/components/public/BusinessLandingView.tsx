import React from 'react';
import { Store, ShieldCheck, TrendingUp, DollarSign, Award, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BusinessLandingView: React.FC = () => {
  const { currentUser, setActiveView, setAuthMode, setIsAuthModalOpen } = useApp();

  const handleRegisterClick = () => {
    if (currentUser) {
      if (currentUser.role === 'BUSINESS') {
        setActiveView('dashboard');
      } else {
        // Prompt login/signup modal for business account
        setAuthMode('signup');
        setIsAuthModalOpen(true);
      }
    } else {
      setAuthMode('signup');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>SurplusX Merchant & Business Partner Portal</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Turn Surplus Inventory into Profits & Community Impact
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto font-medium">
          Join hundreds of bakeries, supermarkets, restaurants, and hotels monetizing unsold food while reducing disposal costs and claiming 80G tax benefits.
        </p>

        <div className="pt-2">
          <button
            onClick={handleRegisterClick}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>{currentUser?.role === 'BUSINESS' ? 'Go to Merchant Dashboard' : 'Register Your Business Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Value Proposition Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">New Revenue Stream</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Recover 40-70% of food production costs on end-of-day items that would otherwise go to waste. Next-day bank settlements via T+1 escrow.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Verified Category Compliance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload FSSAI, GST, and business proof once to get a verified merchant badge. Automated digital temperature and hygiene logs built-in.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">80G Tax Deductions</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Donate unreserved food to certified NGO partners with single-click routing and receive signed digital 80G tax credit receipts.
          </p>
        </div>
      </div>

      {/* Features Checklist Banner */}
      <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-8 shadow-2xl space-y-6">
        <h3 className="text-xl font-bold text-center">What You Get as a SurplusX Business Partner</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> AI-powered dynamic pricing & decay alerts</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Instant 4-digit OTP pickup validation at counter</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Automated GST tax invoice generation</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-branch inventory threshold management</div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleRegisterClick}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Get Started in 2 Minutes
          </button>
        </div>
      </div>
    </div>
  );
};
