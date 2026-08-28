import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  X,
  Search,
  Building,
  TreePine,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocalityType } from '../../types';

interface PresetLocation {
  name: string;
  type: LocalityType;
  district: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
  defaultRadiusKm: number;
}

const PRESET_LOCALITIES: PresetLocation[] = [
  // CITIES (Default 40 km Policy)
  {
    name: 'Bengaluru Urban Metro (Central)',
    type: 'CITY',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    description: 'Koramangala, Indiranagar, MG Road, HSR, Jayanagar',
    defaultRadiusKm: 40,
  },
  {
    name: 'Whitefield Tech Zone',
    type: 'CITY',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9698,
    lng: 77.7500,
    description: 'ITPL, Hope Farm, Kadugodi, Varthur Sub-zone',
    defaultRadiusKm: 40,
  },
  {
    name: 'Mysuru Heritage City',
    type: 'CITY',
    district: 'Mysuru',
    state: 'Karnataka',
    lat: 12.2958,
    lng: 76.6394,
    description: 'Sayyaji Rao Rd, Palace Corridor, Gokulam',
    defaultRadiusKm: 40,
  },

  // TOWNS (Default 40 km Policy)
  {
    name: 'Ramanagara Silk Town',
    type: 'TOWN',
    district: 'Ramanagara',
    state: 'Karnataka',
    lat: 12.7209,
    lng: 77.2799,
    description: 'Township Center, APMC Silk Cocoon Market, Highway',
    defaultRadiusKm: 40,
  },
  {
    name: 'Channapatna Toy Town',
    type: 'TOWN',
    district: 'Ramanagara',
    state: 'Karnataka',
    lat: 12.6518,
    lng: 77.2089,
    description: 'Crafts cluster, BM Road Town Market, Railway Junction',
    defaultRadiusKm: 40,
  },
  {
    name: 'Doddaballapura Industrial Town',
    type: 'TOWN',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    lat: 13.2929,
    lng: 77.5432,
    description: 'Apparel Park, APMC Yard, Rural Sub-District Hub',
    defaultRadiusKm: 40,
  },
  {
    name: 'Hosur Industrial Border Town',
    type: 'TOWN',
    district: 'Krishnagiri',
    state: 'Tamil Nadu',
    lat: 12.7409,
    lng: 77.8253,
    description: 'SIPCOT Industrial Area, Bagalur Rd, Border Town',
    defaultRadiusKm: 40,
  },

  // VILLAGES / RURAL BELTS (Default 20 km Policy)
  {
    name: 'Bidadi Rural Grama Panchayat',
    type: 'VILLAGE',
    district: 'Ramanagara',
    state: 'Karnataka',
    lat: 12.7963,
    lng: 77.3831,
    description: 'Rural Agrarian Belt, Dairy Chilling Cluster, Grama Hub',
    defaultRadiusKm: 20,
  },
  {
    name: 'Harohalli Village Cluster',
    type: 'VILLAGE',
    district: 'Ramanagara',
    state: 'Karnataka',
    lat: 12.6685,
    lng: 77.4578,
    description: 'Kanakapura Rural Corridor, Village Farm Co-ops',
    defaultRadiusKm: 20,
  },
  {
    name: 'Magadi Rural Settlement',
    type: 'VILLAGE',
    district: 'Ramanagara',
    state: 'Karnataka',
    lat: 12.9575,
    lng: 77.2281,
    description: 'Ragi & Millet Agro Belt, Rural Farmsteads',
    defaultRadiusKm: 20,
  },
  {
    name: 'Kanakapura Rural Outskirts',
    type: 'VILLAGE',
    district: 'Ramanagara',
    state: 'Karnataka',
    lat: 12.5532,
    lng: 77.4184,
    description: 'Arkavathi River Valley, Organic Farming Villages',
    defaultRadiusKm: 20,
  },
];

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
  const [filterType, setFilterType] = useState<'ALL' | 'CITY' | 'TOWN' | 'VILLAGE'>('ALL');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomCoords, setShowCustomCoords] = useState(false);

  if (!isLocationModalOpen) return null;

  const filteredPresets = PRESET_LOCALITIES.filter((loc) => {
    if (filterType !== 'ALL' && loc.type !== filterType) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.district.toLowerCase().includes(q) ||
      loc.description.toLowerCase().includes(q)
    );
  });

  const handleSelectPreset = async (preset: PresetLocation) => {
    await setUserManualLocation(preset.lat, preset.lng, preset.name);
    setIsLocationModalOpen(false);
  };

  const handleApplyCustomCoords = async () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid decimal coordinates (e.g. Latitude 12.9716, Longitude 77.5946)');
      return;
    }
    await setUserManualLocation(lat, lng, customName.trim() || 'Custom Coordinates Location');
    setIsLocationModalOpen(false);
  };

  const getLocalityBadge = (type: LocalityType) => {
    switch (type) {
      case 'CITY':
      case 'METRO':
        return {
          label: 'City Locality',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Landmark,
        };
      case 'TOWN':
        return {
          label: 'Town Locality',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Building,
        };
      case 'VILLAGE':
        return {
          label: 'Village / Rural Locality',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: TreePine,
        };
    }
  };

  return (
    <div
      id="surplusx-location-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Select Discovery Location</h2>
              <p className="text-xs text-slate-500">
                Authoritative Geo-Radius & Locality Classification Engine
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Location Bar */}
        <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="text-slate-600">Active Area: </span>
              <span className="font-bold text-emerald-950">{userLocation.localityName}</span>
              <span className="text-slate-500 text-[11px] ml-1">({userLocation.district})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-2xs">
              {appliedDiscoveryRadius} km Platform Radius
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
              {appliedLocalityType} POLICY
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Action 1: Live GPS Request Button */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
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
                  Detects your current device coordinates and classifies locality automatically.
                </p>
                {locationPermission === 'DENIED' && (
                  <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Location access is disabled in browser. You can select an area manually below.</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={async () => {
                  const ok = await requestLiveLocation();
                  if (ok) setIsLocationModalOpen(false);
                }}
                disabled={isRequestingLocation}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Navigation className={`w-3.5 h-3.5 ${isRequestingLocation ? 'animate-spin' : ''}`} />
                <span>{isRequestingLocation ? 'Detecting GPS...' : 'Use My Current Location'}</span>
              </button>
            </div>
          </div>

          {/* Search and Locality Type Tabs */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search city, town, or village in Karnataka..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
                />
              </div>

              {/* Locality Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['ALL', 'CITY', 'TOWN', 'VILLAGE'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      filterType === type
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type === 'ALL'
                      ? 'All'
                      : type === 'CITY'
                      ? 'City (40km)'
                      : type === 'TOWN'
                      ? 'Town (40km)'
                      : 'Village (20km)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const badge = getLocalityBadge(preset.type);
                const Icon = badge.icon;
                const isSelected =
                  !userLocation.isLiveGps &&
                  Math.abs(userLocation.latitude - preset.lat) < 0.01 &&
                  Math.abs(userLocation.longitude - preset.lng) < 0.01;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {preset.name}
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1 ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="font-bold text-slate-700">
                        {preset.defaultRadiusKm} km Platform Discovery
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Decimal Coordinate Input Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCustomCoords(!showCustomCoords)}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>{showCustomCoords ? 'Hide Custom Coordinates' : '+ Enter Exact GPS Coordinates Manually'}</span>
            </button>

            {showCustomCoords && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">Direct PostGIS Coordinate Input</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
                    <input
                      type="text"
                      placeholder="12.9716"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
                    <input
                      type="text"
                      placeholder="77.5946"
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Locality Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Whitefield"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomCoords}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Classify & Apply Coordinates
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Discovery radius is an authoritative server platform policy: <strong>Village = 20 km</strong>,{' '}
            <strong>Town = 40 km</strong>, <strong>City = 40 km</strong>.
          </span>
        </div>
      </div>
    </div>
  );
};
