import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Bell,
  ShoppingCart,
  ShieldCheck,
  ChevronDown,
  User,
  LogOut,
  Building,
  Building2,
  HeartHandshake,
  ShieldAlert,
  Menu,
  X,
  Smartphone,
  CheckCircle2,
  Store,
  Bike,
  LogIn,
  UserPlus,
  Package,
  PlusCircle,
  BarChart3,
  Receipt,
  Navigation,
  FileCheck2,
  Layers,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SurplusXLogo } from './SurplusXLogo';
import { UserRole, isAdminRole } from '../types';

interface NavbarProps {
  onOpenMobileFrame?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileFrame }) => {
  const {
    currentUser,
    isAuthenticated,
    logout,
    activeView,
    setActiveView,
    selectedCity,
    setSelectedCity,
    searchQuery,
    setSearchQuery,
    cart,
    setIsCheckoutOpen,
    setIsAuthModalOpen,
    setAuthMode,
    setIsDeviceModalOpen,
    notifications,
    markNotificationAsRead,
    requireAuth,
    userLocation,
    appliedDiscoveryRadius,
    appliedLocalityType,
    setIsLocationModalOpen,
  } = useApp();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cities = ['Bangalore, India', 'Mumbai, India', 'Delhi NCR, India', 'Hyderabad, India', 'Chennai, India'];

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'CONSUMER':
        return { label: 'Consumer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: User };
      case 'BUSINESS':
        return { label: 'Business Merchant', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Building2 };
      case 'NGO':
        return { label: 'NGO Partner', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: HeartHandshake };
      case 'RETAILER':
        return { label: 'B2B Retailer', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Store };
      case 'RIDER':
        return { label: 'Rider Partner', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: Bike };
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return { 
          label: role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Command', 
          color: 'bg-purple-50 text-purple-700 border-purple-200', 
          icon: ShieldAlert 
        };
    }
  };

  const handleOpenLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  // Render role-specific navigation items
  const renderNavLinks = () => {
    if (!currentUser) {
      // GUEST NAVIGATION
      return (
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveView('landing')}
            className={`transition-colors hover:text-emerald-600 ${
              activeView === 'landing' ? 'text-emerald-600 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveView('browse')}
            className={`transition-colors hover:text-emerald-600 ${
              activeView === 'browse' ? 'text-emerald-600 font-semibold' : ''
            }`}
          >
            Explore Food
          </button>
          <button
            onClick={() => setActiveView('how-it-works')}
            className={`transition-colors hover:text-emerald-600 ${
              activeView === 'how-it-works' ? 'text-emerald-600 font-semibold' : ''
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => setActiveView('impact')}
            className={`transition-colors hover:text-emerald-600 ${
              activeView === 'impact' ? 'text-emerald-600 font-semibold' : ''
            }`}
          >
            Impact Metrics
          </button>
          <button
            onClick={() => setActiveView('about')}
            className={`transition-colors hover:text-emerald-600 ${
              activeView === 'about' ? 'text-emerald-600 font-semibold' : ''
            }`}
          >
            About
          </button>
        </nav>
      );
    }

    switch (currentUser.role) {
      case 'CONSUMER':
        return (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`transition-colors hover:text-emerald-600 ${
                activeView === 'dashboard' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              My Dashboard
            </button>
            <button
              onClick={() => setActiveView('browse')}
              className={`transition-colors hover:text-emerald-600 ${
                activeView === 'browse' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Browse Deals
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={`transition-colors hover:text-emerald-600 ${
                activeView === 'map' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Map Explorer
            </button>
            <button
              onClick={() => setActiveView('donations')}
              className={`transition-colors hover:text-emerald-600 ${
                activeView === 'donations' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Food Donations
            </button>
            <button
              onClick={() => setActiveView('impact')}
              className={`transition-colors hover:text-emerald-600 ${
                activeView === 'impact' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              My Impact
            </button>
          </nav>
        );

      case 'BUSINESS':
        return (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-1.5 transition-colors hover:text-emerald-600 ${
                activeView === 'dashboard' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              <Package className="w-4 h-4" />
              Inventory & Surplus
            </button>
            <button
              onClick={() => setActiveView('donations')}
              className={`flex items-center gap-1.5 transition-colors hover:text-emerald-600 ${
                activeView === 'donations' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              NGO Donations
            </button>
            <button
              onClick={() => setActiveView('browse')}
              className={`transition-colors hover:text-emerald-600 ${
                activeView === 'browse' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Public Marketplace
            </button>
          </nav>
        );

      case 'NGO':
        return (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-1.5 transition-colors hover:text-emerald-600 ${
                activeView === 'dashboard' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              NGO Command Center
            </button>
            <button
              onClick={() => setActiveView('live-tracking')}
              className={`flex items-center gap-1.5 transition-colors hover:text-emerald-600 ${
                activeView === 'live-tracking' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
              Live Telemetry
            </button>
            <button
              onClick={() => setActiveView('browse')}
              className={`transition-colors hover:text-emerald-600 ${
                activeView === 'browse' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveView('impact')}
              className={`transition-colors hover:text-emerald-600 ${
                activeView === 'impact' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Impact Stats
            </button>
          </nav>
        );

      case 'ADMIN':
      case 'SUPER_ADMIN':
        return (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-1.5 transition-colors hover:text-purple-600 ${
                activeView === 'dashboard' ? 'text-purple-600 font-semibold' : ''
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              Admin Command
            </button>
            <button
              onClick={() => setActiveView('browse')}
              className={`transition-colors hover:text-purple-600 ${
                activeView === 'browse' ? 'text-purple-600 font-semibold' : ''
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveView('live-tracking')}
              className={`flex items-center gap-1.5 transition-colors hover:text-purple-600 ${
                activeView === 'live-tracking' ? 'text-purple-600 font-semibold' : ''
              }`}
            >
              <Navigation className="w-4 h-4" />
              Fleet GPS
            </button>
            <button
              onClick={() => setActiveView('impact')}
              className={`transition-colors hover:text-purple-600 ${
                activeView === 'impact' ? 'text-purple-600 font-semibold' : ''
              }`}
            >
              Global Analytics
            </button>
          </nav>
        );

      default:
        return (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-emerald-600 font-semibold"
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('browse')}
              className="hover:text-emerald-600"
            >
              Browse
            </button>
          </nav>
        );
    }
  };

  const currentBadge = currentUser ? getRoleBadge(currentUser.role) : null;
  const RoleIcon = currentBadge?.icon || User;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView(currentUser ? 'dashboard' : 'landing')}
              className="flex items-center gap-2 focus:outline-hidden hover:opacity-90 transition-opacity"
              title="SurplusX Home"
            >
              <SurplusXLogo size="md" />
            </button>
          </div>

          {/* Center Search Bar (shown on desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'browse' && activeView !== 'dashboard' && activeView !== 'map') {
                    setActiveView('browse');
                  }
                }}
                placeholder="Search surplus deals, bakeries, meals..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full border border-slate-200/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-hidden"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Location Selector */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:border-emerald-200 text-xs font-medium text-slate-700 hover:text-emerald-800 transition-all border border-slate-200/80 cursor-pointer shadow-2xs group"
              title="Change Delivery Area or Use GPS Location"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-900 max-w-[120px] sm:max-w-[160px] truncate">
                  {userLocation ? userLocation.localityName.split('(')[0].trim() : 'Detecting GPS...'}
                </span>
              </div>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-emerald-100/70 text-emerald-800 font-bold text-[10px]">
                {appliedDiscoveryRadius}km
              </span>
            </button>

            {/* Cart Button (for Consumers and Guests) */}
            {(!currentUser || currentUser.role === 'CONSUMER') && (
              <button
                onClick={() => {
                  if (!currentUser) {
                    requireAuth({ type: 'CHECKOUT', description: 'View shopping cart & reservations' });
                  } else {
                    setIsCheckoutOpen(true);
                  }
                }}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                title="Your Cart & Reservations"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications Bell (Authenticated users) */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                {isNotifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">Notifications</span>
                      <span className="text-xs text-emerald-600 font-medium">{unreadNotifsCount} unread</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-800 mb-0.5">
                            <span>{notif.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{notif.time}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Unauthenticated Guest Auth Actions vs Authenticated Role Menu */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenLogin}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={handleOpenSignup}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-sm rounded-full transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </div>
            ) : (
              /* Authenticated User & Role Menu */
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border text-xs font-semibold shadow-2xs hover:shadow-xs transition-all ${currentBadge?.color}`}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/80 bg-slate-200 flex-shrink-0">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <RoleIcon className="w-4 h-4 m-1 text-slate-600" />
                    )}
                  </div>
                  <span className="hidden sm:inline">{currentBadge?.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{currentUser.name}</div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${currentBadge?.color}`}>
                          {currentBadge?.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser.email}</div>
                      {currentUser.phone && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
                          <span>{currentUser.phone}</span>
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Role Locked
                          </span>
                        </div>
                      )}
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Verified 1:1 Identity • {currentUser.city}</span>
                      </div>
                    </div>

                    <div className="py-1 px-2 space-y-0.5">
                      <button
                        onClick={() => {
                          setIsRoleDropdownOpen(false);
                          setActiveView('profile');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile & Role Details</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsRoleDropdownOpen(false);
                          setActiveView('dashboard');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <Building className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </button>

                      {currentUser.role === 'CONSUMER' && (
                        <>
                          <button
                            onClick={() => {
                              setIsRoleDropdownOpen(false);
                              setActiveView('browse');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 rounded-xl flex items-center gap-2.5 transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                            <span>Browse Surplus Deals</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsRoleDropdownOpen(false);
                              setActiveView('impact');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 rounded-xl flex items-center gap-2.5 transition-colors"
                          >
                            <Sparkles className="w-4 h-4 text-slate-400" />
                            <span>My Eco Impact</span>
                          </button>
                        </>
                      )}

                      {currentUser.role === 'BUSINESS' && (
                        <>
                          <button
                            onClick={() => {
                              setIsRoleDropdownOpen(false);
                              setActiveView('donations');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 rounded-xl flex items-center gap-2.5 transition-colors"
                          >
                            <HeartHandshake className="w-4 h-4 text-slate-400" />
                            <span>NGO Food Donations</span>
                          </button>
                        </>
                      )}

                      {currentUser.role === 'NGO' && (
                        <>
                          <button
                            onClick={() => {
                              setIsRoleDropdownOpen(false);
                              setActiveView('live-tracking');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-700 rounded-xl flex items-center gap-2.5 transition-colors"
                          >
                            <Navigation className="w-4 h-4 text-amber-500" />
                            <span>Live Rescue Telemetry</span>
                          </button>
                        </>
                      )}

                      {isAdminRole(currentUser.role) && (
                        <>
                          <button
                            onClick={() => {
                              setIsRoleDropdownOpen(false);
                              setActiveView('live-tracking');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-purple-700 rounded-xl flex items-center gap-2.5 transition-colors"
                          >
                            <Navigation className="w-4 h-4 text-purple-500" />
                            <span>Fleet GPS Telemetry</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setIsRoleDropdownOpen(false);
                          setIsDeviceModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <Smartphone className="w-4 h-4 text-slate-400" />
                        <span>Security & Device</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          setIsRoleDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="relative w-full mb-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search surplus items..."
              className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-sm outline-hidden border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            <button
              onClick={() => {
                setActiveView('landing');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-left bg-slate-50 hover:bg-emerald-50 text-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveView('browse');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-left bg-slate-50 hover:bg-emerald-50 text-slate-800"
            >
              Browse Surplus
            </button>
            <button
              onClick={() => {
                setActiveView('map');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-left bg-slate-50 hover:bg-emerald-50 text-slate-800"
            >
              Map View
            </button>
            {currentUser ? (
              <button
                onClick={() => {
                  setActiveView('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-xl text-left bg-emerald-600 text-white font-semibold"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  handleOpenLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-xl text-left bg-emerald-600 text-white font-semibold"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setIsDeviceModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-600 font-medium"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Device Binding Info
            </button>

            {!currentUser ? (
              <button
                onClick={() => {
                  handleOpenSignup();
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-full"
              >
                Create Account
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-full"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
