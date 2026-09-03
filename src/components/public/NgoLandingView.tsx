import React from 'react';
import { HeartHandshake, ShieldCheck, Truck, Navigation, CheckCircle2, ArrowRight, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NgoLandingView: React.FC = () => {
  const { currentUser, setActiveView, setAuthMode, setIsAuthModalOpen } = useApp();

  const handleRegisterClick = () => {
    if (currentUser) {
      if (currentUser.role === 'NGO') {
        setActiveView('dashboard');
      } else {
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
          <HeartHandshake className="w-4 h-4 text-amber-600" />
          <span>SurplusX Food Rescue & NGO Network</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Empowering Registered NGOs with Guaranteed Food Donations
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto font-medium">
          Connect your organization directly with verified local restaurants, supermarkets, and bakeries. Receive temperature-checked surplus food, track driver telemetry, and issue digital 80G tax receipts.
        </p>

        <div className="pt-2">
          <button
            onClick={handleRegisterClick}
            className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>{currentUser?.role === 'NGO' ? 'Go to NGO Command Center' : 'Apply as Registered NGO Partner'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Zero Cost Food Supply</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access free bulk meals and fresh grocery donations from top local merchants matched automatically to your shelter capacities.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Live GPS & Temperature Logs</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Real-time driver location updates, vehicle temperature logging, and geofenced OTP delivery handovers for safety verification.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Automated 80G Receipts</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Generate digitally signed 80G tax credit certificates for business donors upon verified distribution logging.
          </p>
        </div>
      </div>

      {/* Program Requirements */}
      <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-8 shadow-2xl space-y-6">
        <h3 className="text-xl font-bold text-center">NGO Qualification & Verification Checklist</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Valid 12A & 80G Tax Registration Certificate</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> NITI Aayog Darpan ID (or State Trust registration)</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Authorized representative identity proof</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> Designated distribution center address verification</div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleRegisterClick}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Submit NGO Partnership Application
          </button>
        </div>
      </div>
    </div>
  );
};
