import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  List,
  Crosshair,
  Store,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Home,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusListing, CategoryType } from '../../types';
import { LocationCard } from '../location/LocationCard';
import { mapplsClient } from '../../services/mapplsClient';

export const InteractiveMapView: React.FC = () => {
  const {
    listings,
    setActiveView,
    setSelectedListing,
    selectedCategory,
    setSelectedCategory,
    userLocation,
    appliedDiscoveryRadius,
    appliedLocalityType,
    requestLiveLocation,
    isRequestingLocation,
    setIsLocationModalOpen,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [selectedMapItem, setSelectedMapItem] = useState<SurplusListing | null>(null);
  const [showRadiusBoundary, setShowRadiusBoundary] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const categories: ('All' | CategoryType)[] = [
    'All',
    'Food',
    'Bakery',
    'Fruits & Vegetables',
    'Dairy',
    'Cooked Meals',
  ];

  // Filter listings by selected category and within radius
  const filteredListings = listings.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      if (!(selectedCategory === 'Food' && item.category !== 'Others')) {
        return false;
      }
    }
    return true;
  });

  // 1. Initialize Map with Mappls GIS Platform
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMapplsMap() {
      try {
        const config = await mapplsClient.getConfig();
        const mapKey = config.mapKey;

        if (!mapInstanceRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [userLocation.latitude, userLocation.longitude],
            zoom: appliedLocalityType === 'VILLAGE' ? 12 : 13,
            zoomControl: false,
          });

          L.control.zoom({ position: 'bottomright' }).addTo(map);

          // Official Mappls Vector Layer
          const mapplsTileUrl = mapKey
            ? `https://apis.mappls.com/advancedmaps/v1/${mapKey}/still_map/vector/{z}/{x}/{y}.png`
            : `https://apis.mappls.com/advancedmaps/v1/map_sdk/vector/{z}/{x}/{y}.png`;

          const tileLayer = L.tileLayer(mapplsTileUrl, {
            maxZoom: 19,
            tileSize: 256,
          });

          tileLayer.on('tileerror', () => {
            if (isSubscribed && !config.isConfigured) {
              setMapError('Map service temporarily unavailable. Please verify Mappls Web Map credentials.');
            }
          });

          tileLayer.addTo(map);

          const markersGroup = L.layerGroup().addTo(map);
          markersLayerRef.current = markersGroup;
          mapInstanceRef.current = map;
        }
      } catch (err) {
        if (isSubscribed) {
          console.error('[Mappls Interactive View] Map initialization error:', err);
          setMapError('Map service temporarily unavailable.');
        }
      }
    }

    initMapplsMap();

    return () => {
      isSubscribed = false;
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isRetrying]);

  // 2. Update User Location & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;

    // Pan map to user location
    map.setView([userLat, userLng], map.getZoom());

    // Update User Marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <div class="absolute w-9 h-9 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="relative w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const newUserMarker = L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(
        `<div class="p-2 text-xs">
          <div class="font-bold text-slate-900">${userLocation.localityName || 'Your Location'}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${userLocation.formattedAddress || 'India'}</div>
          <div class="mt-1.5 inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
            ${userLocation.localityType} Area • ${appliedDiscoveryRadius} km Discovery Radius
          </div>
        </div>`
      );

    userMarkerRef.current = newUserMarker;

    // Update Discovery Radius Boundary Circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    if (showRadiusBoundary) {
      const radiusMeters = appliedDiscoveryRadius * 1000;
      const circle = L.circle([userLat, userLng], {
        radius: radiusMeters,
        color: '#10b981',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#10b981',
        fillOpacity: 0.05,
      }).addTo(map);

      radiusCircleRef.current = circle;
    }
  }, [userLocation, appliedDiscoveryRadius, appliedLocalityType, showRadiusBoundary]);

  // 3. Render Listing Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredListings.forEach((item) => {
      if (!item.coordinates || typeof item.coordinates.lat !== 'number' || typeof item.coordinates.lng !== 'number') {
        return;
      }

      const isInsideRadius = typeof item.distanceKm === 'number' ? item.distanceKm <= appliedDiscoveryRadius : true;
      const isSelected = selectedMapItem?.id === item.id;

      const listingPinIcon = L.divIcon({
        className: 'custom-listing-pin',
        html: `
          <div class="cursor-pointer transition-transform hover:scale-110 flex flex-col items-center -translate-x-1/2 -translate-y-full">
            <div class="px-2.5 py-1 rounded-xl ${
              isSelected
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/30'
                : isInsideRadius
                ? 'bg-slate-900 text-white'
                : 'bg-slate-500 text-slate-200'
            } text-[11px] font-extrabold shadow-md whitespace-nowrap flex items-center gap-1.5 border border-white/30">
              <span>₹${item.price}</span>
              ${
                typeof item.distanceKm === 'number'
                  ? `<span class="text-[9px] font-normal ${isSelected ? 'text-emerald-100' : 'text-emerald-400'}">${item.distanceKm.toFixed(1)}km</span>`
                  : ''
              }
            </div>
            <div class="w-2.5 h-2.5 ${
              isSelected ? 'bg-emerald-600' : isInsideRadius ? 'bg-slate-900' : 'bg-slate-500'
            } rotate-45 -mt-1 shadow-sm"></div>
          </div>
        `,
        iconSize: [60, 36],
        iconAnchor: [30, 36],
      });

      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], {
        icon: listingPinIcon,
      }).addTo(markersGroup);

      marker.on('click', () => {
        setSelectedMapItem(item);
        map.panTo([item.coordinates.lat, item.coordinates.lng]);
      });
    });
  }, [filteredListings, selectedMapItem, appliedDiscoveryRadius]);

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [userLocation.latitude, userLocation.longitude],
        appliedLocalityType === 'VILLAGE' ? 12 : 13
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interactive Map</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              LIVE RADAR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial visualization of surplus listings within your authorized {appliedLocalityType} radius ({appliedDiscoveryRadius} km)
          </p>
        </div>

        {/* Switch to List View */}
        <button
          id="map-switch-to-list-btn"
          onClick={() => setActiveView('browse')}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <List className="w-4 h-4 text-emerald-600" />
          <span>Switch to List View</span>
        </button>
      </div>

      {/* Location Card Display */}
      <LocationCard variant="compact" onOpenSearch={() => setIsLocationModalOpen(true)} />

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowRadiusBoundary(!showRadiusBoundary)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              showRadiusBoundary
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{showRadiusBoundary ? `${appliedDiscoveryRadius}km Boundary On` : 'Boundary Off'}</span>
          </button>

          <button
            onClick={handleCenterOnUser}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all"
            title="Center on my location"
          >
            <Crosshair className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Main Leaflet Map Stage */}
      <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-300 shadow-md bg-slate-100">
        {/* Leaflet map DOM node */}
        <div id="leaflet-map-canvas" ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Error Overlay */}
        {mapError && (
          <div className="absolute top-4 left-4 right-4 z-10 bg-rose-900/90 backdrop-blur-md text-white p-3.5 rounded-2xl border border-rose-500/30 shadow-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{mapError}</span>
            </div>
            <button
              onClick={() => {
                setIsRetrying((prev) => !prev);
                setMapError(null);
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Selected Item Bottom Card Preview (Floating inside Map) */}
        {selectedMapItem && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-4 flex gap-3.5">
              <img
                src={selectedMapItem.imageUrl}
                alt={selectedMapItem.title}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100"
              />

              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      {selectedMapItem.category}
                    </span>
                    {typeof selectedMapItem.distanceKm === 'number' && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        {selectedMapItem.distanceKm.toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                    {selectedMapItem.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Store className="w-3 h-3 text-slate-400" />
                    <span>{selectedMapItem.storeName}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-emerald-700">₹{selectedMapItem.price}</span>
                    <span className="text-[11px] text-slate-400 line-through">₹{selectedMapItem.originalPrice}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedListing(selectedMapItem);
                      setActiveView('browse');
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <span>View Deal</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
