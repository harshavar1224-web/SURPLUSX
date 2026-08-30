import React, { useState } from 'react';
import {
  ArrowLeft,
  Truck,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Lock,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MapplsDeliveryMap } from '../mappls/MapplsDeliveryMap';

export const LiveTrackingView: React.FC = () => {
  const {
    currentUser,
    activeDelivery,
    setActiveView,
    orders,
    setActiveReceiptOrder,
    setIsReceiptModalOpen,
    refreshDeliveries,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'map' | 'timeline' | 'details'>('map');

  const tracking = activeDelivery;
  const currentOrder = orders.find((o) => o.id === tracking?.orderId) || orders[0];

  if (!tracking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Active Live Tracking Session</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You currently have no active orders en-route with an NGO delivery partner.
        </p>
        <button
          onClick={() => setActiveView('browse')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          Browse Surplus Deals
        </button>
      </div>
    );
  }

  const steps = [
    { label: 'Order Confirmed', completed: true, active: false },
    { label: 'NGO Partner Assigned', completed: true, active: false },
    {
      label: 'NGO Accepted Pickup',
      completed: tracking.status !== 'PENDING' && tracking.status !== 'ASSIGNED',
      active: tracking.status === 'ACCEPTED',
    },
    {
      label: 'NGO On Way to Pickup',
      completed:
        tracking.status !== 'PENDING' &&
        tracking.status !== 'ASSIGNED' &&
        tracking.status !== 'ACCEPTED',
      active: tracking.status === 'EN_ROUTE_TO_PICKUP',
    },
    {
      label: 'Pickup Completed',
      completed:
        tracking.status === 'PICKUP_VERIFIED' ||
        tracking.status === 'EN_ROUTE_TO_DROPOFF' ||
        tracking.status === 'ARRIVED_AT_DROPOFF' ||
        tracking.status === 'DELIVERY_VERIFIED' ||
        tracking.status === 'COMPLETED',
      active: tracking.status === 'ARRIVED_AT_PICKUP',
    },
    {
      label: 'NGO On Way to You',
      completed:
        tracking.status === 'ARRIVED_AT_DROPOFF' ||
        tracking.status === 'DELIVERY_VERIFIED' ||
        tracking.status === 'COMPLETED',
      active: tracking.status === 'EN_ROUTE_TO_DROPOFF',
    },
    {
      label: 'Arrived at Destination',
      completed: tracking.status === 'DELIVERY_VERIFIED' || tracking.status === 'COMPLETED',
      active: tracking.status === 'ARRIVED_AT_DROPOFF',
    },
    {
      label: 'Delivered & Verified',
      completed: tracking.status === 'COMPLETED',
      active: tracking.status === 'DELIVERY_VERIFIED',
    },
  ];

  return (
    <div id="surplusx-consumer-live-tracking" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-600" />
                Mappls Live Tracking
              </span>
              {tracking.status === 'COMPLETED' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                  Delivered
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  Active En-Route
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Live NGO Delivery Tracking
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentOrder && (
            <button
              onClick={() => {
                setActiveReceiptOrder(currentOrder);
                setIsReceiptModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Tax Receipt</span>
            </button>
          )}

          <button
            onClick={() => refreshDeliveries()}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Mappls Map + Live Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Mappls Delivery Map */}
        <div className="lg:col-span-8 space-y-6">
          <MapplsDeliveryMap
            delivery={tracking}
            height="520px"
            showControls={true}
            interactive={true}
            title="Live NGO Delivery Route"
          />

          {/* Secure Delivery OTP Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 text-xs font-bold">
                <Lock className="w-4 h-4" />
                <span>Zero-Trust Delivery OTP</span>
              </div>
              <p className="text-xs text-slate-300">
                Share this confidential 6-digit code with the NGO delivery partner upon arrival to complete handoff.
              </p>
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-widest">
                Delivery Code
              </span>
              <span className="text-2xl font-black font-mono tracking-widest text-emerald-400">
                {tracking.deliveryOtp || '492018'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Details, NGO Info & Step Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* NGO Delivery Partner Profile (Privacy Compliant) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Assigned NGO Partner
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Verified NGO
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-base">
                {tracking.volunteerName?.charAt(0) || 'R'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-slate-900 text-sm truncate">
                  {tracking.volunteerName}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {tracking.ngoName || 'Hope Foundation Food Rescue'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Vehicle Type</span>
                <span className="font-bold text-slate-800">Refrigerated EV Van</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Temperature Sensor</span>
                <span className="font-bold text-emerald-700">4.2°C (Optimal)</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Personal phone and residential details protected under SurplusX Privacy Shield.</span>
            </div>
          </div>

          {/* Real-time Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Delivery Timeline
            </span>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex items-center gap-3 text-xs">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 ${
                      step.completed
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                        : step.active
                        ? 'bg-amber-500 text-white ring-4 ring-amber-50 animate-pulse'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      step.completed
                        ? 'text-slate-900 font-bold'
                        : step.active
                        ? 'text-amber-700 font-extrabold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
