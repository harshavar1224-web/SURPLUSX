import React, { useState, useRef } from 'react';
import { 
  Menu, 
  MapPin, 
  Bell, 
  ShoppingCart, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Building2, 
  HeartHandshake, 
  Store, 
  Bike 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';
import { UserRole } from '../../types';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export const DashboardHeader: React.FC = () => {
  const {
    currentUser,
    logout,
    setActiveView,
    notifications,
    setIsMobileSidebarOpen,
    isMobileSidebarOpen,
    selectedCity,
    setSelectedCity,
    cart,
    setIsCheckoutOpen,
    setIsLocationModalOpen,
  } = useApp();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useOutsideClick(cityRef, () => setIsCityDropdownOpen(false), isCityDropdownOpen);
  useOutsideClick(notifRef, () => setIsNotifOpen(false), isNotifOpen);
  useOutsideClick(profileRef, () => setIsProfileDropdownOpen(false), isProfileDropdownOpen);

  const cities = ['Bangalore, India', 'Mumbai, India', 'Delhi NCR, India', 'Hyderabad, India', 'Chennai, India'];
  const unreadNotifs = (notifications || []).filter((n) => !n.read);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getRoleBadgeInfo = (role?: UserRole) => {
    switch (role) {
      case 'CONSUMER':
        return { label: 'Consumer', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'BUSINESS':
        return { label: 'Business Merchant', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'NGO':
        return { label: 'NGO Partner', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'RETAILER':
        return { label: 'B2B Retailer', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'RIDER':
        return { label: 'Rider Partner', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      default:
        return { label: 'Member', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadgeInfo(currentUser?.role);

  return (
    <header className="shrink-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between shadow-xs z-30 w-full">
      {/* Left: Mobile Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <SurplusXLogo size="sm" showWordmark={true} />
        </div>
      </div>

      {/* Center: City Selector / Context */}
      <div className="hidden md:flex items-center gap-3">
        <div className="relative" ref={cityRef}>
          <button
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{selectedCity}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isCityDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Hub</div>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${
                    selectedCity === city ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="text-xs text-slate-500 hover:text-slate-900 underline font-medium cursor-pointer"
        >
          Radius & GPS Settings
        </button>
      </div>

      {/* Right: Cart, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Cart Button (for Consumers) */}
        {currentUser?.role === 'CONSUMER' && (
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="relative p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5"
            title="View Cart & Checkout"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                {cartItemCount}
              </span>
            )}
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileDropdownOpen(false);
            }}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</h3>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {unreadNotifs.length} Unread
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications yet.</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                      <p className="font-semibold text-slate-800">{n.title}</p>
                      <p className="text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setActiveView('notifications');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Badge Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileDropdownOpen(!isProfileDropdownOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{currentUser?.name}</div>
              <div className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full inline-block border ${roleInfo.color}`}>
                {roleInfo.label}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveView('profile');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
                </button>
                <button
                  onClick={() => {
                    setActiveView('settings');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Settings & Security
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    logout();
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
