import React from 'react';
import { ShoppingBag, Store, HeartHandshake, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HowItWorksView: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <div className="w-full bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
          <span>How SurplusX Works</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Simple, Transparent Food Rescue Workflow
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Learn how SurplusX connects consumers, food merchants, and NGO partners in 3 seamless steps.
        </p>
      </div>

      {/* Workflow Tabs / Sections */}
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Section 1: For Consumers */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">For Consumers & Buyers</h2>
              <p className="text-xs text-slate-500">Buy surplus meals at heavy discounts before store closing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">1</div>
              <h4 className="font-bold text-sm text-slate-900">Explore Nearby Deals</h4>
              <p className="text-xs text-slate-600">
                Use your GPS or select your locality to view real-time surplus bundles from nearby bakeries, cafes, and supermarkets.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">2</div>
              <h4 className="font-bold text-sm text-slate-900">Reserve & Pay via Escrow</h4>
              <p className="text-xs text-slate-600">
                Reserve your favorite items. Your payment is held safely in Razorpay escrow until you inspect and collect your order.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">3</div>
              <h4 className="font-bold text-sm text-slate-900">Pickup with OTP</h4>
              <p className="text-xs text-slate-600">
                Show your 4-digit Pickup OTP at the store counter or present it to the delivery driver to complete the order.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: For Merchants */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">For Merchants & Food Businesses</h2>
              <p className="text-xs text-slate-500">Monetize extra inventory and eliminate waste</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">1</div>
              <h4 className="font-bold text-sm text-slate-900">Quick Surplus Listing</h4>
              <p className="text-xs text-slate-600">
                List end-of-day surplus in under 30 seconds with automated AI price recommendations and category tagging.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">2</div>
              <h4 className="font-bold text-sm text-slate-900">FSSAI & Document Checks</h4>
              <p className="text-xs text-slate-600">
                Upload your FSSAI license and store proof once for verified marketplace badge status.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">3</div>
              <h4 className="font-bold text-sm text-slate-900">T+1 Automated Settlement</h4>
              <p className="text-xs text-slate-600">
                Receive direct bank payouts next day after order OTP confirmation with automated GST tax invoices.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: For NGOs */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">For NGO Rescue Partners</h2>
              <p className="text-xs text-slate-500">Receive free surplus food donations with 80G tax certification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">1</div>
              <h4 className="font-bold text-sm text-slate-900">Automated Match Notifications</h4>
              <p className="text-xs text-slate-600">
                Get alerted when local restaurants or supermarkets log available bulk food donations nearby.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">2</div>
              <h4 className="font-bold text-sm text-slate-900">Live GPS Fleet Telemetry</h4>
              <p className="text-xs text-slate-600">
                Track driver location and temperature logs during pickup and transport to beneficiary centers.
              </p>
            </div>

            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">3</div>
              <h4 className="font-bold text-sm text-slate-900">Digital 80G Receipting</h4>
              <p className="text-xs text-slate-600">
                Issue signed 80G receipts to donors instantly upon verified distribution log submission.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto text-center pt-4">
        <button
          onClick={() => {
            window.history.pushState(null, '', '/browse');
            setActiveView('browse');
          }}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Get Started on SurplusX</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
