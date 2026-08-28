import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Sparkles,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocalityType } from '../../types';
import { LocationSearchResult } from '../../server/locationEngine';

interface RegionalPreset {
  name: string;
  region: 'SOUTH' | 'NORTH' | 'WEST' | 'EAST_NE' | 'CENTRAL';
  type: LocalityType;
  district: string;
  state: string;
  lat: number;
  lng: number;
  postalCode: string;
  description: string;
  defaultRadiusKm: number;
}

const NATIONWIDE_PRESETS: RegionalPreset[] = [
  // SOUTH INDIA
  {
    name: 'Madhapur Tech Hub',
    region: 'SOUTH',
    type: 'METRO',
    district: 'Hyderabad',
    state: 'Telangana',
    lat: 17.4483,
    lng: 78.3915,
    postalCode: '500081',
    description: 'HITEC City, Inorbit Mall, Mindspace IT Corridor',
    defaultRadiusKm: 40,
  },
  {
    name: 'Bengaluru Urban Metro (Central)',
    region: 'SOUTH',
    type: 'METRO',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    postalCode: '560001',
    description: 'MG Road, Indiranagar, Koramangala, Brigade Road',
    defaultRadiusKm: 40,
  },
  {
    name: 'Vijayawada Commercial City',
    region: 'SOUTH',
    type: 'CITY',
    district: 'NTR',
    state: 'Andhra Pradesh',
    lat: 16.5062,
    lng: 80.648,
    postalCode: '520010',
    description: 'Benz Circle, MG Road Commercial Corridor, Krishna Riverfront',
    defaultRadiusKm: 40,
  },
  {
    name: 'Anantapur Town',
    region: 'SOUTH',
    type: 'TOWN',
    district: 'Anantapur',
    state: 'Andhra Pradesh',
    lat: 14.6819,
    lng: 77.6006,
    postalCode: '515001',
    description: 'Clock Tower Center, Subhash Road APMC Yard, Rayalaseema',
    defaultRadiusKm: 40,
  },
  {
    name: 'Kadapa (YSR) Town',
    region: 'SOUTH',
    type: 'TOWN',
    district: 'YSR Kadapa',
    state: 'Andhra Pradesh',
    lat: 14.4673,
    lng: 78.8242,
    postalCode: '516001',
    description: 'Seven Roads Junction, Madras Road Market Hub',
    defaultRadiusKm: 40,
  },
  {
    name: 'Rampachodavaram Tribal Village',
    region: 'SOUTH',
    type: 'VILLAGE',
    district: 'Alluri Sitharama Raju',
    state: 'Andhra Pradesh',
    lat: 17.4475,
    lng: 81.7767,
    postalCode: '533288',
    description: 'Agency Forest Belt, Organic Tribal Agro-Panchayat Settlement',
    defaultRadiusKm: 20,
  },
  {
    name: 'Bidadi Rural Grama Panchayat',
    region: 'SOUTH',
    type: 'VILLAGE',
    district: 'Ramanagara',
    state: 'Karnataka',
    lat: 12.7963,
    lng: 77.3831,
    postalCode: '562109',
    description: 'Agrarian Dairy Chilling Cluster, Grama Hub Road',
    defaultRadiusKm: 20,
  },
  {
    name: 'Chennai Central Metro',
    region: 'SOUTH',
    type: 'METRO',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    postalCode: '600001',
    description: 'Poonamallee High Road, George Town, Marina Coast',
    defaultRadiusKm: 40,
  },
  {
    name: 'Kochi Port City',
    region: 'SOUTH',
    type: 'CITY',
    district: 'Ernakulam',
    state: 'Kerala',
    lat: 9.9312,
    lng: 76.2673,
    postalCode: '682001',
    description: 'Fort Kochi, Marine Drive, MG Road, Backwaters',
    defaultRadiusKm: 40,
  },
  {
    name: 'Kumarakom Backwater Village',
    region: 'SOUTH',
    type: 'VILLAGE',
    district: 'Kottayam',
    state: 'Kerala',
    lat: 9.6175,
    lng: 76.4301,
    postalCode: '686563',
    description: 'Vembanad Lake Agrarian Belt, Rural Organic Rice Fields',
    defaultRadiusKm: 20,
  },

  // NORTH INDIA
  {
    name: 'New Delhi Central Metro',
    region: 'NORTH',
    type: 'METRO',
    district: 'New Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.209,
    postalCode: '110001',
    description: 'Connaught Place, Barakhamba Road, Central Secretariat',
    defaultRadiusKm: 40,
  },
  {
    name: 'South Delhi Urban',
    region: 'NORTH',
    type: 'CITY',
    district: 'South Delhi',
    state: 'Delhi',
    lat: 28.5494,
    lng: 77.2001,
    postalCode: '110016',
    description: 'Hauz Khas, Green Park, Aurobindo Marg, IIT Gate',
    defaultRadiusKm: 40,
  },
  {
    name: 'Lucknow Nawabi City',
    region: 'NORTH',
    type: 'CITY',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lng: 80.9462,
    postalCode: '226001',
    description: 'Hazratganj, Gomti Nagar, Chowk Heritage Belt',
    defaultRadiusKm: 40,
  },
  {
    name: 'Varanasi Heritage City',
    region: 'NORTH',
    type: 'CITY',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    postalCode: '221001',
    description: 'Dashashwamedh Ghat, Godowlia, Banaras Temple Corridor',
    defaultRadiusKm: 40,
  },
  {
    name: 'Jaipur Pink City',
    region: 'NORTH',
    type: 'CITY',
    district: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    postalCode: '302001',
    description: 'C-Scheme, MI Road, Hawa Mahal Market Ward',
    defaultRadiusKm: 40,
  },
  {
    name: 'Pushkar Sacred Town',
    region: 'NORTH',
    type: 'TOWN',
    district: 'Ajmer',
    state: 'Rajasthan',
    lat: 26.4899,
    lng: 74.5511,
    postalCode: '305022',
    description: 'Brahma Temple Ghat, Pushkar Lake Market, Desert Hub',
    defaultRadiusKm: 40,
  },
  {
    name: 'Kuldhara Heritage Village',
    region: 'NORTH',
    type: 'VILLAGE',
    district: 'Jaisalmer',
    state: 'Rajasthan',
    lat: 26.871,
    lng: 70.785,
    postalCode: '345001',
    description: 'Thar Desert Agrarian Hamlet, Traditional Sandstone Outpost',
    defaultRadiusKm: 20,
  },

  // WEST INDIA
  {
    name: 'Mumbai South Metro',
    region: 'WEST',
    type: 'METRO',
    district: 'Mumbai City',
    state: 'Maharashtra',
    lat: 18.9322,
    lng: 72.8311,
    postalCode: '400001',
    description: 'Fort, Colaba, Marine Drive, Nariman Point',
    defaultRadiusKm: 40,
  },
  {
    name: 'Pune IT City',
    region: 'WEST',
    type: 'CITY',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    postalCode: '411001',
    description: 'Shivajinagar, FC Road, Koregaon Park, Baner Tech Zone',
    defaultRadiusKm: 40,
  },
  {
    name: 'Baramati Agro Town',
    region: 'WEST',
    type: 'TOWN',
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.1517,
    lng: 74.577,
    postalCode: '413102',
    description: 'MIDC Agro Industrial Zone, Sugar & Dairy Processing Center',
    defaultRadiusKm: 40,
  },
  {
    name: 'Ralegan Siddhi Model Village',
    region: 'WEST',
    type: 'VILLAGE',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    lat: 18.9167,
    lng: 74.3167,
    postalCode: '414302',
    description: 'Model Watershed Village, Grama Panchayat Organic Orchards',
    defaultRadiusKm: 20,
  },
  {
    name: 'Ahmedabad Riverfront City',
    region: 'WEST',
    type: 'CITY',
    district: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    postalCode: '380001',
    description: 'Navrangpura, Ashram Road, Sabarmati Riverfront Corridor',
    defaultRadiusKm: 40,
  },
  {
    name: 'Anand Milk Capital Town',
    region: 'WEST',
    type: 'TOWN',
    district: 'Anand',
    state: 'Gujarat',
    lat: 22.5645,
    lng: 72.9289,
    postalCode: '388001',
    description: 'Amul Dairy Hub, Anand Town Center, Agro Co-operative Belt',
    defaultRadiusKm: 40,
  },

  // EAST & NORTHEAST INDIA
  {
    name: 'Kolkata Metro (Central)',
    region: 'EAST_NE',
    type: 'METRO',
    district: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    postalCode: '700001',
    description: 'BBD Bagh, Park Street Corridor, Salt Lake Sector V',
    defaultRadiusKm: 40,
  },
  {
    name: 'Siliguri Foothill Town',
    region: 'EAST_NE',
    type: 'TOWN',
    district: 'Darjeeling',
    state: 'West Bengal',
    lat: 26.7271,
    lng: 88.3953,
    postalCode: '734001',
    description: 'Sevoke Road, Tea Logistics Hub, Eastern Gateway Corridor',
    defaultRadiusKm: 40,
  },
  {
    name: 'Shantiniketan Cultural Rural Village',
    region: 'EAST_NE',
    type: 'VILLAGE',
    district: 'Birbhum',
    state: 'West Bengal',
    lat: 23.68,
    lng: 87.68,
    postalCode: '731235',
    description: 'Bolpur Agrarian Belt, Rural Khadi & Artisan Cooperatives',
    defaultRadiusKm: 20,
  },
  {
    name: 'Guwahati Gateway City',
    region: 'EAST_NE',
    type: 'CITY',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    lat: 26.1445,
    lng: 91.7362,
    postalCode: '781001',
    description: 'Paltan Bazaar, GS Road, Brahmaputra Riverfront Corridor',
    defaultRadiusKm: 40,
  },
  {
    name: 'Mawlynnong Cleanest Village',
    region: 'EAST_NE',
    type: 'VILLAGE',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.2014,
    lng: 91.9163,
    postalCode: '793109',
    description: 'Living Root Bridge Eco-Village, Khasi Forest Agrarian Belt',
    defaultRadiusKm: 20,
  },
  {
    name: 'Bhubaneswar Temple City',
    region: 'EAST_NE',
    type: 'CITY',
    district: 'Khurda',
    state: 'Odisha',
    lat: 20.2961,
    lng: 85.8245,
    postalCode: '751001',
    description: 'Saheed Nagar, Janpath Commercial Avenue, Infocity',
    defaultRadiusKm: 40,
  },

  // CENTRAL INDIA
  {
    name: 'Bhopal City of Lakes',
    region: 'CENTRAL',
    type: 'CITY',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    lat: 23.2599,
    lng: 77.4126,
    postalCode: '462001',
    description: 'Arera Colony, Link Road No. 1, Upper Lake Promenade',
    defaultRadiusKm: 40,
  },
  {
    name: 'Indore Commercial City',
    region: 'CENTRAL',
    type: 'CITY',
    district: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lng: 75.8577,
    postalCode: '452001',
    description: 'Palasia, MG Road, 56 Dukan Street Food Corridor',
    defaultRadiusKm: 40,
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
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'SOUTH' | 'NORTH' | 'WEST' | 'EAST_NE' | 'CENTRAL'>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'CITY' | 'TOWN' | 'VILLAGE'>('ALL');
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
        // Fallback to local filtering
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isLocationModalOpen) return null;

  // Filter Presets
  const filteredPresets = NATIONWIDE_PRESETS.filter((loc) => {
    if (selectedRegion !== 'ALL' && loc.region !== selectedRegion) return false;
    if (filterType !== 'ALL' && loc.type !== filterType && !(filterType === 'CITY' && loc.type === 'METRO')) {
      return false;
    }
    return true;
  });

  const handleSelectPreset = async (preset: RegionalPreset) => {
    await setUserManualLocation(preset.lat, preset.lng, preset.name);
    setIsLocationModalOpen(false);
  };

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
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ALL INDIA
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live GPS Coordinates & India-Wide Reverse Geocoding
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
              {appliedDiscoveryRadius} km Platform Radius
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
              {appliedLocalityType} POLICY
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Action 1: Live GPS Request Button (Specification #1, #6) */}
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
                  Requests real device coordinates via GPS and reverse-geocodes your complete village, town, or city address.
                </p>
                {locationPermission === 'DENIED' && (
                  <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Location access is disabled in your browser. You can search any location or PIN code manually below.</span>
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

          {/* Action 2: Nationwide Search Bar with 6-digit PIN code & Name Search (Specification #18, #19, #20) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Search Any Village, Town, City, District, or PIN Code Across India</span>
              <span className="text-[11px] text-slate-500 font-normal">e.g. 500081, 560001, Madhapur, Anantapur</span>
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

            {/* Quick PIN Code Suggestions Chips */}
            {!searchQuery && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500 font-medium">Quick PIN codes:</span>
                {[
                  { pin: '500081', label: 'Madhapur, HYD' },
                  { pin: '560001', label: 'Central BLR' },
                  { pin: '515001', label: 'Anantapur' },
                  { pin: '520010', label: 'Vijayawada' },
                  { pin: '110001', label: 'Connaught Pl, DEL' },
                  { pin: '400001', label: 'Fort, MUM' },
                  { pin: '700001', label: 'Central KOL' },
                ].map((item) => (
                  <button
                    key={item.pin}
                    type="button"
                    onClick={() => setSearchQuery(item.pin)}
                    className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md transition-colors"
                  >
                    {item.pin} ({item.label})
                  </button>
                ))}
              </div>
            )}
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

          {/* Action 3: Multi-Region Indian Presets Matrix (When no search active) */}
          {searchQuery.trim().length === 0 && (
            <div className="space-y-3">
              {/* Region Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All India' },
                  { id: 'SOUTH', label: 'South India' },
                  { id: 'NORTH', label: 'North & NCR' },
                  { id: 'WEST', label: 'West India' },
                  { id: 'EAST_NE', label: 'East & Northeast' },
                  { id: 'CENTRAL', label: 'Central India' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedRegion(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                      selectedRegion === tab.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Locality Type Filters */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                <span className="text-slate-500 font-medium">Filter by Area Type:</span>
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
                        ? 'Cities/Metros (40km)'
                        : type === 'TOWN'
                        ? 'Towns (40km)'
                        : 'Villages (20km)'}
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
                      key={`${preset.name}-${preset.postalCode}`}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-2xl border text-left transition-all group flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {preset.name}
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {preset.district}, {preset.state} • PIN: {preset.postalCode}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1 ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                        <span className="font-bold text-slate-700">
                          {preset.defaultRadiusKm} km Discovery
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action 4: Custom GPS Coordinate Entry (PostGIS) */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCustomCoords(!showCustomCoords)}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
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
                      placeholder="e.g. Madhapur Tech Hub"
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
                  Reverse Geocode & Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Discovery radius is an authoritative server platform policy:{' '}
            <strong>Village = 20 km</strong>, <strong>Town = 40 km</strong>, <strong>City/Metro = 40 km</strong>.
          </span>
        </div>
      </div>
    </div>
  );
};
