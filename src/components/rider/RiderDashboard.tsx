import React, { useState } from 'react';
import {
  Bike,
  Navigation,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Radio,
  KeyRound,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Phone,
  Power,
  ChevronRight,
  BatteryCharging,
  Compass,
  Wifi,
  WifiOff,
  RefreshCw,
  FastForward,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryTracking } from '../../types';

export const RiderDashboard: React.FC = () => {
  const {
    currentUser,
    activeDelivery,
    startDriverTrip,
    arriveAtPickup,
    verifyPickupOtp,
    startDeliveryToDrop,
    arriveAtDrop,
    verifyDropOtp,
    moveDriverCloser,
    flushOfflineQueue,
    triggerToast,
    addAuditLog,
    startRealGpsTracking,
    stopRealGpsTracking,
    isRealGpsActive,
  } = useApp();

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'active-task' | 'available' | 'earnings'>('active-task');

  // OTP inputs
  const [inputPickupOtp, setInputPickupOtp] = useState('');
  const [inputDropOtp, setInputDropOtp] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);

  // Available orders for pickup
  const [availableTasks, setAvailableTasks] = useState([
    {
      id: 'task-701',
      storeName: 'Sunrise Bakery & Cafe',
      pickupAddress: '100 Feet Road, Indiranagar, Bangalore',
      dropAddress: 'Hope Foundation Child Shelter, Domlur',
      distanceKm: 3.2,
      etaMinutes: 14,
      earnings: 120,
      surgeBonus: 30,
      items: '2x Assorted Bakery Box (Rescued)',
      type: 'NGO_DONATION',
    },
    {
      id: 'task-702',
      storeName: 'Green Basket Foods',
      pickupAddress: '12th Main, Koramangala 4th Block, Bangalore',
      dropAddress: 'Koramangala 1st Block (Customer Residence)',
      distanceKm: 1.8,
      etaMinutes: 9,
      earnings: 95,
      surgeBonus: 0,
      items: '1x Fresh Veggies Combo Box',
      type: 'CONSUMER_ORDER',
    },
  ]);

  const toggleOnlineStatus = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      startRealGpsTracking();
      triggerToast('You are now ONLINE. Real GPS location broadcaster active!', 'success');
      addAuditLog('RIDER_ONLINE', 'DELIVERY', `Rider ${currentUser.name} marked status ONLINE`);
    } else {
      stopRealGpsTracking();
      triggerToast('You are now OFFLINE. GPS broadcast paused.', 'info');
      addAuditLog('RIDER_OFFLINE', 'DELIVERY', `Rider ${currentUser.name} marked status OFFLINE`);
    }
  };

  const handleVerifyPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpAttempts >= 5) {
      triggerToast('Rate limit exceeded: Too many incorrect OTP attempts. Contact dispatch.', 'warning');
      return;
    }

    const ok = verifyPickupOtp(inputPickupOtp.trim());
    if (ok) {
      setInputPickupOtp('');
      setOtpAttempts(0);
    } else {
      setOtpAttempts((prev) => prev + 1);
    }
  };

  const handleVerifyDrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpAttempts >= 5) {
      triggerToast('Rate limit exceeded: Too many incorrect OTP attempts.', 'warning');
      return;
    }

    const ok = verifyDropOtp(inputDropOtp.trim());
    if (ok) {
      setInputDropOtp('');
      setOtpAttempts(0);
    } else {
      setOtpAttempts((prev) => prev + 1);
    }
  };

  const acceptNewTask = (task: (typeof availableTasks)[0]) => {
    triggerToast(`Accepted delivery for ${task.storeName}! Route dispatched to your Mappls navigation.`, 'success');
    setAvailableTasks((prev) => prev.filter((t) => t.id !== task.id));
    setActiveTab('active-task');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">Trip Assigned</span>;
      case 'EN_ROUTE_TO_PICKUP':
      case 'STARTED':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold animate-pulse">En Route to Pickup</span>;
      case 'ARRIVED_AT_PICKUP':
      case 'ARRIVED_PICKUP':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">At Store Pickup</span>;
      case 'COLLECTED':
        return <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">Food Collected</span>;
      case 'EN_ROUTE_TO_DROP':
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-pulse">En Route to NGO Drop</span>;
      case 'ARRIVED_AT_DROP':
        return <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">At Drop Location</span>;
      case 'COMPLETED':
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Delivered ✓</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Rider Header & Status Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xl flex-shrink-0">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">
                {currentUser.name || 'Rahul Deshmukh (Fleet Partner)'}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {isOnline ? '● ONLINE & ACTIVE' : '○ OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Vehicle: Ather 450X (EV KA-01-MJ-8821) • Rating: 4.96 ★ • 482 Rescues Completed
            </p>
          </div>
        </div>

        {/* Online / Offline & GPS Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isRealGpsActive) {
                stopRealGpsTracking();
              } else {
                startRealGpsTracking();
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              isRealGpsActive
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Navigation className={`w-4 h-4 ${isRealGpsActive ? 'animate-spin' : ''}`} />
            <span>{isRealGpsActive ? 'Device GPS Active' : 'Enable Device GPS'}</span>
          </button>

          <button
            onClick={toggleOnlineStatus}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              isOnline
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {/* 4 Rider KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Today's Earnings</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹840</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">7 Deliveries + ₹140 Surge Bonus</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Week Payout Balance</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹5,920</div>
          <div className="text-[11px] text-slate-500 mt-1">Instant withdrawal available</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Avg Delivery Time</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">21 Mins</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% within 1-Hour SLA</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Food Rescued Transferred</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">320 kg</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero thermal leakage</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('active-task')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'active-task' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Delivery Task
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'available' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Nearby Gigs Queue ({availableTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'earnings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Payouts & Incentives
        </button>
      </div>

      {/* Tab 1: Active Delivery Task with Complete Lifecycle State Machine */}
      {activeTab === 'active-task' && (
        <div className="space-y-6">
          {activeDelivery ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Route & Step status */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-emerald-700 font-mono-code">
                      DELIVERY ID: {activeDelivery.id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {activeDelivery.status === 'COMPLETED' || activeDelivery.status === 'DELIVERED'
                        ? 'Trip Successfully Completed!'
                        : activeDelivery.status === 'ARRIVED_AT_DROP'
                        ? 'Arrived at Drop-off Location'
                        : activeDelivery.status === 'EN_ROUTE_TO_DROP' || activeDelivery.status === 'IN_TRANSIT'
                        ? 'En Route to NGO Beneficiary Drop'
                        : activeDelivery.status === 'COLLECTED'
                        ? 'Food Collected — Ready for Drop Transit'
                        : activeDelivery.status === 'ARRIVED_AT_PICKUP' || activeDelivery.status === 'ARRIVED_PICKUP'
                        ? 'Arrived at Store Pickup Point'
                        : activeDelivery.status === 'EN_ROUTE_TO_PICKUP' || activeDelivery.status === 'STARTED'
                        ? 'En Route to Store Pickup'
                        : 'Delivery Assigned — Ready to Start'}
                    </h3>
                  </div>
                  <div>{getStatusBadge(activeDelivery.status)}</div>
                </div>

                {/* Anomaly Detection Banner */}
                {activeDelivery.anomalyDetected && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">GPS Anomaly Flagged: </span>
                      {activeDelivery.anomalyDetails || 'Abnormal jump speed detected. Telemetry calibrated to road routing.'}
                    </div>
                  </div>
                )}

                {/* Route Visualizer Cards */}
                <div className="space-y-4">
                  {/* Origin Card */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      activeDelivery.status === 'ASSIGNED' ||
                      activeDelivery.status === 'EN_ROUTE_TO_PICKUP' ||
                      activeDelivery.status === 'STARTED' ||
                      activeDelivery.status === 'ARRIVED_AT_PICKUP' ||
                      activeDelivery.status === 'ARRIVED_PICKUP'
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>PICKUP POINT: {activeDelivery.origin.name}</span>
                      </span>
                      <span className="text-slate-500 font-mono-code text-[11px]">
                        Dist: {activeDelivery.distanceToPickupMeters}m ({activeDelivery.isWithinPickupGeofence ? 'Inside Geofence ✓' : 'Outside 200m'})
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">{activeDelivery.origin.address}</div>
                  </div>

                  {/* Destination Card */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      activeDelivery.status === 'COLLECTED' ||
                      activeDelivery.status === 'EN_ROUTE_TO_DROP' ||
                      activeDelivery.status === 'IN_TRANSIT' ||
                      activeDelivery.status === 'ARRIVED_AT_DROP'
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span>DROP DESTINATION: {activeDelivery.destination.name}</span>
                      </span>
                      <span className="text-slate-500 font-mono-code text-[11px]">
                        Dist: {activeDelivery.distanceToDropMeters}m ({activeDelivery.isWithinDropGeofence ? 'Inside Geofence ✓' : 'Outside 200m'})
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">{activeDelivery.destination.address}</div>
                  </div>
                </div>

                {/* Telemetry Bar */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs font-mono-code">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Live GPS Telemetry: Lat {activeDelivery.currentLocation.lat.toFixed(4)}, Lng {activeDelivery.currentLocation.lng.toFixed(4)}</span>
                    </div>
                    <div className="text-emerald-400 font-bold">{activeDelivery.currentLocation.speed || 24} km/h • Heading {activeDelivery.currentLocation.heading || 140}°</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Accuracy: ±{activeDelivery.currentLocation.accuracy || 6}m • Geofence: 200m Radius</span>
                    <span className="text-slate-300">Status: {activeDelivery.driverStatus || 'MOVING'}</span>
                  </div>
                </div>

                {/* Simulation & Offline Tooling Controls */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Driver Telemetry Control Panel</span>
                    <span className="text-[11px] text-slate-500">Fast Forward GPS</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => moveDriverCloser('PICKUP')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-300 font-medium text-xs flex items-center gap-1.5"
                    >
                      <FastForward className="w-3.5 h-3.5 text-amber-600" />
                      <span>Move Closer to Pickup</span>
                    </button>

                    <button
                      onClick={() => moveDriverCloser('DROP')}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-300 font-medium text-xs flex items-center gap-1.5"
                    >
                      <FastForward className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Move Closer to Drop</span>
                    </button>

                    {activeDelivery.queuedOfflineLocationsCount > 0 && (
                      <button
                        onClick={flushOfflineQueue}
                        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-medium text-xs flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync {activeDelivery.queuedOfflineLocationsCount} Offline Packets</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Step by Step Action Handshakes */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <h3 className="text-base font-bold text-slate-900">Step-by-Step Delivery Action</h3>

                {/* Stage 1: ASSIGNED -> START TRIP */}
                {activeDelivery.status === 'ASSIGNED' && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <Bike className="w-4 h-4 text-blue-600" />
                      <span>Step 1: Start Pickup Trip</span>
                    </div>
                    <p className="text-xs text-blue-800">
                      Click below to activate live GPS broadcasting and start travelling to the merchant pickup location:
                    </p>
                    <button
                      onClick={() => startDriverTrip(activeDelivery.id)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Start Travelling to Store
                    </button>
                  </div>
                )}

                {/* Stage 2: EN_ROUTE_TO_PICKUP -> ARRIVE AT PICKUP */}
                {(activeDelivery.status === 'EN_ROUTE_TO_PICKUP' || activeDelivery.status === 'STARTED') && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>Step 2: Confirm Store Arrival</span>
                    </div>
                    <p className="text-xs text-amber-800">
                      Distance to Store: <span className="font-bold font-mono-code">{activeDelivery.distanceToPickupMeters} meters</span>
                      {activeDelivery.isWithinPickupGeofence ? ' (Geofence verified ✓)' : ' (Within 200m required)'}
                    </p>
                    <button
                      onClick={() => arriveAtPickup(activeDelivery.id)}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Arrived at Store Pickup
                    </button>
                  </div>
                )}

                {/* Stage 3: ARRIVED_AT_PICKUP -> VERIFY OTP */}
                {(activeDelivery.status === 'ARRIVED_AT_PICKUP' || activeDelivery.status === 'ARRIVED_PICKUP') && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>Step 3: Store Pickup OTP Handshake</span>
                    </div>
                    <p className="text-xs text-amber-800">
                      Ask store cashier for their 4-digit verification code before collecting package:
                    </p>

                    <form onSubmit={handleVerifyPickup} className="space-y-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4-Digit Pickup OTP (e.g. 8492)"
                        value={inputPickupOtp}
                        onChange={(e) => setInputPickupOtp(e.target.value)}
                        className="w-full text-center tracking-widest text-lg font-mono-code font-extrabold p-2.5 bg-white border border-amber-300 rounded-xl"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Verify OTP & Collect Food
                      </button>
                    </form>
                  </div>
                )}

                {/* Stage 4: COLLECTED -> START TRANSIT TO DROP */}
                {activeDelivery.status === 'COLLECTED' && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                      <Navigation className="w-4 h-4 text-indigo-600" />
                      <span>Step 4: Start Drop-off Transit</span>
                    </div>
                    <p className="text-xs text-indigo-800">
                      Food is securely collected in thermal bag. Start travelling to the beneficiary destination:
                    </p>
                    <button
                      onClick={() => startDeliveryToDrop(activeDelivery.id)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Start Travelling to NGO / Drop
                    </button>
                  </div>
                )}

                {/* Stage 5: EN_ROUTE_TO_DROP -> ARRIVE AT DROP */}
                {(activeDelivery.status === 'EN_ROUTE_TO_DROP' || activeDelivery.status === 'IN_TRANSIT') && (
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span>Step 5: Confirm Arrival at Drop-off</span>
                    </div>
                    <p className="text-xs text-teal-800">
                      Distance to Drop: <span className="font-bold font-mono-code">{activeDelivery.distanceToDropMeters} meters</span>
                      {activeDelivery.isWithinDropGeofence ? ' (Geofence verified ✓)' : ' (Within 200m required)'}
                    </p>
                    <button
                      onClick={() => arriveAtDrop(activeDelivery.id)}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Arrived at Drop Location
                    </button>
                  </div>
                )}

                {/* Stage 6: ARRIVED_AT_DROP -> VERIFY DROP OTP & FINISH */}
                {activeDelivery.status === 'ARRIVED_AT_DROP' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      <span>Step 6: Delivery OTP Handshake</span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Ask recipient for their 4-digit confirmation code to complete the delivery and close GPS session:
                    </p>

                    <form onSubmit={handleVerifyDrop} className="space-y-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4-Digit Delivery OTP (e.g. 4190)"
                        value={inputDropOtp}
                        onChange={(e) => setInputDropOtp(e.target.value)}
                        className="w-full text-center tracking-widest text-lg font-mono-code font-extrabold p-2.5 bg-white border border-emerald-300 rounded-xl"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Confirm Delivery Completed
                      </button>
                    </form>
                  </div>
                )}

                {/* COMPLETED State */}
                {(activeDelivery.status === 'COMPLETED' || activeDelivery.status === 'DELIVERED') && (
                  <div className="p-5 rounded-2xl bg-emerald-50 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="font-bold text-emerald-900 text-sm">Delivery Handoff Completed</div>
                    <div className="text-xs text-emerald-700">
                      40 Meals delivered! ₹95 + ₹20 Tip credited to your wallet. Real GPS session closed.
                    </div>
                  </div>
                )}

                {/* Audit Event Timeline */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Verified Audit Event Log ({activeDelivery.events?.length || 0})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {activeDelivery.events?.map((evt) => (
                      <div key={evt.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{evt.eventType.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-slate-400 font-mono-code">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono-code mt-0.5">
                          GPS: ({evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)}) • Actor: {evt.actorId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <Bike className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Active Delivery in Progress</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an order from the Available Gigs queue to start your next food rescue delivery run.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                View Nearby Gigs
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Available Delivery Gigs */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {task.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      ₹{task.earnings + task.surgeBonus} Payout
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{task.storeName}</h3>
                  <div className="text-xs text-slate-500 mt-1 space-y-1">
                    <div>Pickup: {task.pickupAddress}</div>
                    <div>Drop: {task.dropAddress}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">Total Distance</div>
                      <div className="font-bold text-slate-800">{task.distanceKm} km</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Est. Time</div>
                      <div className="font-bold text-slate-800">{task.etaMinutes} mins</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono-code">{task.items}</span>
                  <button
                    onClick={() => acceptNewTask(task)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Accept Gig
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Earnings & Payouts */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rider Partner Wallet & Instant Cashout</h3>
              <p className="text-xs text-slate-500">
                Direct UPI instant deposit into your bank account.
              </p>
            </div>
            <button
              onClick={() => triggerToast('₹5,920 disbursed to your linked UPI VPA: rahul@okhdfcbank!', 'success')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Withdraw ₹5,920 Now
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">Base Delivery Pay</div>
              <div className="text-xl font-bold text-slate-900 mt-1">₹4,200</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">Peak 1-Hour Surge Incentives</div>
              <div className="text-xl font-bold text-emerald-700 mt-1">₹1,180</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">Customer Tips & Green Awards</div>
              <div className="text-xl font-bold text-purple-700 mt-1">₹540</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
