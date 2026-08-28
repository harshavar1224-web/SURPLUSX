import React from 'react';
import {
  MapPin,
  Navigation,
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Eye,
  Building,
  TreePine,
  Landmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LocationDiscoveryBanner: React.FC = () => {
  const {
    userLocation,
    setIsLocationModalOpen,
    requestLiveLocation,
    isRequestingLocation,
    appliedDiscoveryRadius,
    appliedLocalityType,
    isLowAccuracyWarning,
    locationAccuracyMeters,
    includeWiderMarketplace,
    setIncludeWiderMarketplace,
    listings,
  } = useApp();

  const eligibleCount = listings.filter((l) => (l.distanceKm || 0) <= appliedDiscoveryRadius).length;
  const outsideCount = listings.filter((l) => (l.distanceKm || 0) > appliedDiscoveryRadius).length;

  const getLocalityIcon = () => {
    switch (appliedLocalityType) {
      case 'VILLAGE':
        return TreePine;
      case 'TOWN':
        return Building;
      case 'CITY':
      case 'METRO':
      default:
        return Landmark;
    }
  };

  const LocalityIcon = getLocalityIcon();

  return (
    <div className="space-y-2 mb-6">
      {/* Low GPS Accuracy Warning (Requirement #5) */}
      {isLowAccuracyWarning && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Low GPS Accuracy (~{Math.round(locationAccuracyMeters / 1000)} km):</strong> Your
              browser reported approximate network coordinates. For precise surplus distance filtering, we
              recommend choosing your exact locality.
            </span>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shrink-0 text-[11px] cursor-pointer"
          >
            Select Locality
          </button>
        </div>
      )}

      {/* Main Authoritative Discovery Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-500/20 shadow-md relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-64 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Location details */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <LocalityIcon className="w-3 h-3 text-emerald-400" />
                <span>{appliedLocalityType} PLATFORM POLICY</span>
              </span>

              {userLocation.isLiveGps ? (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold flex items-center gap-1 border border-blue-400/20">
                  <Navigation className="w-2.5 h-2.5 animate-pulse" />
                  <span>Live GPS Verified</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                  Manual Area Selection
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>{userLocation.localityName}</span>
                <span className="text-slate-400 font-normal text-xs">({userLocation.district})</span>
              </h2>
            </div>

            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Showing surplus listings within the platform standard{' '}
                <strong className="text-emerald-300 font-bold">{appliedDiscoveryRadius} km radius</strong>{' '}
                ({eligibleCount} in range{outsideCount > 0 && `, ${outsideCount} beyond range`}).
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Change Location</span>
            </button>

            <button
              onClick={requestLiveLocation}
              disabled={isRequestingLocation}
              title="Detect device GPS location"
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isRequestingLocation ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {outsideCount > 0 && (
              <button
                onClick={() => setIncludeWiderMarketplace(!includeWiderMarketplace)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  includeWiderMarketplace
                    ? 'bg-slate-800 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{includeWiderMarketplace ? 'Hide Out-of-Radius' : `View ${outsideCount} Beyond Radius`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
