import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Truck,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Radio,
  Plus,
  ShieldCheck,
  Building,
  Navigation,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Donation, DistributionRecord } from '../../types';

export const NgoDashboard: React.FC = () => {
  const {
    currentUser,
    activeView,
    donations,
    acceptDonation,
    distributionRecords,
    logDistribution,
    activeDelivery,
    setActiveView,
    startRealGpsTracking,
    stopRealGpsTracking,
    isRealGpsActive,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'feed' | 'fleet' | 'beneficiaries'>('feed');

  useEffect(() => {
    if (activeView === 'donation-feed' || activeView === 'my-donations' || activeView === 'donations') setActiveTab('feed');
    else if (activeView === 'pickup-requests' || activeView === 'active-deliveries') setActiveTab('fleet');
    else if (activeView === 'distribution') setActiveTab('beneficiaries');
  }, [activeView]);

  // Distribution Form State
  const [beneficiaryType, setBeneficiaryType] = useState<DistributionRecord['beneficiaryType']>('Slum Community');
  const [mealsServed, setMealsServed] = useState(65);
  const [beneficiariesCount, setBeneficiariesCount] = useState(45);
  const [locationName, setLocationName] = useState('Ejipura Slum Cluster & Transit Workers');
  const [notes, setNotes] = useState('Fresh prepared dal, rice & mixed vegetables distributed.');
  const [isLogSuccess, setIsLogSuccess] = useState(false);

  const handleLogDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    logDistribution({
      ngoId: currentUser.id,
      ngoName: currentUser.organizationName || currentUser.name,
      donationId: donations[0]?.id || 'don-101',
      beneficiaryType,
      beneficiariesCount,
      mealsDistributed: mealsServed,
      location: locationName,
      notes,
    });
    setIsLogSuccess(true);
    setTimeout(() => setIsLogSuccess(false), 3000);
  };

  const pendingDonations = donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* NGO Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-200 flex-shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentUser.organizationName || 'Hope Foundation Shelter'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                NGO Darpan Verified ✓
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              80G Tax Exempt • Serving Bengaluru Urban District • 350 Meals/Day Capacity
            </p>
          </div>
        </div>

        {/* Live GPS Dispatch Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('live-tracking')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse text-emerald-200" />
            <span>Active GPS Route</span>
          </button>
        </div>
      </div>

      {/* 4 NGO KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Meals Distributed</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">18,450</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Across 12 distribution points</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Daily Rescue Capacity</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">350 Meals/Day</div>
          <div className="text-[11px] text-slate-500 mt-1">Cold storage & transport ready</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Volunteer Drivers</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">14 Drivers</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">2 Active on roads right now</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Waste Diverted</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">6.2 Tons</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% verified audit log</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'feed'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Live Donation Matching Feed ({pendingDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('beneficiaries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'beneficiaries'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Beneficiary Distribution Log ({distributionRecords.length})
        </button>
      </div>

      {/* Tab 1: Live Donation Matching Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donations.map((don) => (
              <div
                key={don.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      {don.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-code">{don.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{don.foodType}</h3>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    {don.businessName} • {don.pickupAddress}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400">Meal Count</div>
                      <div className="font-extrabold text-slate-900">{don.quantityMeals} Meals</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Weight</div>
                      <div className="font-extrabold text-slate-900">{don.weightKg} kg</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Dietary</div>
                      <div className="font-extrabold text-emerald-700">{don.dietary}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Pickup by {don.pickupDeadline}
                  </span>

                  {don.status === 'AVAILABLE' || don.status === 'MATCHED' ? (
                    <button
                      onClick={() => acceptDonation(don.id, currentUser.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Accept & Dispatch Driver
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Assigned to Driver Rahul
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Beneficiary Distribution Logging Form & History */}
      {activeTab === 'beneficiaries' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Logger Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Record Food Distribution</h3>
            <p className="text-xs text-slate-500">
              Log verified food servings to generate compliant 80G CSR audit trails and community impact reports.
            </p>

            {isLogSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Distribution logged to immutable audit ledger!</span>
              </div>
            )}

            <form onSubmit={handleLogDistribution} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Beneficiary Group</label>
                <select
                  value={beneficiaryType}
                  onChange={(e) => setBeneficiaryType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Slum Community">Slum Community</option>
                  <option value="Shelter Home">Shelter Home</option>
                  <option value="Orphanage">Orphanage</option>
                  <option value="Elderly Care">Elderly Care</option>
                  <option value="Night Shelter">Night Shelter</option>
                  <option value="Daily Wage Workers">Daily Wage Workers</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Meals Served</label>
                  <input
                    type="number"
                    value={mealsServed}
                    onChange={(e) => setMealsServed(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">People Count</label>
                  <input
                    type="number"
                    value={beneficiariesCount}
                    onChange={(e) => setBeneficiariesCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location / Community</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes & Dietary Compliance</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Log Distribution Record
              </button>
            </form>
          </div>

          {/* Right: Distribution Records Ledger */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Verified Distribution History</h3>
            <div className="space-y-3">
              {distributionRecords.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{log.beneficiaryType}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        {log.ngoName}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {log.location}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{log.notes}</div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-extrabold text-slate-900">{log.mealsDistributed} Meals</div>
                    <div className="text-[10px] text-slate-400">
                      {log.beneficiariesCount} people • {log.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
