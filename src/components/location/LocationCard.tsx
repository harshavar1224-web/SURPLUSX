import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building2,
  Home,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LocationCardProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
  onOpenSearch?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  variant = 'full',
  className = '',
  onOpenSearch,
}) => {
  const {
    userLocation,
    appliedDiscoveryRadius,
    appliedLocalityType,
    requestLiveLocation,
    isRequestingLocation,
    setIsLocationModalOpen,
  } = useApp();

  const [showCoordinates, setShowCoordinates] = useState(false);

  if (!userLocation) {
    return null;
  }

  // Derive GPS Accuracy Status (Specification #1, #6)
  const accuracy = userLocation.accuracy || 15;
  let accuracyLabel = 'High Precision';
  let accuracyColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let accuracyDot = 'bg-emerald-500';

  if (accuracy > 500) {
    accuracyLabel = `Low Precision (±${Math.round(accuracy)}m)`;
    accuracyColor = 'text-amber-700 bg-amber-50 border-amber-200';
    accuracyDot = 'bg-amber-500';
  } else if (accuracy > 50) {
    accuracyLabel = `Standard GPS (±${Math.round(accuracy)}m)`;
    accuracyColor = 'text-blue-700 bg-blue-50 border-blue-200';
    accuracyDot = 'bg-blue-500';
  } else {
    accuracyLabel = `Precise GPS (±${Math.round(accuracy)}m)`;
  }

  const handleUseCurrentLocation = async () => {
    await requestLiveLocation();
  };

  const handleOpenSelectModal = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setIsLocationModalOpen(true);
    }
  };

  // Compact Variant (e.g. for Headers or Mobile top bars)
  if (variant === 'compact') {
    return (
      <div
        id="location-card-compact"
        className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
              <span>{userLocation.localityName || 'Select Location'}</span>
              <span className="text-[11px] font-normal px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                {appliedDiscoveryRadius} km
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-xs">
              {userLocation.formattedAddress || 'India'}
            </p>
          </div>
        </div>

        <button
          id="compact-change-loc-btn"
          onClick={handleOpenSelectModal}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 shrink-0 px-2 py-1 hover:bg-emerald-50 rounded-md transition-colors"
        >
          Change
        </button>
      </div>
    );
  }

  // Full Location Card (Specification #6 & #45)
  return (
    <div
      id="location-card-full"
      className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-sm transition-all hover:shadow-md ${className}`}
    >
      {/* Accent Header Bar */}
      <div className="h-1.5 w-full bg-linear-to-r from-emerald-500 via-teal-500 to-indigo-500" />

      <div className="p-4 sm:p-5">
        {/* Top Status Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${accuracyDot}`}
              />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${accuracyDot}`} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {userLocation.isLiveGps ? 'Live GPS Location' : 'Selected Location'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Locality Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {appliedLocalityType === 'VILLAGE' ? (
                <Home className="w-3 h-3 text-emerald-600" />
              ) : (
                <Building2 className="w-3 h-3 text-emerald-600" />
              )}
              {appliedLocalityType} Locality
            </span>

            {/* Platform Radius Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              {appliedDiscoveryRadius} km Platform Radius
            </span>

            {/* Accuracy Badge */}
            {userLocation.isLiveGps && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${accuracyColor}`}
              >
                {accuracyLabel}
              </span>
            )}
          </div>
        </div>

        {/* Main Address Information */}
        <div className="py-3.5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-200">
            <MapPin className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {userLocation.localityName || userLocation.district || 'India Wide Service'}
              </h3>
              {userLocation.state && (
                <span className="text-xs text-slate-500 font-medium">
                  • {userLocation.district ? `${userLocation.district}, ` : ''}
                  {userLocation.state}
                  {userLocation.postalCode ? ` - ${userLocation.postalCode}` : ''}
                </span>
              )}
            </div>

            {/* Complete Formatted Address (Specification #4) */}
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
              {userLocation.formattedAddress ||
                `${userLocation.localityName}, ${userLocation.state || 'India'}`}
            </p>

            {/* Low Accuracy Warning (Specification #6) */}
            {userLocation.isLiveGps && accuracy > 500 && (
              <div className="mt-2.5 flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>
                  GPS accuracy is low (±{Math.round(accuracy)}m). You can search your specific village, town, or PIN code for exact precision.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Technical Coordinates Details (Specification #6) */}
        <div className="pt-1">
          <button
            id="toggle-coords-btn"
            onClick={() => setShowCoordinates(!showCoordinates)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 py-1 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>
              Coordinates: {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
            </span>
            {showCoordinates ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          {showCoordinates && (
            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Latitude</span>
                <span className="font-mono font-medium text-slate-800">
                  {userLocation.latitude.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Longitude</span>
                <span className="font-mono font-medium text-slate-800">
                  {userLocation.longitude.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Accuracy</span>
                <span className="font-mono font-medium text-slate-800">
                  ±{Math.round(userLocation.accuracy || 15)} meters
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Source / PIN</span>
                <span className="font-mono font-medium text-slate-800">
                  {userLocation.source} • {userLocation.postalCode || 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Marketplace listings are strictly filtered within this radius.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Live GPS Button (Specification #1, #6) */}
            <button
              id="loc-card-use-gps-btn"
              onClick={handleUseCurrentLocation}
              disabled={isRequestingLocation}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 transition-colors disabled:opacity-50"
              title="Detect live coordinates via GPS"
            >
              {isRequestingLocation ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{isRequestingLocation ? 'Acquiring GPS...' : 'Use Current Location'}</span>
            </button>

            {/* Change Location Search Button (Specification #6) */}
            <button
              id="loc-card-change-btn"
              onClick={handleOpenSelectModal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Change Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
