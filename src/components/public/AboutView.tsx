import React from 'react';
import { ShieldCheck, HeartHandshake, Store, ShoppingBag, Globe, Award, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AboutView: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Banner */}
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300/60">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>About SurplusX</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Rescuing Food. Feeding Communities. Protecting Our Planet.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
          SurplusX is a real-time hyper-local marketplace that connects businesses with extra stock to individuals and NGOs who need it most. By digitizing surplus food rescue, we reduce environmental waste while providing affordable meals.
        </p>
      </div>

      {/* 3 Core Pillars Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">For Consumers</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access high-quality surplus meals, bakery items, and groceries from top local stores at up to 70% discount. Pick up or get fast local delivery.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">For Businesses</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Turn surplus stock into revenue, reduce disposal costs, automate FSSAI compliance logging, and claim tax deductions for verified NGO donations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">For NGO Partners</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Receive matched, temperature-monitored surplus food donations from verified local businesses with digital 80G tax receipt generation.
          </p>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="max-w-5xl mx-auto bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-extrabold flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>FSSAI Food Safety & 1:1 Security</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Every business partner undergoes strict KYC verification, store license checks, and temperature control standards to guarantee food safety.
          </p>
        </div>

        <button
          onClick={() => {
            window.history.pushState(null, '', '/browse');
            setActiveView('browse');
          }}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg cursor-pointer shrink-0 flex items-center gap-2"
        >
          <span>Explore Live Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
