import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getNavConfigForRole, NavItemConfig } from '../../config/navigation';
import { SurplusXLogo } from '../SurplusXLogo';
import { UserRole, isAdminRole } from '../../types';

export const AppSidebar: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    logout,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    notifications,
    threads,
    orders,
    donations,
    activeDelivery,
    businesses,
    ngos,
  } = useApp();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isAdmin = isAdminRole(currentUser?.role);

  // Get strictly role-based navigation configuration
  const navItems = getNavConfigForRole(currentUser?.role);

  // Dynamic real badge calculations
  const unreadNotifsCount = notifications ? notifications.filter((n) => !n.read).length : 0;
  const unreadMessagesCount = threads ? threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) : 0;
  const activeOrdersCount = orders ? orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length : 0;
  const activeDonationsCount = donations ? donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHED' || d.status === 'ACCEPTED').length : 0;
  const activeDeliveriesCount = activeDelivery ? 1 : 0;
  
  // Real dynamic pending verifications count (if any businesses or NGOs are unverified)
  const pendingVerificationsCount = (businesses ? businesses.filter((b: any) => !b.isVerified).length : 0) +
    (ngos ? ngos.filter((n: any) => !n.isVerified).length : 0);

  const getBadgeValue = (key?: NavItemConfig['badgeKey']) => {
    if (!key) return null;
    switch (key) {
      case 'notifications':
        return unreadNotifsCount > 0 ? unreadNotifsCount : null;
      case 'messages':
        return unreadMessagesCount > 0 ? unreadMessagesCount : null;
      case 'orders':
        return activeOrdersCount > 0 ? activeOrdersCount : null;
      case 'donations':
        return activeDonationsCount > 0 ? activeDonationsCount : null;
      case 'deliveries':
        return activeDeliveriesCount > 0 ? activeDeliveriesCount : null;
      case 'verifications':
        return pendingVerificationsCount > 0 ? pendingVerificationsCount : null;
      case 'fraud':
        return null; // 0 active fraud threats
      default:
        return null;
    }
  };

  const getRoleBadgeStyle = (role?: UserRole) => {
    switch (role) {
      case 'CONSUMER':
        return { label: 'Consumer', color: 'bg-emerald-100/80 text-emerald-800 border-emerald-300/60' };
      case 'BUSINESS':
        return { label: 'Business Merchant', color: 'bg-blue-100/80 text-blue-800 border-blue-300/60' };
      case 'NGO':
        return { label: 'NGO Partner', color: 'bg-amber-100/80 text-amber-800 border-amber-300/60' };
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return { 
          label: role === 'SUPER_ADMIN' ? 'Platform Super Admin' : 'Platform Admin', 
          color: 'bg-purple-100/80 text-purple-800 border-purple-300/60' 
        };
      default:
        return { label: 'Guest Explorer', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const handleNavClick = (view: string) => {
    setActiveView(view);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  // Group nav items by category
  const categories = isAdmin
    ? (['MAIN', 'OPERATIONS', 'COMMUNICATION', 'SYSTEM', 'ADMINISTRATION'] as const)
    : (['MAIN', 'OPERATIONS', 'COMMUNICATION', 'ACCOUNT', 'SYSTEM'] as const);

  const roleStyle = getRoleBadgeStyle(currentUser?.role);

  return (
    <>
      {/* Mobile Slide-out Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar (Stationary Desktop + Slide-out Mobile) */}
      <aside
        id="app-sidebar-nav"
        className={`bg-white border-r border-slate-200/80 shadow-xs transition-all duration-300 flex flex-col justify-between select-none shrink-0 w-full h-full fixed md:static top-0 left-0 z-50 md:z-10 ${
          isMobileSidebarOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Collapse Toggle */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 h-16">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <SurplusXLogo size="sm" showWordmark={!isSidebarCollapsed} />
          </div>

          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle Sidebar"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Item List: Independently Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar pb-24">
          {/* Role Indicator Banner */}
          {!isSidebarCollapsed && currentUser && (
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60 mb-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Logged in role:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold border ${roleStyle.color}`}>
                  {roleStyle.label}
                </span>
              </div>
            </div>
          )}

          {/* Render Categorized Nav Items */}
          {categories.map((cat) => {
            const items = navItems.filter((i) => i.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    {cat}
                  </div>
                )}

                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeView === item.view ||
                    (item.view === 'dashboard' && (activeView === 'admin' || activeView === 'overview')) ||
                    (item.view === 'location-settings' && activeView === 'location-radius') ||
                    (item.view === 'reports' && activeView === 'reports-fraud') ||
                    (item.view === 'live-map' && activeView === 'map') ||
                    (item.view === 'browse' && (activeView === 'explore' || activeView === 'explore-surplus')) ||
                    (item.view === 'receipts' && activeView === 'receipt');
                  const badgeVal = getBadgeValue(item.badgeKey);

                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <button
                        onClick={() => handleNavClick(item.view)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                          isActive
                            ? isAdmin
                              ? 'bg-purple-600 text-white shadow-xs font-bold'
                              : 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
                        } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isActive
                              ? 'text-white'
                              : isAdmin
                              ? 'text-slate-500 group-hover:text-purple-600 group-hover:scale-110'
                              : 'text-slate-500 group-hover:text-emerald-600 group-hover:scale-110'
                          }`}
                        />

                        {!isSidebarCollapsed && (
                          <div className="flex-1 flex items-center justify-between text-left truncate">
                            <span className="truncate">{item.label}</span>
                            {badgeVal !== null && (
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : item.badgeKey === 'fraud'
                                    ? 'bg-rose-100 text-rose-700'
                                    : isAdmin
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {badgeVal}
                              </span>
                            )}
                          </div>
                        )}
                      </button>

                      {/* Tooltip for Collapsed Mode */}
                      {isSidebarCollapsed && hoveredItem === item.id && (
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg z-50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 pointer-events-none flex items-center gap-2">
                          <span>{item.label}</span>
                          {badgeVal !== null && (
                            <span className="px-1.5 py-0.2 rounded-md bg-purple-500 text-white text-[10px] font-bold">
                              {badgeVal}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom User Card / Device Trust Status: ONLY for Non-Admin roles */}
        {!isAdmin && (
          currentUser ? (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
              <div
                className={`flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center' : 'justify-between'
                }`}
              >
                <div
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  onClick={() => handleNavClick('profile')}
                  title="View My Profile"
                >
                  <img
                    src={
                      currentUser.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  {!isSidebarCollapsed && (
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {currentUser.name.split(' ')[0]}
                        </p>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Lock className="w-2.5 h-2.5 text-emerald-600" />
                        <span className="truncate">1-Device Bound</span>
                      </div>
                    </div>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Sign out of SurplusX"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
              {!isSidebarCollapsed ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavClick('landing')}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                  >
                    Sign In / Sign Up
                  </button>
                  <p className="text-[10px] text-center text-slate-500">
                    Guest access mode
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handleNavClick('landing')}
                  className="w-full flex justify-center py-2 text-emerald-600 hover:text-emerald-700 font-bold"
                  title="Sign In"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        )}
      </aside>
    </>
  );
};
