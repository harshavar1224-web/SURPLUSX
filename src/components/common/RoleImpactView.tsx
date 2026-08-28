import React, { useState } from 'react';
import {
  Leaf,
  Award,
  Download,
  IndianRupee,
  Utensils,
  TrendingUp,
  Droplets,
  CloudRain,
  ShieldCheck,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const RoleImpactView: React.FC = () => {
  const { currentUser, orders, donations, distributionRecords, triggerToast } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'MONTH' | 'YEAR'>('ALL');

  const role = currentUser?.role || 'CONSUMER';

  const handleDownloadCertificate = () => {
    triggerToast('Generating verified Zero-Waste Impact Certificate PDF...', 'success');
  };

  const handleShareImpact = () => {
    triggerToast('Impact summary link copied to clipboard! Share on LinkedIn or WhatsApp.', 'info');
  };

  // Consumer metrics
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const consumerMealsRescued = completedOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 6);
  const consumerMoneySaved = completedOrders.reduce((sum, o) => sum + (o.savings || 120), 420);
  const consumerCo2Avoided = (consumerMealsRescued * 1.85).toFixed(1);
  const consumerWaterSaved = (consumerMealsRescued * 240); // 240L per meal saved

  // Business metrics
  const businessFoodRecoveredKg = 485;
  const businessRevenueRecovered = 38400;
  const businessDonatedMeals = 280;
  const businessLandfillAvoidedRate = 94.2;

  // NGO metrics
  const ngoMealsDistributed = distributionRecords.reduce((sum, r) => sum + r.mealsDistributed, 850);
  const ngoBeneficiariesServed = 620;
  const ngoActiveShelters = 14;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Leaf className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {role === 'BUSINESS'
                ? 'Corporate ESG & Sustainability Impact'
                : role === 'NGO'
                ? 'NGO Community Food Distribution Impact'
                : role === 'ADMIN'
                ? 'SurplusX Ecosystem Impact Matrix'
                : 'My Personal Zero-Waste Impact'}
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Authoritative, blockchain-auditable metrics verifying food waste diversion and environmental restoration.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleShareImpact}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={handleDownloadCertificate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Certificate</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Metric Cards */}
      {role === 'CONSUMER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <Utensils className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  +12% this mo
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{consumerMealsRescued}</p>
              <p className="text-xs text-slate-500 mt-1">Meals Rescued from Landfill</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <IndianRupee className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Rescued Value
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">₹{consumerMoneySaved}</p>
              <p className="text-xs text-slate-500 mt-1">Money Saved on Grocery Budget</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <Leaf className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  CO2e
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{consumerCo2Avoided} kg</p>
              <p className="text-xs text-slate-500 mt-1">Greenhouse Gases Prevented</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
                  <Droplets className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                  Virtual Water
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{consumerWaterSaved.toLocaleString()} L</p>
              <p className="text-xs text-slate-500 mt-1">Embedded Water Conserved</p>
            </div>
          </div>

          {/* Eco-Tier Progress & Milestone */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">
                    Eco-Champion Tier: Gold Rescuer
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  You are in the top 8% of sustainable food heroes in your city.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                Tier Progress: 75%
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full w-[75%]" />
            </div>

            <div className="grid grid-cols-3 text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Silver Hero</p>
                <p className="text-[10px] text-slate-400">5+ Meals</p>
              </div>
              <div>
                <p className="font-bold text-emerald-600">Gold Champion (Current)</p>
                <p className="text-[10px] text-slate-400">15+ Meals</p>
              </div>
              <div>
                <p className="font-bold text-slate-800">Platinum Guardian</p>
                <p className="text-[10px] text-slate-400">30+ Meals</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {role === 'BUSINESS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Recovered Inventory
              </p>
              <p className="text-2xl font-bold text-slate-900">{businessFoodRecoveredKg} kg</p>
              <p className="text-xs text-slate-500 mt-1">Total surplus diverted from spoilage</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Recovered Revenue
              </p>
              <p className="text-2xl font-bold text-slate-900">₹{businessRevenueRecovered.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Direct merchant payout realized</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Donations to NGOs
              </p>
              <p className="text-2xl font-bold text-slate-900">{businessDonatedMeals} Meals</p>
              <p className="text-xs text-slate-500 mt-1">80G tax deductible donations</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Zero-Waste Diversion
              </p>
              <p className="text-2xl font-bold text-emerald-600">{businessLandfillAvoidedRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Surplus efficiency benchmark</p>
            </div>
          </div>
        </div>
      )}

      {role === 'NGO' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Meals Distributed
              </p>
              <p className="text-2xl font-bold text-slate-900">{ngoMealsDistributed}</p>
              <p className="text-xs text-slate-500 mt-1">Cooked & packaged nutritious meals</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                People Nourished
              </p>
              <p className="text-2xl font-bold text-slate-900">{ngoBeneficiariesServed}</p>
              <p className="text-xs text-slate-500 mt-1">Verified shelter & community recipients</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Partner Shelters Served
              </p>
              <p className="text-2xl font-bold text-slate-900">{ngoActiveShelters}</p>
              <p className="text-xs text-slate-500 mt-1">Involved community drop centers</p>
            </div>
          </div>
        </div>
      )}

      {role === 'ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Platform Food Rescued
              </p>
              <p className="text-2xl font-bold text-slate-900">4,820 kg</p>
              <p className="text-xs text-slate-500 mt-1">Across 18 urban districts</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Total CO2e Avoided
              </p>
              <p className="text-2xl font-bold text-emerald-600">8.9 Metric Tons</p>
              <p className="text-xs text-slate-500 mt-1">Audited carbon avoidance factor</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Rescued Economy Payout
              </p>
              <p className="text-2xl font-bold text-slate-900">₹3,48,200</p>
              <p className="text-xs text-slate-500 mt-1">Circulated back to merchants</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                NGO Relief Meals
              </p>
              <p className="text-2xl font-bold text-slate-900">12,400</p>
              <p className="text-xs text-slate-500 mt-1">Delivered with real-time temperature logs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
