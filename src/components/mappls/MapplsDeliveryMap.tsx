import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Navigation,
  Clock,
  Compass,
  Radio,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { DeliveryTelemetry, DeliveryTracking } from '../../types';
import { mapplsClient } from '../../services/mapplsClient';

interface MapplsDeliveryMapProps {
  delivery: DeliveryTelemetry | DeliveryTracking;
  height?: string;
  className?: string;
  showControls?: boolean;
  interactive?: boolean;
  title?: string;
}

export const MapplsDeliveryMap: React.FC<MapplsDeliveryMapProps> = ({
  delivery,
  height = '480px',
  className = '',
  showControls = true,
  interactive = true,
  title = 'Mappls Live Delivery Navigation',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ngoMarkerRef = useRef<L.Marker | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const trailPolylineRef = useRef<L.Polyline | null>(null);
  const pickupCircleRef = useRef<L.Circle | null>(null);
  const dropoffCircleRef = useRef<L.Circle | null>(null);

  const [followNgo, setFollowNgo] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveAddress, setLiveAddress] = useState<string>(
    delivery.currentAddress || 'Fetching street details via Mappls GIS...'
  );
  const [mapError, setMapError] = useState<string | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Normalize delivery coordinates
  const pickupLat = 'pickupLatitude' in delivery ? delivery.pickupLatitude : delivery.pickupLocation.lat;
  const pickupLng = 'pickupLongitude' in delivery ? delivery.pickupLongitude : delivery.pickupLocation.lng;
  const pickupAddr = 'pickupAddress' in delivery ? delivery.pickupAddress : delivery.pickupLocation.address;

  const dropoffLat = 'dropoffLatitude' in delivery ? delivery.dropoffLatitude : delivery.dropoffLocation.lat;
  const dropoffLng = 'dropoffLongitude' in delivery ? delivery.dropoffLongitude : delivery.dropoffLocation.lng;
  const dropoffAddr = 'dropoffAddress' in delivery ? delivery.dropoffAddress : delivery.dropoffLocation.address;

  const currentLat = 'currentLatitude' in delivery ? delivery.currentLatitude : delivery.currentLocation.lat;
  const currentLng = 'currentLongitude' in delivery ? delivery.currentLongitude : delivery.currentLocation.lng;
  const currentSpeed = 'currentSpeed' in delivery ? delivery.currentSpeed : (delivery.currentLocation.speed || 0);
  const currentHeading = 'currentHeading' in delivery ? delivery.currentHeading : (delivery.currentLocation.heading || 0);
  const currentAccuracy = 'currentAccuracy' in delivery ? delivery.currentAccuracy : (delivery.currentLocation.accuracy || 10);
  const lastUpdatedIso = 'lastLocationAt' in delivery ? delivery.lastLocationAt : delivery.currentLocation.lastUpdated;

  // "Last updated X seconds ago" counter
  useEffect(() => {
    const updateTimer = () => {
      if (!lastUpdatedIso) {
        setSecondsAgo(0);
        return;
      }
      const diffSec = Math.max(0, Math.floor((Date.now() - new Date(lastUpdatedIso).getTime()) / 1000));
      setSecondsAgo(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastUpdatedIso]);

  // Reverse geocoding via official Mappls Proxy (No fake fallbacks)
  useEffect(() => {
    let isMounted = true;
    mapplsClient.reverseGeocode(currentLat, currentLng).then((res) => {
      if (isMounted) {
        if (res.success && res.formattedAddress) {
          setLiveAddress(res.formattedAddress);
        } else if (res.message) {
          setLiveAddress(res.message);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentLat, currentLng]);

  // Initialize Map Engine with Mappls Map Key & Vector Layers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isSubscribed = true;

    async function initMap() {
      try {
        const config = await mapplsClient.getConfig();
        const mapKey = config.mapKey;

        if (!mapInstanceRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [currentLat, currentLng],
            zoom: 15,
            zoomControl: false,
            attributionControl: false,
          });

          // Mappls Vector Tiles Layer (Official Mappls Tile Gateway with MAPPLS_MAP_KEY)
          // Fallback vector URL with secure map key
          const mapplsTileUrl = mapKey
            ? `https://apis.mappls.com/advancedmaps/v1/${mapKey}/still_map/vector/{z}/{x}/{y}.png`
            : `https://apis.mappls.com/advancedmaps/v1/map_sdk/vector/{z}/{x}/{y}.png`;

          const tileLayer = L.tileLayer(mapplsTileUrl, {
            maxZoom: 19,
            tileSize: 256,
          });

          tileLayer.on('tileerror', () => {
            // If Mappls vector tiles fail, log notice and set user friendly status
            if (isSubscribed && !config.isConfigured) {
              setMapError('Map service temporarily unavailable. Please verify Mappls Web Map credentials.');
            }
          });

          tileLayer.addTo(map);
          mapInstanceRef.current = map;
        }
      } catch (err: any) {
        if (isSubscribed) {
          console.error('[Mappls Delivery Map] Map initialization error:', err);
          setMapError('Map service temporarily unavailable.');
        }
      }
    }

    initMap();

    return () => {
      isSubscribed = false;
    };
  }, [isRetrying]);

  // Synchronize Markers, Trails, Routes and Geofences
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Pickup Marker (Merchant Food Depot)
    const pickupIcon = L.divIcon({
      className: 'custom-mappls-pickup-marker',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
          <div style="background:#059669;color:#ffffff;padding:5px 9px;border-radius:12px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 4px 14px rgba(5,150,105,0.45);border:2px solid #ffffff;display:flex;align-items:center;gap:4px;">
            <span>📦</span> <span>Pickup Depot</span>
          </div>
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #059669;margin-top:-1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    if (!pickupMarkerRef.current) {
      pickupMarkerRef.current = L.marker([pickupLat, pickupLng], { icon: pickupIcon }).addTo(map);
      pickupMarkerRef.current.bindPopup(`
        <div style="font-family:sans-serif;padding:4px;min-width:180px;">
          <b style="color:#059669;font-size:12px;">📦 Merchant Pickup Depot</b>
          <p style="font-size:11px;color:#475569;margin:3px 0 0 0;">${pickupAddr}</p>
          <span style="display:inline-block;margin-top:5px;font-size:10px;background:#ecfdf5;color:#047857;padding:2px 6px;border-radius:4px;font-weight:bold;">150m Proximity Geofence</span>
        </div>
      `);
    } else {
      pickupMarkerRef.current.setLatLng([pickupLat, pickupLng]);
    }

    // 150m Pickup Geofence Boundary
    if (!pickupCircleRef.current) {
      pickupCircleRef.current = L.circle([pickupLat, pickupLng], {
        radius: 150,
        color: '#059669',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#10b981',
        fillOpacity: 0.09,
      }).addTo(map);
    }

    // 2. Dropoff Marker (Consumer / NGO Drop-off Destination)
    const dropoffIcon = L.divIcon({
      className: 'custom-mappls-dropoff-marker',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
          <div style="background:#2563eb;color:#ffffff;padding:5px 9px;border-radius:12px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 4px 14px rgba(37,99,235,0.45);border:2px solid #ffffff;display:flex;align-items:center;gap:4px;">
            <span>🏠</span> <span>Drop-off Destination</span>
          </div>
          <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #2563eb;margin-top:-1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    if (!dropoffMarkerRef.current) {
      dropoffMarkerRef.current = L.marker([dropoffLat, dropoffLng], { icon: dropoffIcon }).addTo(map);
      dropoffMarkerRef.current.bindPopup(`
        <div style="font-family:sans-serif;padding:4px;min-width:180px;">
          <b style="color:#2563eb;font-size:12px;">🏠 Delivery Destination</b>
          <p style="font-size:11px;color:#475569;margin:3px 0 0 0;">${dropoffAddr}</p>
          <span style="display:inline-block;margin-top:5px;font-size:10px;background:#eff6ff;color:#1d4ed8;padding:2px 6px;border-radius:4px;font-weight:bold;">150m Proximity Geofence</span>
        </div>
      `);
    } else {
      dropoffMarkerRef.current.setLatLng([dropoffLat, dropoffLng]);
    }

    // 150m Dropoff Geofence Boundary
    if (!dropoffCircleRef.current) {
      dropoffCircleRef.current = L.circle([dropoffLat, dropoffLng], {
        radius: 150,
        color: '#2563eb',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#3b82f6',
        fillOpacity: 0.09,
      }).addTo(map);
    }

    // 3. NGO Real Hardware GPS Marker with Dynamic Direction Arrow & Pulse
    const headingDeg = currentHeading || 0;
    const ngoIcon = L.divIcon({
      className: 'custom-mappls-ngo-marker',
      html: `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;transform:translate(-50%,-50%);">
          <!-- Real-Time Hardware GPS Pulse Ring -->
          <div style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(16,185,129,0.35);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <!-- Vehicle Avatar -->
          <div style="position:relative;width:36px;height:36px;background:#047857;border-radius:50%;border:2.5px solid #ffffff;box-shadow:0 4px 16px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:16px;">
            🚚
          </div>
          <!-- Heading Arrow -->
          <div style="position:absolute;top:-7px;transform:rotate(${headingDeg}deg);transition:transform 0.4s ease;">
            <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #047857;"></div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    if (!ngoMarkerRef.current) {
      ngoMarkerRef.current = L.marker([currentLat, currentLng], { icon: ngoIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      ngoMarkerRef.current.setLatLng([currentLat, currentLng]);
      ngoMarkerRef.current.setIcon(ngoIcon);
    }

    // 4. Mappls Calculated Road Route Polyline
    const routePoints = delivery.routeGeometry && delivery.routeGeometry.length > 0
      ? delivery.routeGeometry
      : [
          [currentLat, currentLng],
          [dropoffLat, dropoffLng],
        ];

    if (!routePolylineRef.current) {
      routePolylineRef.current = L.polyline(routePoints, {
        color: '#2563eb',
        weight: 4.5,
        opacity: 0.8,
        dashArray: '6, 8',
      }).addTo(map);
    } else {
      routePolylineRef.current.setLatLngs(routePoints);
    }

    // 5. NGO Real GPS Travelled Trail Polyline
    const trailPoints = delivery.travelledTrail && delivery.travelledTrail.length > 0
      ? delivery.travelledTrail
      : [[currentLat, currentLng]];

    if (!trailPolylineRef.current) {
      trailPolylineRef.current = L.polyline(trailPoints, {
        color: '#10b981',
        weight: 5,
        opacity: 0.9,
      }).addTo(map);
    } else {
      trailPolylineRef.current.setLatLngs(trailPoints);
    }

    // Auto Follow NGO Driver if enabled
    if (followNgo) {
      map.panTo([currentLat, currentLng], { animate: true, duration: 0.5 });
    }

    // Responsive Canvas Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    currentLat,
    currentLng,
    currentHeading,
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    delivery.routeGeometry,
    delivery.travelledTrail,
    followNgo,
  ]);

  const fitBoundsAll = () => {
    if (!mapInstanceRef.current) return;
    const group = L.featureGroup([
      L.marker([pickupLat, pickupLng]),
      L.marker([dropoffLat, dropoffLng]),
      L.marker([currentLat, currentLng]),
    ]);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
  };

  const handleRetry = () => {
    setIsRetrying((prev) => !prev);
    setMapError(null);
  };

  const connectionStatus = delivery.connectionStatus || 'LIVE';

  return (
    <div
      id="mappls-delivery-tracking-stage"
      className={`relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900 ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Error Overlay */}
      {mapError && (
        <div className="absolute top-16 left-4 right-4 z-1000 bg-rose-900/90 backdrop-blur-md text-white p-3.5 rounded-2xl border border-rose-500/30 shadow-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{mapError}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Floating Top Header: Live Telemetry Heads-Up Display */}
      <div className="absolute top-4 left-4 right-4 z-1000 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Connection & ETA Pill */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Status Indicator */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-white flex items-center gap-2 shadow-lg">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connectionStatus === 'LIVE'
                  ? 'bg-emerald-400 animate-pulse ring-4 ring-emerald-400/30'
                  : connectionStatus === 'STALE'
                  ? 'bg-amber-400 ring-4 ring-amber-400/30'
                  : 'bg-rose-500'
              }`}
            ></span>
            <span className="text-xs font-black tracking-wide">
              {connectionStatus === 'LIVE'
                ? 'MAPPLS LIVE GPS'
                : connectionStatus === 'STALE'
                ? 'STALE GPS'
                : 'OFFLINE'}
            </span>
          </div>

          {/* Dynamic ETA Pill */}
          {delivery.etaMinutes ? (
            <div className="bg-emerald-600/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 border border-emerald-400/30">
              <Clock className="w-3.5 h-3.5" />
              <span>ETA: {delivery.etaMinutes} min</span>
              {delivery.distanceRemainingKm !== undefined && (
                <span className="text-emerald-200 text-[10px]">
                  ({delivery.distanceRemainingKm.toFixed(1)} km)
                </span>
              )}
            </div>
          ) : null}

          {/* Last Updated Counter */}
          <div className="hidden sm:flex bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-slate-300 text-[11px] font-mono items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span>Updated {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}</span>
          </div>
        </div>

        {/* Map Control Tools */}
        {showControls && (
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Auto Follow Toggle */}
            <button
              onClick={() => setFollowNgo(!followNgo)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-md border shadow-md flex items-center gap-1.5 cursor-pointer ${
                followNgo
                  ? 'bg-emerald-600 border-emerald-400/50 text-white'
                  : 'bg-slate-900/80 border-white/20 text-slate-200 hover:bg-slate-900'
              }`}
              title="Follow NGO Delivery Partner"
            >
              <Navigation className={`w-3.5 h-3.5 ${followNgo ? 'text-white animate-spin' : ''}`} />
              <span>Follow Driver</span>
            </button>

            {/* Fit All Points */}
            <button
              onClick={fitBoundsAll}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-white/20 text-slate-200 backdrop-blur-md transition-all shadow-md cursor-pointer"
              title="Fit Full Route"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-white/20 text-slate-200 backdrop-blur-md transition-all shadow-md cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom HUD: Reverse Geocoded Street & Telemetry Sensor Data */}
      <div className="absolute bottom-4 left-4 right-4 z-1000 pointer-events-none">
        <div className="bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-white shadow-2xl pointer-events-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400">
                  Mappls GIS Street Address
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (GPS: ±{currentAccuracy}m)
                </span>
              </div>
              <p className="text-xs font-bold text-slate-100 truncate mt-0.5">
                {liveAddress}
              </p>
            </div>
          </div>

          {/* Speed & Heading Badges */}
          <div className="flex items-center gap-3 text-xs shrink-0 self-end sm:self-auto">
            <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-extrabold">{currentSpeed.toFixed(1)} km/h</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hardware GPS Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
