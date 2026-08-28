import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  List,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Store,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusListing, CategoryType } from '../../types';

export const InteractiveMapView: React.FC = () => {
  const { listings, setActiveView, setSelectedListing, selectedCategory, setSelectedCategory } = useApp();
  const [selectedMapItem, setSelectedMapItem] = useState<SurplusListing>(listings[0]);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  const categories: ('All' | CategoryType)[] = [
    'All',
    'Food',
    'Bakery',
    'Fruits & Vegetables',
    'Dairy',
    'Cooked Meals',
  ];

  // Map pin coordinate positions relative to SVG viewport (500x350)
  const pinPositions: Record<string, { x: number; y: number }> = {
    'listing-1': { x: 380, y: 150 }, // Green Basket Store
    'listing-2': { x: 230, y: 120 }, // Bake House (Indiranagar)
    'listing-3': { x: 420, y: 240 }, // Spice Kitchen
    'listing-4': { x: 190, y: 220 }, // Fruit World
    'listing-5': { x: 360, y: 290 }, // Daily Dairy
    'listing-6': { x: 280, y: 170 }, // Cool Drinks
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Controls Bar — Wireframe Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Map View</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover active surplus pickups across Bangalore on the interactive map
          </p>
        </div>

        {/* Switch to List View */}
        <button
          onClick={() => setActiveView('browse')}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <List className="w-4 h-4 text-emerald-600" />
          <span>List View</span>
        </button>
      </div>

      {/* Category Filter Pills (as shown in wireframe) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
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

      {/* Map Container Canvas */}
      <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-300/80 shadow-md bg-slate-100">
        {/* SVG Interactive Map Grid & Vector Roads */}
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full object-cover bg-emerald-50/30"
          style={{ transform: `scale(${zoomLevel / 14})`, transformOrigin: 'center' }}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
            </pattern>
          </defs>

          {/* Map Base Grid */}
          <rect width="600" height="400" fill="url(#grid)" />

          {/* Green Parks / Areas */}
          <path
            d="M 50 40 Q 120 20 180 80 T 140 160 Q 60 140 50 40 Z"
            fill="#dcfce7"
            opacity="0.7"
          />
          <path
            d="M 440 60 Q 520 40 560 120 T 480 180 Q 420 120 440 60 Z"
            fill="#dcfce7"
            opacity="0.7"
          />
          <path
            d="M 260 260 Q 340 240 380 320 T 300 370 Q 240 320 260 260 Z"
            fill="#dcfce7"
            opacity="0.7"
          />

          {/* Major Highway Arteries */}
          <path
            d="M 0 180 Q 200 170 300 200 T 600 190"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 0 180 Q 200 170 300 200 T 600 190"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <path
            d="M 280 0 Q 300 180 320 400"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 280 0 Q 300 180 320 400"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Secondary Roads */}
          <path d="M 120 0 L 140 400" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <path d="M 460 0 L 440 400" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <path d="M 0 90 L 600 100" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <path d="M 0 310 L 600 300" fill="none" stroke="#e2e8f0" strokeWidth="4" />

          {/* Area Text Labels */}
          <text x="70" y="70" fill="#94a3b8" fontSize="10" fontWeight="600">
            Cubbon Park
          </text>
          <text x="210" y="100" fill="#64748b" fontSize="11" fontWeight="700">
            Indiranagar
          </text>
          <text x="360" y="130" fill="#64748b" fontSize="11" fontWeight="700">
            Koramangala
          </text>
          <text x="390" y="220" fill="#64748b" fontSize="11" fontWeight="700">
            HSR Layout
          </text>
          <text x="160" y="200" fill="#64748b" fontSize="11" fontWeight="700">
            Jayanagar
          </text>

          {/* User Location Pulse Point (Blue Dot with Ring) */}
          <g transform="translate(320, 210)">
            <circle cx="0" cy="0" r="14" fill="#38bdf8" opacity="0.3" className="animate-ping" />
            <circle cx="0" cy="0" r="7" fill="#0284c7" stroke="white" strokeWidth="2" />
            <text x="12" y="4" fill="#0369a1" fontSize="9" fontWeight="bold">
              You are here
            </text>
          </g>

          {/* Render Active Surplus Store Pin Markers (Wireframe style) */}
          {listings.map((item) => {
            const pos = pinPositions[item.id] || { x: 300, y: 200 };
            const isSelected = selectedMapItem?.id === item.id;

            return (
              <g
                key={item.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedMapItem(item)}
                className="cursor-pointer group"
              >
                {/* Pin Head */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? '14' : '11'}
                  fill={isSelected ? '#15803d' : '#16a34a'}
                  stroke="white"
                  strokeWidth="2.5"
                  className="transition-all drop-shadow-md group-hover:scale-110"
                />
                <circle cx="0" cy="0" r="4" fill="white" />

                {/* Floating Store Pill Tag */}
                <rect
                  x="-45"
                  y="-34"
                  width="90"
                  height="18"
                  rx="9"
                  fill="white"
                  stroke={isSelected ? '#15803d' : '#cbd5e1'}
                  strokeWidth="1.5"
                  className="drop-shadow-xs"
                />
                <text
                  x="0"
                  y="-22"
                  fill="#0f172a"
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {item.storeName.length > 13 ? item.storeName.slice(0, 12) + '…' : item.storeName}
                </text>
                <text
                  x="0"
                  y="-12"
                  fill="#16a34a"
                  fontSize="7"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {item.distanceKm} km
                </text>
              </g>
            );
          })}
        </svg>

        {/* Map UI Floating Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <button
            onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
            className="w-8 h-8 rounded-xl bg-white text-slate-700 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(10, z - 1))}
            className="w-8 h-8 rounded-xl bg-white text-slate-700 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(14)}
            className="w-8 h-8 rounded-xl bg-white text-emerald-600 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
            title="Recenter"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Selected Store Card at Bottom — Wireframe Exact Match */}
        {selectedMapItem && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/90 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                <img
                  src={selectedMapItem.image}
                  alt={selectedMapItem.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 px-1.5 py-0.5 rounded-tl-md bg-emerald-600 text-white text-[9px] font-extrabold">
                  -{selectedMapItem.discountPercentage}%
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-emerald-600 uppercase">
                  Near You • {selectedMapItem.distanceKm} km away
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {selectedMapItem.title}
                </h4>
                <div className="text-[11px] text-slate-500 truncate">{selectedMapItem.storeName}</div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-slate-900">
                      ₹{selectedMapItem.price}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      ₹{selectedMapItem.originalPrice}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedListing(selectedMapItem);
                      setActiveView('listing-detail');
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    View Details
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
