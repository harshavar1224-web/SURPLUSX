import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Heart,
  Plus,
  Minus,
  CheckCircle,
  Share2,
  Store,
  Sparkles,
  Flame,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusListing } from '../../types';

export const ListingDetailModal: React.FC = () => {
  const {
    selectedListing,
    setSelectedListing,
    setActiveView,
    addToCart,
    toggleFavorite,
    appliedDiscoveryRadius,
    appliedLocalityType,
  } = useApp();
  const [quantity, setQuantity] = useState(1);

  if (!selectedListing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">No listing selected.</p>
        <button
          onClick={() => setActiveView('browse')}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  const item = selectedListing;
  const savings = (item.originalPrice - item.price) * quantity;
  const totalPrice = item.price * quantity;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button */}
      <button
        onClick={() => setActiveView('browse')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Listings</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Big Product Image Gallery — Wireframe Layout */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-extrabold shadow-sm">
              -{item.discountPercentage}% OFF
            </div>
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-xs text-white text-xs flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Expires in {item.expiresInHours} hours</span>
            </div>
          </div>

          {/* Quick Dietary and Quality Pills */}
          <div className="flex flex-wrap gap-2">
            {item.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold"
              >
                ✓ {tag}
              </span>
            ))}
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
              📦 {item.unit}
            </span>
          </div>
        </div>

        {/* Right Column: Listing & Store Info — Wireframe Layout */}
        <div className="lg:col-span-6 space-y-6">
          {/* Title & Ratings */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                {item.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Save to Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {item.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="font-semibold text-slate-800">{item.storeName}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {item.rating} ({item.reviewCount} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {item.distanceKm} km away
              </span>
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                ₹{item.price}{' '}
                <span className="text-sm font-normal text-slate-400 line-through ml-2">
                  ₹{item.originalPrice}
                </span>
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                {item.discountPercentage}% OFF • You save ₹{item.originalPrice - item.price}
              </div>
            </div>

            {item.quantityAvailable <= item.stockAlertThreshold && (
              <div className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-rose-500" />
                <span>Only {item.quantityAvailable} left!</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.description}</p>
          </div>

          {/* Pickup Details Box (as in wireframe) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Pickup Time: </span>
                <span className="text-slate-700">{item.pickupWindow}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Location: </span>
                <span className="text-slate-700">{item.pickupAddress}</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Reserve Action */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Quantity</span>
              <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1 border border-slate-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 disabled:opacity-40 shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-extrabold text-slate-900 w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(item.quantityAvailable, q + 1))}
                  disabled={quantity >= item.quantityAvailable}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 disabled:opacity-40 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mandatory Boundary Check Alert */}
            {typeof item.distanceKm === 'number' && item.distanceKm > appliedDiscoveryRadius && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Store Outside Surrounding Area</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    This store is {item.distanceKm} km away. Because SurplusX operates across India with mandatory local boundaries ({appliedDiscoveryRadius} km for {appliedLocalityType} areas), orders can only be placed from your verified surrounding area.
                  </div>
                </div>
              </div>
            )}

            {/* Reserve CTA Bar */}
            <div className="flex items-center gap-4">
              {typeof item.distanceKm === 'number' && item.distanceKm > appliedDiscoveryRadius ? (
                <button
                  disabled
                  className="flex-1 py-3.5 bg-slate-100 text-slate-400 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Outside Surrounding Boundary ({item.distanceKm} km)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    addToCart(item, quantity);
                    setActiveView('dashboard');
                  }}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Reserve Now (₹{totalPrice})</span>
                </button>
              )}
            </div>
          </div>

          {/* Store Information Card (as shown in wireframe) */}
          <div className="border-t border-slate-200/80 pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Store Information
            </h4>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.storeName}</h4>
                  <div className="text-[11px] text-emerald-600 font-medium">
                    Verified Merchant Partner
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-center text-xs">
                <div>
                  <div className="font-extrabold text-slate-900">{item.storePositiveRating}%</div>
                  <div className="text-[10px] text-slate-400">Positive Ratings</div>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div>
                  <div className="font-extrabold text-slate-900">{item.storeHappyCustomers}+</div>
                  <div className="text-[10px] text-slate-400">Happy Customers</div>
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div>
                  <div className="font-extrabold text-slate-900">{item.storeYearsActive}+ Years</div>
                  <div className="text-[10px] text-slate-400">On SurplusX</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
