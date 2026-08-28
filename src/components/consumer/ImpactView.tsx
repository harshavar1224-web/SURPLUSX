import React from 'react';
import {
  Leaf,
  Award,
  Globe2,
  Droplets,
  TreePine,
  Car,
  Download,
  Share2,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Heart,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';

export const ImpactView: React.FC = () => {
  const { currentUser, setActiveView } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified Social & Planetary Impact</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Rescue Footprint</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Every surplus order directly prevents organic food landfill decomposition and fuels verified NGO feeding drives.
        </p>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
            <Leaf className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">8.6 kg</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">CO₂ Emissions Averted</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs text-center">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2">
            <Heart className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">24.3 kg</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Wholesome Food Rescued</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">12</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Community Meals Enabled</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">3,850 L</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">Virtual Water Conserved</div>
        </div>
      </div>

      {/* Real-world Equivalencies */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-4">
          <h3 className="text-lg font-extrabold text-emerald-200">Planetary Equivalencies</h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            By choosing surplus items on SurplusX instead of letting them spoil in bins, your carbon offset matches:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
              <TreePine className="w-6 h-6 text-emerald-300 mb-2" />
              <div className="text-lg font-bold">0.4 Trees</div>
              <div className="text-[11px] text-emerald-100">Grown for 1 full year</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
              <Car className="w-6 h-6 text-emerald-300 mb-2" />
              <div className="text-lg font-bold">34 km</div>
              <div className="text-[11px] text-emerald-100">Standard gasoline car travel avoided</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
              <Globe2 className="w-6 h-6 text-emerald-300 mb-2" />
              <div className="text-lg font-bold">100%</div>
              <div className="text-[11px] text-emerald-100">Methane landfill diversion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Certificate Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-200">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Certified Waste Champion
            </div>
            <h4 className="text-lg font-bold text-slate-900">Certificate of Environmental Stewardship</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued to <span className="font-semibold text-slate-800">{currentUser.name}</span> • Verified on Blockchain & Ledger
            </p>
          </div>
        </div>

        <button
          onClick={() => alert(`Certificate of Impact generated for ${currentUser.name} (Cert ID: SX-CERT-88401)`)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Certificate (PDF)</span>
        </button>
      </div>
    </div>
  );
};
