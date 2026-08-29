import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  X,
  Search,
  Building,
  TreePine,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Compass,
  RefreshCw,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocalityType } from '../../types';
import { LocationSearchResult } from '../../server/locationEngine';

export const LocationSelectModal: React.FC = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    userLocation,
    setUserManualLocation,
    requestLiveLocation,
    isRequestingLocation,
    locationPermission,
    appliedDiscoveryRadius,
    appliedLocalityType,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Custom coordinates input
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomCoords, setShowCustomCoords] = useState(false);

  // Live dynamic India-wide Search with Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setSearchResults(data.results);
        }
      } catch {
        // Handled silently
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isLocationModalOpen) return null;

  const handleSelectSearchResult = async (result: LocationSearchResult) => {
    await setUserManualLocation(result.latitude, result.longitude, result.name);
    setIsLocationModalOpen(false);
  };

  const handleApplyCustomCoords = async () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || lat < 6.5 || lat > 37.5 || lng < 68.0 || lng > 97.5) {
      alert('Please enter valid coordinates within India (Latitude 6.5° - 37.5° N, Longitude 68.0° - 97.5° E)');
      return;
    }
    await setUserManualLocation(lat, lng, customName.trim() || 'Custom Coordinates Location');
    setIsLocationModalOpen(false);
  };

  const getLocalityBadge = (type: LocalityType) => {
    switch (type) {
      case 'METRO':
      case 'CITY':
        return {
          label: type === 'METRO' ? 'Metro Locality' : 'City Locality',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Landmark,
          radius: '40 km',
        };
      case 'TOWN':
        return {
          label: 'Town Locality',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Building,
          radius: '40 km',
        };
      case 'VILLAGE':
        return {
          label: 'Village Locality',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: TreePine,
          radius: '20 km',
        };
    }
  };

  return (
    <div
      id="surplusx-location-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Select Discovery Location
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  MANDATORY LOCAL RADIUS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                All-India food rescue: Orders are strictly restricted to your verified surrounding boundary so food arrives fresh.
              </p>
            </div>
          </div>
          <button
            id="close-loc-modal-btn"
            onClick={() => setIsLocationModalOpen(false)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Location Bar */}
        <div className="px-5 sm:px-6 py-3 bg-emerald-50/80 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2 text-xs min-w-0">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
            <div className="min-w-0 truncate">
              <span className="text-slate-500 font-medium">Active: </span>
              <span className="font-bold text-emerald-950">
                {userLocation.localityName || userLocation.district || 'India'}
              </span>
              {userLocation.state && (
                <span className="text-slate-600 text-[11px] ml-1.5 font-medium">
                  ({userLocation.district ? `${userLocation.district}, ` : ''}{userLocation.state}
                  {userLocation.postalCode ? ` - ${userLocation.postalCode}` : ''})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-2xs">
              {appliedDiscoveryRadius} km Standard Radius
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
              {appliedLocalityType} POLICY
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Action 1: Live GPS Request Button */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>Device Geolocation (Live GPS)</span>
                  {userLocation.isLiveGps && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ACTIVE GPS
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Requests coordinates from your device and reverse-geocodes your address automatically.
                </p>
                {locationPermission === 'DENIED' && (
                  <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Location access disabled in browser. You can search any location or PIN code manually below.</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                id="modal-detect-gps-btn"
                onClick={async () => {
                  const ok = await requestLiveLocation();
                  if (ok) setIsLocationModalOpen(false);
                }}
                disabled={isRequestingLocation}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRequestingLocation ? 'animate-spin' : ''}`} />
                <span>{isRequestingLocation ? 'Detecting GPS...' : 'Use My Current Location'}</span>
              </button>
            </div>
          </div>

          {/* Action 2: Nationwide Search Bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Search Any Village, Town, City, District, or PIN Code Across India</span>
            </label>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="india-location-search-input"
                placeholder="Type village, town, city, district, or 6-digit PIN code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-hidden transition-all"
              />
              {isSearching && (
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* Dynamic Search Results (When typing) */}
          {searchQuery.trim().length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Search Results ({searchResults.length})</span>
                {isSearching && <span className="text-[11px] text-emerald-600 font-normal">Searching across India...</span>}
              </div>

              {searchResults.length === 0 && !isSearching ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  No matching locations found for "{searchQuery}". Try searching by district name or 6-digit postal PIN code.
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {searchResults.map((result, idx) => {
                    const badge = getLocalityBadge(result.localityType);
                    const Icon = badge.icon;

                    return (
                      <button
                        key={`${result.latitude}-${result.longitude}-${idx}`}
                        type="button"
                        onClick={() => handleSelectSearchResult(result)}
                        className="w-full p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group flex items-start justify-between gap-3 bg-white"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {result.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${badge.color}`}>
                              <Icon className="w-2.5 h-2.5" />
                              <span>{badge.label}</span>
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                            {result.formattedAddress || result.description}
                          </p>

                          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{result.district}, {result.state}</span>
                            {result.postalCode && <span>• PIN: {result.postalCode}</span>}
                            <span>• Radius: {result.defaultRadiusKm} km</span>
                          </div>
                        </div>

                        <div className="shrink-0 pt-1 text-slate-400 group-hover:text-emerald-600">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* Action 3: Custom GPS Coordinate Entry (PostGIS) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCustomCoords(!showCustomCoords)}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{showCustomCoords ? 'Hide Direct Coordinates Input' : '+ Enter Decimal Coordinates Manually (PostGIS)'}</span>
            </button>

            {showCustomCoords && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">
                  Direct Coordinates Resolution (Within India: Lat 6.5°-37.5°, Lng 68.0°-97.5°)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
                    <input
                      type="text"
                      placeholder="17.4483"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
                    <input
                      type="text"
                      placeholder="78.3915"
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Locality Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Custom Area"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomCoords}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Reverse Geocode & Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              All-India SurplusX policy: Orders are strictly restricted to verified stores within your surrounding boundary.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(false)}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
