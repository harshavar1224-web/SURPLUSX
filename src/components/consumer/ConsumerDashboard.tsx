import React from 'react';
import {
  LayoutDashboard,
  Search,
  Map,
  CalendarCheck,
  HeartHandshake,
  MessageSquare,
  Sparkles,
  User,
  Settings,
  Leaf,
  IndianRupee,
  ShoppingBag,
  Heart,
  Clock,
  MapPin,
  ChevronRight,
  TrendingUp,
  Award,
  Globe2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConsumerDashboard: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    listings,
    setSelectedListing,
    orders,
    setSelectedOrderForTracking,
    setSelectedOrderForReceipt,
  } = useApp();

  const recommendedItems = listings.slice(0, 4);
  const activeOrders = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Center Main Dashboard Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Welcome Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {currentUser?.name?.split(' ')[0] || 'Rescuer'}!
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Together, let's reduce waste and create verified climate impact.
              </p>
            </div>

            {/* Quick Action Pill */}
            <button
              onClick={() => setActiveView('browse')}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Explore Deals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top 4-Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Metric 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 leading-tight">12</div>
                <div className="text-[11px] text-slate-500 font-medium">Reservations</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 leading-tight">4</div>
                <div className="text-[11px] text-slate-500 font-medium">Donations</div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 leading-tight">8.6 kg</div>
                <div className="text-[11px] text-slate-500 font-medium">CO₂ Saved</div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 leading-tight">₹1,250</div>
                <div className="text-[11px] text-slate-500 font-medium">Total Savings</div>
              </div>
            </div>
          </div>

          {/* Active Live Tracking Banner if an order is active */}
          {activeOrders.length > 0 && (
            <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                    Live NGO Logistics Active
                  </div>
                  <div className="text-sm font-bold text-white">
                    Order #{activeOrders[0].id} is on the way!
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Driver Rahul (Hope Foundation) • ETA ~8 mins
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedOrderForTracking(activeOrders[0]);
                  setActiveView('live-tracking');
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs transition-colors cursor-pointer"
              >
                Track Live
              </button>
            </div>
          )}

          {/* Recommended for You Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900">Recommended for You</h2>
              <button
                onClick={() => setActiveView('browse')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedListing(item);
                    setActiveView('browse');
                  }}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/70 p-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Item Image */}
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden mb-3 bg-slate-200">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                        -{item.discountPercentage}%
                      </span>
                    </div>

                    {/* Title & Store */}
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.storeName}</div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900">₹{item.price}</span>
                      <span className="text-[10px] text-slate-400 line-through ml-1.5">
                        ₹{item.originalPrice}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {item.distanceKm} km away
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail: Your Impact & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Your Impact Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center justify-between">
              <span>Your Impact</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>CO₂ Saved</span>
                </div>
                <span className="font-bold text-slate-900">8.6 kg</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShoppingBag className="w-4 h-4 text-teal-600" />
                  <span>Food Saved</span>
                </div>
                <span className="font-bold text-slate-900">24.3 kg</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <IndianRupee className="w-4 h-4 text-amber-600" />
                  <span>Money Saved</span>
                </div>
                <span className="font-bold text-slate-900">₹1,250</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 text-slate-600">
                  <Globe2 className="w-4 h-4 text-blue-600" />
                  <span>Communities Helped</span>
                </div>
                <span className="font-bold text-slate-900">12</span>
              </div>
            </div>

            <button
              onClick={() => setActiveView('impact')}
              className="w-full mt-4 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer"
            >
              View Full Impact
            </button>
          </div>

          {/* Make a Difference Card */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-3 -bottom-3 opacity-15">
              <Heart className="w-24 h-24 text-white" />
            </div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 mb-1">
              Make a Difference
            </h4>
            <p className="text-xs text-emerald-100/90 leading-relaxed mb-3">
              Donate surplus and help your community feed families in need today.
            </p>
            <button
              onClick={() => setActiveView('donations')}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Donate Now
            </button>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Recent Activity</h3>
              <button
                onClick={() => setActiveView('orders')}
                className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => {
                  setSelectedOrderForReceipt(orders[0]);
                  setActiveView('receipts');
                }}
                className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>Reserved a meal pack</span>
                  <span className="text-[10px] text-slate-400 font-normal">2h ago</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Spice Kitchen • ₹100</div>
              </div>

              <div
                onClick={() => setActiveView('donations')}
                className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>Donation completed</span>
                  <span className="text-[10px] text-slate-400 font-normal">1d ago</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Shelter Home • 50 meals</div>
              </div>

              <div
                onClick={() => {
                  setSelectedOrderForReceipt(orders[1]);
                  setActiveView('receipts');
                }}
                className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>Reserved bakery pack</span>
                  <span className="text-[10px] text-slate-400 font-normal">2d ago</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Bake House • ₹80</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
