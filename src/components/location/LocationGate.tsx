import React from 'react';
import { MapPin, Navigation, ShieldCheck, AlertCircle, RotateCw, Compass, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LocationGate: React.FC = () => {
  const {
    userLocation,
    locationPermission,
    isRequestingLocation,
    requestLiveLocation,
    setIsLocationModalOpen,
    refreshLocation,
  } = useApp();

  // If location is successfully granted, do not show gate
  if (userLocation && locationPermission === 'GRANTED') {
    return null;
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200/90 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Icon badge */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-inner relative">
            {isRequestingLocation ? (
              <RotateCw className="w-9 h-9 animate-spin text-emerald-600" />
            ) : locationPermission === 'DENIED' ? (
              <AlertCircle className="w-9 h-9 text-rose-500" />
            ) : (
              <Navigation className="w-9 h-9 text-emerald-600 animate-pulse" />
            )}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              India-Wide Geo-Radius Protection
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isRequestingLocation || locationPermission === 'REQUESTING' || locationPermission === 'UNKNOWN'
                ? 'Detecting Your Current Location...'
                : locationPermission === 'DENIED'
                ? 'Location Access Required'
                : 'Real Device GPS Verification Required'}
            </h2>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {isRequestingLocation || locationPermission === 'REQUESTING' || locationPermission === 'UNKNOWN'
                ? 'Please allow browser location access to automatically detect your precise coordinates and apply the authoritative local service radius (20 km villages, 40 km cities).'
                : locationPermission === 'DENIED'
                ? 'Location permission was denied. SurplusX requires real device GPS coordinates to guarantee surplus freshness and prevent out-of-radius orders.'
                : 'To view surplus listings and make reservations, SurplusX requires your real current location without hardcoded city defaults.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={refreshLocation}
              disabled={isRequestingLocation}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <RotateCw className={`w-4 h-4 ${isRequestingLocation ? 'animate-spin' : ''}`} />
              <span>{isRequestingLocation ? 'Detecting GPS...' : 'Enable Location / Retry'}</span>
            </button>

            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Select Locality Manually</span>
            </button>
          </div>

          {/* Trust Footer */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Zero-Default Policy • No hardcoded cities • 100% Real GPS Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
