import React, { useState } from 'react';
import {
  LayoutDashboard,
  Leaf,
  Users,
  Store,
  HeartHandshake,
  ShoppingBag,
  Package,
  Gift,
  CalendarCheck,
  CreditCard,
  IndianRupee,
  Truck,
  Navigation,
  BarChart3,
  MessageSquare,
  FileCheck2,
  MapPin,
  ShieldAlert,
  History,
  Users2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  view: string;
  badgeKey?: 'orders' | 'messages' | 'donations' | 'deliveries' | 'verifications';
  superAdminOnly?: boolean;
}

interface NavSection {
  title: 'MAIN' | 'OPERATIONS' | 'COMMUNICATION' | 'SYSTEM' | 'ADMINISTRATION';
  items: NavItem[];
}

export const AdminSidebar: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    threads,
    orders,
    donations,
    activeDelivery,
    businesses,
    ngos,
  } = useApp();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Dynamic live badge values
  const unreadMessagesCount = threads ? threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) : 0;
  const activeOrdersCount = orders ? orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length : 0;
  const activeDonationsCount = donations ? donations.filter((d) => d.status === 'AVAILABLE' || d.status === 'MATCHED' || d.status === 'ACCEPTED').length : 0;
  const activeDeliveriesCount = activeDelivery ? 1 : 0;
  const pendingVerificationsCount =
    (businesses ? businesses.filter((b: any) => !b.isVerified).length : 0) +
    (ngos ? ngos.filter((n: any) => !n.isVerified).length : 0);

  const getBadgeValue = (badgeKey?: NavItem['badgeKey']) => {
    if (!badgeKey) return null;
    switch (badgeKey) {
      case 'orders':
        return activeOrdersCount > 0 ? activeOrdersCount : null;
      case 'donations':
        return activeDonationsCount > 0 ? activeDonationsCount : null;
      case 'deliveries':
        return activeDeliveriesCount > 0 ? activeDeliveriesCount : null;
      case 'messages':
        return unreadMessagesCount > 0 ? unreadMessagesCount : null;
      case 'verifications':
        return pendingVerificationsCount > 0 ? pendingVerificationsCount : null;
      default:
        return null;
    }
  };

  const navSections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { id: 'a-dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
        { id: 'a-impact', label: 'Impact', icon: Leaf, view: 'impact' },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'a-users', label: 'Users', icon: Users, view: 'users' },
        { id: 'a-businesses', label: 'Businesses', icon: Store, view: 'businesses' },
        { id: 'a-ngos', label: 'NGOs', icon: HeartHandshake, view: 'ngos' },
        { id: 'a-listings', label: 'Listings', icon: ShoppingBag, view: 'listings' },
        { id: 'a-orders', label: 'Orders', icon: Package, view: 'orders', badgeKey: 'orders' },
        { id: 'a-donations', label: 'Donations', icon: Gift, view: 'donations', badgeKey: 'donations' },
        { id: 'a-reservations', label: 'Reservations', icon: CalendarCheck, view: 'reservations' },
        { id: 'a-payments', label: 'Payments', icon: CreditCard, view: 'payments' },
        { id: 'a-settlements', label: 'Settlements', icon: IndianRupee, view: 'settlements' },
        { id: 'a-logistics', label: 'Live Logistics', icon: Truck, view: 'live-logistics', badgeKey: 'deliveries' },
        { id: 'a-live-map', label: 'Live Map', icon: Navigation, view: 'live-map' },
        { id: 'a-analytics', label: 'Analytics', icon: BarChart3, view: 'analytics' },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        { id: 'a-messages', label: 'Messages', icon: MessageSquare, view: 'messages', badgeKey: 'messages' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'a-verification', label: 'Verification', icon: FileCheck2, view: 'verification', badgeKey: 'verifications' },
        { id: 'a-location', label: 'Location & Radius Rules', icon: MapPin, view: 'location-settings' },
        { id: 'a-reports', label: 'Reports & Fraud', icon: ShieldAlert, view: 'reports' },
        { id: 'a-audit-logs', label: 'Audit Logs', icon: History, view: 'audit-logs' },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            title: 'ADMINISTRATION' as const,
            items: [
              {
                id: 'a-administrators',
                label: 'Administrators',
                icon: Users2,
                view: 'administrators',
                superAdminOnly: true,
              },
            ],
          },
        ]
      : []),
  ];

  const handleNavClick = (view: string) => {
    setActiveView(view);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const isViewActive = (view: string) => {
    if (view === 'dashboard') {
      return activeView === 'dashboard' || activeView === 'admin' || activeView === 'overview';
    }
    if (view === 'live-map') {
      return activeView === 'live-map' || activeView === 'map';
    }
    if (view === 'location-settings') {
      return activeView === 'location-settings' || activeView === 'location-radius';
    }
    if (view === 'reports') {
      return activeView === 'reports' || activeView === 'reports-fraud';
    }
    return activeView === view;
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Completely Stationary Desktop Sidebar & Mobile Drawer */}
      <aside
        id="admin-sidebar"
        className={`fixed lg:static top-0 left-0 h-full bg-white border-r border-slate-200/80 shadow-xs z-50 lg:z-10 transition-all duration-300 flex flex-col justify-between select-none shrink-0 overflow-hidden ${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isMobileSidebarOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header with Brand & Collapse Button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 h-16 bg-white">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <SurplusXLogo size="sm" showWordmark={!isSidebarCollapsed} />
          </div>

          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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

        {/* Dedicated Internal Scrollable Navigation Container */}
        <div
          id="admin-sidebar-nav-container"
          className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar min-h-0"
        >
          {/* Top Role Indicator */}
          {!isSidebarCollapsed && (
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60 mb-2 shrink-0">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Logged in role:</span>
                <span className="px-2 py-0.5 rounded-full font-bold border bg-purple-100/80 text-purple-800 border-purple-300/60">
                  {isSuperAdmin ? 'Platform Super Admin' : 'Platform Admin'}
                </span>
              </div>
            </div>
          )}

          {/* Categorized Navigation Sections */}
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isViewActive(item.view);
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
                          ? 'bg-purple-600 text-white shadow-xs font-bold'
                          : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
                      } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-500 group-hover:text-purple-600 group-hover:scale-110'
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
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {badgeVal}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Tooltip for Collapsed Sidebar */}
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
          ))}
        </div>
      </aside>
    </>
  );
};
