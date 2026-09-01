import React from 'react';
import { Leaf, Award, HeartHandshake, Store, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminImpactView: React.FC = () => {
  const { allUsers, businesses, ngos, orders, donations } = useApp();

  const totalFoodKg = orders.length * 2.5 + donations.length * 15;
  const totalMeals = Math.round(totalFoodKg * 2);
  const co2AvoidedKg = Math.round(totalFoodKg * 2.5);
  const waterSavedLiters = Math.round(totalFoodKg * 1000);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-600" /> Platform-wide Impact Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated sustainability, food rescue, and community uplift metrics across all SurplusX operations.
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" /> ESG Verified Platform
        </div>
      </div>

      {/* Impact KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Food Rescued', value: `${totalFoodKg.toLocaleString()} kg`, sub: 'Surplus redistributed', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Meals Provided', value: totalMeals.toLocaleString(), sub: 'Nutritious meals served', icon: HeartHandshake, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'CO2 Emissions Avoided', value: `${co2AvoidedKg.toLocaleString()} kg`, sub: 'Carbon footprint reduction', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Water Conserved', value: `${waterSavedLiters.toLocaleString()} L`, sub: 'Agricultural water saved', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{item.value}</div>
                <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Participating Ecosystem Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Participating Businesses</h4>
              <p className="text-xs text-slate-500">Active merchant partners</p>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-4">{businesses.length}</div>
          <p className="text-xs text-slate-500 mt-1">Bakeries, restaurants, supermarkets</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">NGO Partners</h4>
              <p className="text-xs text-slate-500">Authorized food banks</p>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-4">{ngos.length}</div>
          <p className="text-xs text-slate-500 mt-1">Shelters, orphanages, community kitchens</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Community Consumers</h4>
              <p className="text-xs text-slate-500">Registered eco-consumers</p>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-4">
            {allUsers.filter((u) => u.role === 'CONSUMER').length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Active local rescue participants</p>
        </div>
      </div>
    </div>
  );
};
