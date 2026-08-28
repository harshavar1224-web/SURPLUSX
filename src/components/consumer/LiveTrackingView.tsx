import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Truck,
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  Radio,
  FileText,
  AlertCircle,
  QrCode,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Send,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';

export const LiveTrackingView: React.FC = () => {
  const {
    currentUser,
    activeDelivery,
    setActiveView,
    setSelectedOrderForReceipt,
    orders,
    selectedOrderForTracking,
    startRealGpsTracking,
    stopRealGpsTracking,
    isRealGpsActive,
    verifyDropOtp,
    reassignDelivery,
    reportDeliveryIssue,
  } = useApp();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState('Vikram Sen (Backup Volunteer)');
  const [newDriverPhone, setNewDriverPhone] = useState('+91 98451 22334');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [issueReason, setIssueReason] = useState('Vehicle breakdown / puncture');

  const tracking = activeDelivery;
  const currentOrder = selectedOrderForTracking || orders[0];

  if (!tracking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">No active delivery session currently underway.</p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleVerifyDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyDropOtp(enteredOtp)) {
      setEnteredOtp('');
    }
  };

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    reassignDelivery(tracking.id, newDriverName, newDriverPhone);
    setReassignModalOpen(false);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    reportDeliveryIssue(tracking.id, issueReason, 'Reported by operations view in real-time tracking');
    setReportModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Live NGO Pickup-to-Delivery Tracking
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold animate-pulse flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600" />
                {isRealGpsActive ? 'DEVICE GPS ACTIVE' : 'LIVE TELEMETRY'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trip #{tracking.id} • Assigned to: {tracking.driverName} • NGO: Hope Foundation Shelter
            </p>
          </div>
        </div>

        {/* View Receipt / Admin Controls */}
        <div className="flex items-center gap-2">
          {(currentUser.role === 'ADMIN' || currentUser.role === 'NGO') && (
            <>
              <button
                onClick={() => setReassignModalOpen(true)}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Reassign Driver</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              setSelectedOrderForReceipt(currentOrder);
              setActiveView('receipt');
            }}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>View Receipt</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live GPS Route Canvas & Telemetry */}
        <div className="lg:col-span-8 space-y-6">
          {/* Map Canvas Container */}
          <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-300 shadow-md bg-slate-100">
            {/* Vector Roads & Route Visualizer */}
            <svg viewBox="0 0 600 400" className="w-full h-full object-cover bg-emerald-50/40">
              <defs>
                <pattern id="trackGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.7" />
                </pattern>
              </defs>
              <rect width="600" height="400" fill="url(#trackGrid)" />

              {/* Geofence Ring around Origin (Pickup) */}
              <circle
                cx="80"
                cy="80"
                r="38"
                fill="#0284c7"
                fillOpacity="0.12"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />

              {/* Geofence Ring around Destination (Drop) */}
              <circle
                cx="520"
                cy="320"
                r="38"
                fill="#15803d"
                fillOpacity="0.12"
                stroke="#15803d"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />

              {/* Road Lines */}
              <path
                d="M 80 80 Q 200 120 320 200 T 520 320"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 80 80 Q 200 120 320 200 T 520 320"
                fill="none"
                stroke="#f8fafc"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Active Route Path (Dashed Emerald) */}
              <path
                d="M 80 80 Q 200 120 320 200 T 520 320"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="8,6"
                strokeLinecap="round"
              />

              {/* Origin Pin (Store) */}
              <g transform="translate(80, 80)">
                <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="white" strokeWidth="3" />
                <text x="0" y="4" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
                  A
                </text>
                <rect x="-50" y="-30" width="100" height="18" rx="6" fill="white" stroke="#0284c7" strokeWidth="1" />
                <text x="0" y="-18" fill="#0284c7" fontSize="8" fontWeight="bold" textAnchor="middle">
                  Pickup (200m Geofence)
                </text>
              </g>

              {/* Destination Pin (NGO / Drop) */}
              <g transform="translate(520, 320)">
                <circle cx="0" cy="0" r="14" fill="#15803d" stroke="white" strokeWidth="3" />
                <text x="0" y="4" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
                  B
                </text>
                <rect x="-50" y="-30" width="100" height="18" rx="6" fill="white" stroke="#15803d" strokeWidth="1" />
                <text x="0" y="-18" fill="#15803d" fontSize="8" fontWeight="bold" textAnchor="middle">
                  NGO Drop (200m Geofence)
                </text>
              </g>

              {/* Moving Driver Vehicle Pin */}
              <g transform="translate(320, 200)">
                <circle cx="0" cy="0" r="18" fill="#10b981" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="13" fill="#10b981" stroke="white" strokeWidth="3" className="drop-shadow-md" />
                <path d="M -4 -2 L 4 -2 L 2 4 L -2 4 Z" fill="white" />
                <rect x="-60" y="-32" width="120" height="20" rx="8" fill="#0f172a" />
                <text x="0" y="-18" fill="#34d399" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                  {tracking.driverName} (~{tracking.etaMinutes}m)
                </text>
              </g>
            </svg>

            {/* Overlay Status Badge */}
            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Phase</div>
              <div className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{tracking.status.replace(/_/g, ' ')}</span>
                <span className="text-xs font-normal text-slate-500">• ETA ~{tracking.etaMinutes} mins</span>
              </div>
            </div>

            {/* GPS Watcher Toggle for Real Device Telemetry */}
            <div className="absolute bottom-4 right-4 z-10">
              <button
                onClick={() => {
                  if (isRealGpsActive) {
                    stopRealGpsTracking();
                  } else {
                    startRealGpsTracking();
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 ${
                  isRealGpsActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Navigation className={`w-3.5 h-3.5 ${isRealGpsActive ? 'animate-spin' : ''}`} />
                <span>{isRealGpsActive ? 'Device GPS Active' : 'Start Device GPS'}</span>
              </button>
            </div>
          </div>

          {/* Live Telemetry & Geofence Diagnostics */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                Live Telemetry & Geofence Engine (Redis Pub/Sub & PostGIS)
              </h3>
              <span className="text-[11px] text-emerald-600 font-mono-code">WebSocket: CONNECTED (8ms)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400">Current Speed</div>
                <div className="text-sm font-extrabold text-slate-800">{tracking.currentLocation.speed || 24} km/h</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400">GPS Accuracy</div>
                <div className="text-sm font-extrabold text-slate-800">±{tracking.currentLocation.accuracy || 6} meters</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400">Dist to Pickup</div>
                <div className="text-sm font-extrabold text-slate-800">
                  {tracking.distanceToPickupMeters}m {tracking.isWithinPickupGeofence ? '✓' : ''}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400">Dist to Drop</div>
                <div className="text-sm font-extrabold text-slate-800">
                  {tracking.distanceToDropMeters}m {tracking.isWithinDropGeofence ? '✓' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Driver Profile, Timeline & Verification */}
        <div className="lg:col-span-4 space-y-6">
          {/* Driver Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Delivery Partner</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                NGO Transport Fleet
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                  alt={tracking.driverName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{tracking.driverName}</h4>
                <div className="text-xs text-slate-500">{tracking.driverPhone}</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">⭐ 4.9 • 340+ Rescues</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`tel:${tracking.driverPhone}`}
                className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver</span>
              </a>
              <button
                onClick={() => alert(`Connecting encrypted call bridge to driver ${tracking.driverName}...`)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            </div>
          </div>

          {/* Secure Pickup & Delivery OTP Confirmation Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Secure Delivery Verification
              </h4>
              <span className="text-[10px] text-slate-400">4-Digit Code</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400">Store Pickup Code</div>
                <div className="text-xl font-mono-code font-extrabold text-amber-300 tracking-widest mt-1">
                  {tracking.pickupOtp || '8492'}
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-400">Recipient Drop Code</div>
                <div className="text-xl font-mono-code font-extrabold text-emerald-300 tracking-widest mt-1">
                  {tracking.dropOtp || '4190'}
                </div>
              </div>
            </div>

            {/* Test Driver Delivery Verification */}
            <form onSubmit={handleVerifyDelivery} className="space-y-2 pt-1">
              <div className="text-[11px] text-slate-300 font-medium">Verify Delivery OTP:</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="Enter OTP (e.g. 4190)"
                  maxLength={4}
                  className="flex-1 px-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:border-emerald-500 outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>

          {/* Verified Audit Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Verified Audit Timeline ({tracking.events?.length || 0})
            </h4>

            <div className="space-y-3 text-xs max-h-64 overflow-y-auto pr-1">
              {tracking.events?.map((evt) => (
                <div key={evt.id} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{evt.eventType.replace(/_/g, ' ')}</div>
                    <div className="text-[10px] text-slate-500 font-mono-code">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • GPS: ({evt.latitude.toFixed(3)}, {evt.longitude.toFixed(3)})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reassign NGO Volunteer / Driver</h3>
            <p className="text-xs text-slate-600">
              Select a new volunteer driver to take over delivery #{tracking.id}. The previous driver's GPS session will be closed immediately.
            </p>

            <form onSubmit={handleReassign} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Driver Name</label>
                <input
                  type="text"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Driver Phone</label>
                <input
                  type="text"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Report Delivery Incident</h3>
            <p className="text-xs text-slate-600">
              Notify central dispatch and NGO coordinators of unexpected delays or exceptions.
            </p>

            <form onSubmit={handleReportIssue} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Issue Category</label>
                <select
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Vehicle breakdown / puncture">Vehicle breakdown / puncture</option>
                  <option value="Severe traffic jam / waterlogging">Severe traffic jam / waterlogging</option>
                  <option value="Store closed / delayed food packing">Store closed / delayed food packing</option>
                  <option value="Recipient unreachable at drop location">Recipient unreachable at drop location</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                >
                  Submit Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
