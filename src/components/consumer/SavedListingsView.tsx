import React from 'react';
import {
  Heart,
  ShoppingBag,
  Store,
  Clock,
  MapPin,
  Sparkles,
  IndianRupee,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusListing } from '../../types';

export const SavedListingsView: React.FC = () => {
  const {
    listings,
    savedListingIds,
    toggleSavedListing,
    addToCart,
    setActiveView,
    triggerToast,
  } = useApp();

  const savedListings = listings.filter((l) => savedListingIds.includes(l.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Saved Surplus Deals
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Keep track of favorite grocery bundles, artisan bakeries, and daily surplus offerings.
          </p>
        </div>

        <button
          onClick={() => setActiveView('browse')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          Explore More Deals
        </button>
      </div>

      {/* Saved items list */}
      {savedListings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No saved items yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click the heart icon on any surplus listing to save it for easy access later.
          </p>
          <button
            onClick={() => setActiveView('browse')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => toggleSavedListing(listing.id)}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-xs text-rose-500 hover:scale-110 transition-transform shadow-xs cursor-pointer"
                      title="Remove from saved"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600/95 text-white text-xs font-bold backdrop-blur-xs shadow-xs">
                      {listing.discountPercentage}% OFF
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{listing.storeName}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {listing.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-base font-bold text-slate-900">
                      ₹{listing.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{listing.originalPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Pickup: {listing.pickupWindow}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    addToCart(listing, 1);
                    triggerToast(`Added ${listing.title} to your bag!`, 'success');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Reserve Surplus Deal</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
