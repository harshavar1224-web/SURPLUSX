import React from 'react';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Heart,
  Truck,
  Globe2,
  Store,
  Users,
  ShieldCheck,
  CheckCircle,
  TrendingDown,
  Clock,
  MapPin,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SurplusXLogo } from './SurplusXLogo';

export const PublicLanding: React.FC = () => {
  const {
    currentUser,
    setActiveView,
    listings,
    setSelectedListing,
    setIsAuthModalOpen,
    setAuthMode,
    requireAuth,
  } = useApp();

  const featuredListings = listings.slice(0, 4);

  const handleRoleCardClick = (role: 'CONSUMER' | 'BUSINESS' | 'NGO' | 'ADMIN') => {
    if (!currentUser) {
      setAuthMode('signup');
      setIsAuthModalOpen(true);
      return;
    }

    if (currentUser.role === role) {
      setActiveView('dashboard');
    } else {
      setActiveView('dashboard');
    }
  };

  return (
    <div className="w-full bg-slate-50 overflow-hidden">
      {/* Hero Section — Matching Wireframe 1 & 2 */}
      <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/70 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300/50 text-emerald-800 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Reduce Waste, Help People, Protect Planet</span>
              </div>

              {/* H1 Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Rescue Surplus.{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Create Impact.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                SurplusX connects businesses with extra stock to people and NGOs who need it most. Together, we reduce
                food waste, feed communities, and build a better tomorrow.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveView('browse')}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Browse Surplus</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) {
                      requireAuth({ type: 'DONATE', description: 'Donate surplus food to partner NGOs' });
                    } else {
                      setActiveView('donations');
                    }
                  }}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base border border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span>Donate Now</span>
                </button>
              </div>

              {/* Trust & Verification Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Verified NGOs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>FSSAI Quality Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Real GPS Live Logistics</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic with Floating Badges (Wireframe layout) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200/50 via-teal-100/30 to-amber-100/40 rounded-3xl blur-2xl transform -rotate-3 scale-95"></div>

                {/* Central Grocery Bag / Fresh Produce Showcase */}
                <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl bg-white p-3">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                    alt="Fresh surplus vegetables and fruits"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent rounded-2xl pointer-events-none"></div>

                  {/* Brand Tag on image */}
                  <div className="absolute bottom-6 left-6 z-20">
                    <SurplusXLogo size="md" textColor="light" />
                    <p className="text-xs text-slate-200 mt-1">Smart Surplus Logistics Engine</p>
                  </div>
                </div>

                {/* Floating Badge 1: Top Left "Save Food, Save Planet" */}
                <div className="absolute -top-4 -left-4 sm:top-2 sm:-left-6 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900">Save Food</div>
                    <div className="text-[11px] text-emerald-600 font-medium">Save Planet</div>
                  </div>
                </div>

                {/* Floating Badge 2: Top Right "12,540 kg Surplus Rescued" */}
                <div className="absolute -top-6 -right-4 sm:-top-4 sm:-right-6 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-slate-900">12,540 kg</div>
                    <div className="text-[11px] text-slate-500 font-medium">Surplus Rescued</div>
                  </div>
                </div>

                {/* Floating Badge 3: Bottom Right "8,652 People Helped" */}
                <div className="absolute -bottom-4 -right-4 sm:-bottom-4 sm:-right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 animate-in fade-in zoom-in duration-700">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-slate-900">8,652</div>
                    <div className="text-[11px] text-slate-500 font-medium">People Helped</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How SurplusX Works — Matching Wireframe 1 & 2 Exactly */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How SurplusX Works
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              A transparent, closed-loop ecosystem uniting stores, conscious buyers, and NGO rescue fleets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">1. Businesses List Surplus</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supermarkets, restaurants, and bakeries list extra wholesome stock at 40-70% discount before end of day.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">2. People Discover & Reserve</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conscious consumers find valuable deals nearby, reserve items with locked inventory, and pay seamlessly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">3. We Connect / NGOs Rescue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                SurplusX matches unsold meals with verified NGO partners for instant pickup and live GPS delivery.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">4. Impact Created</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Surplus finds a home. Meals nourish families, carbon emissions are averted, and verified impact is logged.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Surplus Deals — Recommended for You Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Today's Rescues Near You</h2>
            <p className="text-xs text-slate-500 mt-0.5">High-quality surplus ready for pickup in Bangalore</p>
          </div>
          <button
            onClick={() => setActiveView('browse')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Surplus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredListings.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedListing(item);
                setActiveView('listing-detail');
              }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Image & Discount Badge */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-extrabold shadow-sm">
                    -{item.discountPercentage}%
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-xs text-white text-[10px] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>{item.expiresInHours}h left</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="text-[11px] font-semibold text-emerald-700 mb-0.5">{item.category}</div>
                  <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{item.storeName}</div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-base font-extrabold text-slate-900">₹{item.price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {item.distanceKm} km away
                </span>
                <span className="font-semibold text-emerald-600 hover:underline">Reserve →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Exploration Showcase Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-bold">Explore SurplusX by Role</h3>
            <p className="text-xs text-slate-400 mt-1">
              SurplusX provides dedicated, strictly isolated portals for each stakeholder in the ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleRoleCardClick('CONSUMER')}
              className="p-5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Consumer</span>
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-white mb-1">Buy Rescued Food</div>
              <p className="text-xs text-slate-400">
                Browse discounts, reserve stock, pay with Razorpay, track driver GPS.
              </p>
            </button>

            <button
              onClick={() => handleRoleCardClick('BUSINESS')}
              className="p-5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Business</span>
                <Store className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-sm font-bold text-white mb-1">Manage Surplus</div>
              <p className="text-xs text-slate-400">
                Inventory thresholds, AI demand forecasts, dynamic pricing, donations.
              </p>
            </button>

            <button
              onClick={() => handleRoleCardClick('NGO')}
              className="p-5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">NGO Partner</span>
                <Heart className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-sm font-bold text-white mb-1">Rescue & Distribute</div>
              <p className="text-xs text-slate-400">
                Real GPS live driver telemetry, QR/OTP verification, beneficiary impact logs.
              </p>
            </button>

            <button
              onClick={() => handleRoleCardClick('ADMIN')}
              className="p-5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Admin Ops</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-sm font-bold text-white mb-1">Platform Command</div>
              <p className="text-xs text-slate-400">
                Live logistics fleet map, partner verification, ledger settlements, immutable audit logs.
              </p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
