import React from 'react';
import {
  Map,
  SlidersHorizontal,
  MapPin,
  Heart,
  Clock,
  Sparkles,
  ShoppingBag,
  Filter,
  Check,
  IndianRupee,
  Star,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryType, SurplusListing } from '../../types';
import { LocationCard } from '../location/LocationCard';

export const BrowseListings: React.FC = () => {
  const {
    listings,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    maxDistanceKm,
    setMaxDistanceKm,
    selectedDietary,
    setSelectedDietary,
    sortBy,
    setSortBy,
    toggleFavorite,
    setSelectedListing,
    setActiveView,
    addToCart,
    appliedDiscoveryRadius,
    appliedLocalityType,
    userLocation,
    includeWiderMarketplace,
    setIncludeWiderMarketplace,
    verifyDistanceEligibility,
  } = useApp();

  const categories: ('All' | CategoryType)[] = [
    'All',
    'Food',
    'Bakery',
    'Fruits & Vegetables',
    'Dairy',
    'Beverages',
    'Cooked Meals',
    'Others',
  ];

  const dietaryOptions = ['Veg', 'Vegan', 'Halal', 'Gluten-Free', 'Dairy-Free'];

  // Filtering & Sorting Logic
  const filteredListings = listings.filter((item) => {
    // Distance Policy match (if not including wider marketplace, enforce platform discovery radius)
    const isWithinPlatformRadius = item.distanceKm <= appliedDiscoveryRadius;
    if (!includeWiderMarketplace && !isWithinPlatformRadius) {
      return false;
    }

    // Category match
    if (selectedCategory !== 'All' && item.category !== selectedCategory && selectedCategory !== 'Food') {
      return false;
    }
    // Search query match
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.storeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Price range match
    if (item.price < priceRange[0] || item.price > priceRange[1]) {
      return false;
    }
    // Custom slider distance match
    if (item.distanceKm > maxDistanceKm) {
      return false;
    }
    // Dietary match
    if (selectedDietary.length > 0) {
      const hasMatch = selectedDietary.some((tag) => item.dietaryTags.includes(tag as any));
      if (!hasMatch) return false;
    }
    return true;
  });

  // Sorting
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
    return 0; // recommended
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Location-Based Discovery & Radius Status Banner */}
      <LocationCard variant="full" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Browse Surplus</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active in <span className="font-semibold text-slate-700">{userLocation.localityName}</span> •{' '}
            <span className="text-emerald-700 font-semibold">{appliedLocalityType} ({appliedDiscoveryRadius} km Discovery Radius)</span> •{' '}
            {sortedListings.length} deals available
          </p>
        </div>

        {/* View on Map Toggle Button */}
        <button
          onClick={() => setActiveView('map')}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Map className="w-4 h-4 text-emerald-600" />
          <span>View on Map</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Filters
            </span>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setPriceRange([0, 500]);
                setMaxDistanceKm(appliedDiscoveryRadius);
                setSelectedDietary([]);
                setSortBy('recommended');
                setIncludeWiderMarketplace(false);
              }}
              className="text-[11px] font-medium text-emerald-600 hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Wider Radius Toggle */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeWiderMarketplace}
                onChange={(e) => setIncludeWiderMarketplace(e.target.checked)}
                className="mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Show items outside {appliedDiscoveryRadius} km</span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                  Browse distant regional surplus (ordering requires matching proximity).
                </span>
              </div>
            </label>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-2.5">Categories</label>
            <div className="space-y-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
              <span>Price Range</span>
              <span className="text-emerald-600">Up to ₹{priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="20"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹0</span>
              <span>₹250</span>
              <span>₹500</span>
            </div>
          </div>

          {/* Platform Discovery Radius Policy (Server-Authoritative) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Discovery Radius</span>
              </span>
              <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md text-[11px] font-extrabold">
                {appliedDiscoveryRadius} km
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Server-enforced platform policy for <strong>{appliedLocalityType}</strong> localities. Orders require verified geographic proximity.
            </p>
          </div>

          {/* Dietary Preferences */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-2">Dietary</label>
            <div className="space-y-1.5">
              {dietaryOptions.map((tag) => {
                const isChecked = selectedDietary.includes(tag);
                return (
                  <label
                    key={tag}
                    className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDietary([...selectedDietary, tag]);
                        } else {
                          setSelectedDietary(selectedDietary.filter((t) => t !== tag));
                        }
                      }}
                      className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>{tag}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 outline-hidden focus:border-emerald-500"
            >
              <option value="recommended">Recommended</option>
              <option value="distance">Distance: Nearest First</option>
              <option value="discount">Discount: Highest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Main Listing Grid */}
        <main className="lg:col-span-9">
          {sortedListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No surplus deals match your area & filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                SurplusX is enforcing a {appliedDiscoveryRadius} km radius for {appliedLocalityType} areas. You can enable regional viewing or change your location above.
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => setIncludeWiderMarketplace(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                >
                  Show Regional Deals
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange([0, 500]);
                    setMaxDistanceKm(40);
                    setSelectedDietary([]);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedListings.map((item) => {
                const eligibility = verifyDistanceEligibility(item.coordinates, item.id);
                const isWithinArea = eligibility.allowed;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border ${
                      isWithinArea ? 'border-slate-200/80' : 'border-amber-200/80 bg-amber-50/10'
                    } shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group`}
                  >
                    <div
                      onClick={() => {
                        setSelectedListing(item);
                        setActiveView('listing-detail');
                      }}
                      className="cursor-pointer"
                    >
                      {/* Item Image with Badges */}
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-extrabold shadow-sm">
                          -{item.discountPercentage}%
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-white/80 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-rose-500 transition-colors shadow-xs"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                          />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-xs text-white text-[10px] flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-amber-300" />
                          <span>{item.expiresInHours}h left</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4">
                        <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold mb-1">
                          <span>{item.category}</span>
                          <span className="flex items-center gap-0.5 text-slate-700">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {item.rating} ({item.reviewCount})
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <div className="text-xs text-slate-500 truncate mt-0.5">{item.storeName}</div>

                        {/* Location Policy Tag */}
                        <div className="mt-2 flex items-center gap-1.5">
                          {isWithinArea ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/50">
                              <ShieldCheck className="w-3 h-3" />
                              Within {appliedLocalityType} Radius
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Outside Boundary ({item.distanceKm} km &gt; {appliedDiscoveryRadius} km)
                            </span>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 mt-3">
                          <span className="text-lg font-extrabold text-slate-900">₹{item.price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Distance + Action */}
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                        <MapPin className={`w-3.5 h-3.5 ${isWithinArea ? 'text-emerald-600' : 'text-amber-500'}`} />
                        {item.distanceKm} km away
                      </span>

                      {isWithinArea ? (
                        <button
                          onClick={() => addToCart(item, 1)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Reserve Now
                        </button>
                      ) : (
                        <button
                          disabled
                          title={`Cannot order: Outside mandatory ${appliedLocalityType} surrounding boundary (${appliedDiscoveryRadius} km)`}
                          className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-medium rounded-xl cursor-not-allowed"
                        >
                          Out of Area
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
