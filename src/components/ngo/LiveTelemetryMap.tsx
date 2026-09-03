import React, { useState, useEffect } from 'react';
import {
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  MapPin,
  RefreshCw,
  Smartphone,
  Lock,
  Layers,
  KeyRound,
  Compass,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryTrackingStatus } from '../../types';
import { MapplsDeliveryMap } from '../mappls/MapplsDeliveryMap';
import { deviceLocationTracker, DeviceGpsState } from '../../services/deviceLocationTracker';

export const LiveTelemetryMap: React.FC = () => {
  const {
    currentUser,
    activeDelivery,
    setActiveDelivery,
    allDeliveries,
    startNgoDeliveryTracking,
    verifyPickupCode,
    verifyDeliveryOtp,
    updateDeliveryStatus,
    refreshDeliveries,
  } = useApp();

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    activeDelivery?.id || 'del-8821'
  );
  const [gpsState, setGpsState] = useState<DeviceGpsState>(
    deviceLocationTracker.getState()
  );
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Synchronize active delivery selection
  const currentDelivery =
    allDeliveries.find((d) => d.id === selectedDeliveryId) || activeDelivery;

  // Listen to device GPS updates from real hardware
  useEffect(() => {
    const unsubscribe = deviceLocationTracker.subscribe((state) => {
      setGpsState(state);
    });
    return () => unsubscribe();
  }, []);

  // Update selected delivery tracking target if activeDelivery changes
  useEffect(() => {
    if (activeDelivery && activeDelivery.id !== selectedDeliveryId) {
      setSelectedDeliveryId(activeDelivery.id);
    }
  }, [activeDelivery?.id]);

  const handleStartTracking = async () => {
    if (!currentDelivery) return;
    setIsProcessing(true);
    setActionError(null);

    // 1. Request real device GPS permission and start hardware watchPosition
    const trackerResult = await deviceLocationTracker.startTracking(
      currentDelivery.id,
      currentUser?.id
    );

    if (!trackerResult.success) {
      setActionError(trackerResult.error || 'Failed to acquire device GPS location.');
      setIsProcessing(false);
      return;
    }

    // 2. Start server-side tracking state
    const res = await startNgoDeliveryTracking(currentDelivery.id);
    if (!res.success) {
      setActionError(res.error || 'Server rejected tracking initialization.');
    } else {
      setSuccessBanner('Real device GPS tracking active! En-route to pickup depot.');
      setTimeout(() => setSuccessBanner(null), 5000);
    }
    setIsProcessing(false);
  };

  const handleStopTracking = () => {
    deviceLocationTracker.stopTracking();
    if (currentDelivery) {
      updateDeliveryStatus(currentDelivery.id, 'COMPLETED');
    }
    setSuccessBanner('Tracking stopped successfully.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleVerifyPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDelivery || !pickupCodeInput.trim()) return;
    setIsProcessing(true);
    setActionError(null);

    const res = await verifyPickupCode(currentDelivery.id, pickupCodeInput.trim());
    if (!res.success) {
      setActionError(res.error || 'Invalid pickup code or location not at depot.');
    } else {
      setSuccessBanner('Pickup verified! Surplus food securely collected. En-route to dropoff.');
      setPickupCodeInput('');
      setTimeout(() => setSuccessBanner(null), 5000);
    }
    setIsProcessing(false);
  };

  const handleVerifyDropoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDelivery || !deliveryOtpInput.trim()) return;
    setIsProcessing(true);
    setActionError(null);

    const res = await verifyDeliveryOtp(currentDelivery.id, deliveryOtpInput.trim());
    if (!res.success) {
      setActionError(res.error || 'Invalid OTP or location not at destination.');
    } else {
      deviceLocationTracker.stopTracking();
      setSuccessBanner('Delivery verified & completed! Trip log archived.');
      setDeliveryOtpInput('');
      setTimeout(() => setSuccessBanner(null), 5000);
    }
    setIsProcessing(false);
  };

  const isTrackingActive =
    currentDelivery?.status === 'EN_ROUTE_TO_PICKUP' ||
    currentDelivery?.status === 'EN_ROUTE_TO_DROPOFF';

  return (
    <div id="surplusx-ngo-live-telemetry" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              Mappls Live Telemetry Console
            </span>
            {gpsState.isTracking && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                Hardware GPS Live
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
            NGO Real-Time Delivery & GPS Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Live GPS telemetry powered by Mappls GIS Platform. Enforces strict proximity
            geofencing, digital OTP hand-off, and real hardware GPS anti-spoofing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshDeliveries()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            title="Refresh Deliveries"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Fleet</span>
          </button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-medium flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Delivery Selector & Interactive Mappls Map */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Deliveries Quick Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Assigned Deliveries ({allDeliveries.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allDeliveries.map((del) => {
                const isSelected = del.id === selectedDeliveryId;
                return (
                  <button
                    key={del.id}
                    onClick={() => {
                      setSelectedDeliveryId(del.id);
                      setActiveDelivery(del);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{del.id.toUpperCase()}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          del.status === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-700'
                            : del.status.includes('EN_ROUTE')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {del.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 truncate">
                      📦 {del.pickupLocation?.address?.split(',')[0] || (del as any).pickupAddress?.split(',')[0] || (del as any).origin?.address?.split(',')[0] || 'Pickup Location'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      🏠 {del.dropoffLocation?.address?.split(',')[0] || (del as any).dropoffAddress?.split(',')[0] || (del as any).destination?.address?.split(',')[0] || 'Dropoff Location'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Mappls Delivery Map */}
          {currentDelivery ? (
            <MapplsDeliveryMap
              delivery={currentDelivery}
              height="500px"
              showControls={true}
              interactive={true}
              title="Mappls Live Telemetry Navigation"
            />
          ) : (
            <div className="h-[400px] bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
              No delivery selected
            </div>
          )}
        </div>

        {/* Right Side: Operational Control Console */}
        <div className="lg:col-span-4 space-y-6">
          {/* Hardware GPS Diagnostics HUD */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Device GPS Sensor
                </span>
              </div>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  gpsState.isTracking
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {gpsState.isTracking ? 'TRACKING ON' : 'IDLE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium block">GPS Accuracy</span>
                <span
                  className={`font-black text-xs ${
                    gpsState.accuracy && gpsState.accuracy < 15
                      ? 'text-emerald-700'
                      : gpsState.accuracy && gpsState.accuracy < 35
                      ? 'text-amber-700'
                      : 'text-slate-700'
                  }`}
                >
                  {gpsState.accuracy ? `±${gpsState.accuracy.toFixed(1)} m` : 'No fix'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium block">Real Speed</span>
                <span className="font-black text-xs text-slate-800">
                  {gpsState.speed !== null ? `${gpsState.speed.toFixed(1)} km/h` : '0.0 km/h'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium block">Heading</span>
                <span className="font-black text-xs text-slate-800">
                  {gpsState.heading !== null ? `${Math.round(gpsState.heading)}°` : '—'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium block">Permission</span>
                <span
                  className={`font-black text-xs ${
                    gpsState.permissionStatus === 'granted'
                      ? 'text-emerald-700'
                      : gpsState.permissionStatus === 'denied'
                      ? 'text-rose-700'
                      : 'text-slate-600'
                  }`}
                >
                  {gpsState.permissionStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {gpsState.isLowAccuracy && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Low GPS accuracy detected. Keep device near clear sky/window.</span>
              </div>
            )}
          </div>

          {/* Delivery Operations Control Card */}
          {currentDelivery && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Delivery Action Control
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-0.5">
                  Task: {currentDelivery.id.toUpperCase()}
                </h3>
              </div>

              {/* Strict Delivery State Transition Controls */}
              <div className="space-y-3">
                {/* 1. START PICKUP */}
                {currentDelivery.status === 'ASSIGNED' || currentDelivery.status === 'ACCEPTED' ? (
                  <button
                    onClick={handleStartTracking}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>START PICKUP & LIVE GPS</span>
                  </button>
                ) : null}

                {/* 2. EN ROUTE TO PICKUP -> ARRIVE */}
                {currentDelivery.status === 'EN_ROUTE_TO_PICKUP' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => updateDeliveryStatus(currentDelivery.id, 'ARRIVED_AT_PICKUP')}
                      className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>MARK ARRIVED AT PICKUP DEPOT</span>
                    </button>
                  </div>
                )}

                {/* 3. VERIFY PICKUP AT DEPOT */}
                {(currentDelivery.status === 'ARRIVED_AT_PICKUP' ||
                  currentDelivery.status === 'EN_ROUTE_TO_PICKUP') && (
                  <form onSubmit={handleVerifyPickup} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      <span>Verify Depot Pickup Code</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Enter the 6-digit pickup code displayed at the merchant depot (Demo: <strong>882194</strong>).
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={pickupCodeInput}
                        onChange={(e) => setPickupCodeInput(e.target.value)}
                        placeholder="e.g. 882194"
                        className="flex-1 px-3 py-2 bg-white text-xs font-mono font-bold tracking-wider border border-slate-300 rounded-xl outline-hidden focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={isProcessing || !pickupCodeInput.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>
                  </form>
                )}

                {/* 4. EN ROUTE TO DROPOFF -> ARRIVE */}
                {currentDelivery.status === 'PICKUP_VERIFIED' || currentDelivery.status === 'EN_ROUTE_TO_DROPOFF' ? (
                  <div className="space-y-3">
                    {currentDelivery.status === 'PICKUP_VERIFIED' && (
                      <button
                        onClick={() => updateDeliveryStatus(currentDelivery.id, 'EN_ROUTE_TO_DROPOFF')}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>START TRANSIT TO CONSUMER</span>
                      </button>
                    )}

                    {currentDelivery.status === 'EN_ROUTE_TO_DROPOFF' && (
                      <button
                        onClick={() => updateDeliveryStatus(currentDelivery.id, 'ARRIVED_AT_DROPOFF')}
                        className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>MARK ARRIVED AT CONSUMER DESTINATION</span>
                      </button>
                    )}

                    {/* 5. VERIFY DROPOFF OTP */}
                    <form onSubmit={handleVerifyDropoff} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span>Verify Consumer Delivery OTP</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Ask recipient for their 6-digit Delivery OTP (Demo: <strong>492018</strong>).
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={deliveryOtpInput}
                          onChange={(e) => setDeliveryOtpInput(e.target.value)}
                          placeholder="e.g. 492018"
                          className="flex-1 px-3 py-2 bg-white text-xs font-mono font-bold tracking-wider border border-slate-300 rounded-xl outline-hidden focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          disabled={isProcessing || !deliveryOtpInput.trim()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Complete
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null}

                {/* 6. COMPLETED */}
                {currentDelivery.status === 'COMPLETED' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <div className="text-xs font-black text-emerald-950">Delivery Fully Completed</div>
                    <p className="text-[11px] text-emerald-800">
                      Food rescue verified, signed with OTP hand-off, and GPS telemetry logged.
                    </p>
                  </div>
                )}

                {/* Active Tracking Stop Button */}
                {isTrackingActive && (
                  <button
                    onClick={handleStopTracking}
                    className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Pause / Stop GPS Telemetry
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Security & Anti-Spoofing Policy */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Spoofing Governance</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              SurplusX validates hardware timestamps, velocity constraints (&lt;140 km/h),
              and proximity geofences. Coordinates cannot be manually entered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
