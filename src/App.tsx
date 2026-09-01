import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AppSidebar } from './components/navigation/AppSidebar';
import { PublicLanding } from './components/PublicLanding';
import { ConsumerDashboard } from './components/consumer/ConsumerDashboard';
import { BrowseListings } from './components/consumer/BrowseListings';
import { InteractiveMapView } from './components/consumer/InteractiveMapView';
import { ListingDetailModal } from './components/consumer/ListingDetailModal';
import { LiveTrackingView } from './components/consumer/LiveTrackingView';
import { MyOrdersView } from './components/consumer/MyOrdersView';
import { ReceiptsView } from './components/consumer/ReceiptsView';
import { SavedListingsView } from './components/consumer/SavedListingsView';
import { CartAndCheckoutModal } from './components/consumer/CartAndCheckoutModal';
import { ReceiptModal } from './components/consumer/ReceiptModal';
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { NgoDashboard } from './components/ngo/NgoDashboard';
import { RetailerDashboard } from './components/retailer/RetailerDashboard';
import { RiderDashboard } from './components/rider/RiderDashboard';
import { MessagesView } from './components/common/MessagesView';
import { RoleImpactView } from './components/common/RoleImpactView';
import { ProfileView } from './components/common/ProfileView';
import { SettingsView } from './components/common/SettingsView';
import { NotificationsView } from './components/common/NotificationsView';
import { HelpSupportView } from './components/common/HelpSupportView';
import { AuthModal } from './components/auth/AuthModal';
import { AuthRequired } from './components/auth/AuthRequired';
import { AccessDenied } from './components/auth/AccessDenied';
import { LocationSelectModal } from './components/location/LocationSelectModal';
import { Leaf } from 'lucide-react';
import { isAdminRole } from './types';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminImpactView } from './components/admin/AdminImpactView';
import { AdminUsersView } from './components/admin/AdminUsersView';
import { AdminBusinessesView } from './components/admin/AdminBusinessesView';
import { AdminNgosView } from './components/admin/AdminNgosView';
import { AdminListingsView } from './components/admin/AdminListingsView';
import { AdminOrdersView } from './components/admin/AdminOrdersView';
import { AdminDonationsView } from './components/admin/AdminDonationsView';
import { AdminReservationsView } from './components/admin/AdminReservationsView';
import { AdminPaymentsView } from './components/admin/AdminPaymentsView';
import { AdminSettlementsView } from './components/admin/AdminSettlementsView';
import { AdminLiveLogisticsView } from './components/admin/AdminLiveLogisticsView';
import { AdminLiveMapView } from './components/admin/AdminLiveMapView';
import { AdminAnalyticsView } from './components/admin/AdminAnalyticsView';
import { AdminVerificationView } from './components/admin/AdminVerificationView';
import { AdminReportsFraudView } from './components/admin/AdminReportsFraudView';
import { AdminAuditLogsView } from './components/admin/AdminAuditLogsView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import { AdminAdministratorsView } from './components/admin/AdminAdministratorsView';
import { LocationSettingsTab } from './components/admin/LocationSettingsTab';

const ADMIN_ROUTE_MAP: Record<string, string> = {
  '/admin': 'dashboard',
  '/admin/': 'dashboard',
  '/admin/dashboard': 'dashboard',
  '/admin/impact': 'impact',
  '/admin/users': 'users',
  '/admin/businesses': 'businesses',
  '/admin/ngos': 'ngos',
  '/admin/listings': 'listings',
  '/admin/orders': 'orders',
  '/admin/donations': 'donations',
  '/admin/reservations': 'reservations',
  '/admin/payments': 'payments',
  '/admin/settlements': 'settlements',
  '/admin/live-logistics': 'live-logistics',
  '/admin/live-map': 'live-map',
  '/admin/map': 'live-map',
  '/admin/analytics': 'analytics',
  '/admin/messages': 'messages',
  '/admin/verification': 'verification',
  '/admin/location-radius': 'location-settings',
  '/admin/location-settings': 'location-settings',
  '/admin/reports-fraud': 'reports',
  '/admin/reports': 'reports',
  '/admin/audit-logs': 'audit-logs',
  '/admin/administrators': 'administrators',
  '/admin/profile': 'profile',
  '/admin/settings': 'system-settings',
  '/admin/system-settings': 'system-settings',
  '/admin/notifications': 'notifications',
};

const VIEW_TO_ADMIN_ROUTE: Record<string, string> = {
  dashboard: '/admin',
  admin: '/admin',
  overview: '/admin',
  impact: '/admin/impact',
  users: '/admin/users',
  businesses: '/admin/businesses',
  ngos: '/admin/ngos',
  listings: '/admin/listings',
  orders: '/admin/orders',
  donations: '/admin/donations',
  reservations: '/admin/reservations',
  payments: '/admin/payments',
  settlements: '/admin/settlements',
  'live-logistics': '/admin/live-logistics',
  'live-map': '/admin/live-map',
  map: '/admin/live-map',
  analytics: '/admin/analytics',
  messages: '/admin/messages',
  verification: '/admin/verification',
  'location-settings': '/admin/location-radius',
  'location-radius': '/admin/location-radius',
  reports: '/admin/reports-fraud',
  'reports-fraud': '/admin/reports-fraud',
  'audit-logs': '/admin/audit-logs',
  administrators: '/admin/administrators',
  profile: '/admin/profile',
  'system-settings': '/admin/system-settings',
  settings: '/admin/system-settings',
  notifications: '/admin/notifications',
};

const MainContent: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    canAccessView,
    previewRole,
  } = useApp();

  // Bidirectional URL route sync for Admin and deep-linked paths
  useEffect(() => {
    const handleLocationSync = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      if (pathname.startsWith('/admin')) {
        const matchedView = ADMIN_ROUTE_MAP[pathname] || 'dashboard';
        if (matchedView !== activeView) {
          setActiveView(matchedView);
        }
      }
    };

    handleLocationSync();
    window.addEventListener('popstate', handleLocationSync);
    return () => window.removeEventListener('popstate', handleLocationSync);
  }, []);

  // Sync window URL when activeView changes in Admin mode
  useEffect(() => {
    if (currentUser && isAdminRole(currentUser.role)) {
      const targetRoute = VIEW_TO_ADMIN_ROUTE[activeView];
      if (targetRoute && window.location.pathname !== targetRoute) {
        window.history.pushState(null, '', targetRoute);
      }
    }
  }, [activeView, currentUser]);

  // 1. Render Public Landing View (No Sidebar)
  if (
    activeView === 'landing' ||
    activeView === 'public-landing' ||
    activeView === 'how-it-works' ||
    activeView === 'about'
  ) {
    return (
      <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <PublicLanding />
        </main>
        {/* Global Modals */}
        <AuthModal />
        <LocationSelectModal />
        <ListingDetailModal />
        <CartAndCheckoutModal />
        <ReceiptModal />
      </div>
    );
  }

  // 2. Unauthenticated User Gate for Protected Views
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1 py-10">
          <AuthRequired targetView={activeView} />
        </main>
        <AuthModal />
        <LocationSelectModal />
        <ListingDetailModal />
        <CartAndCheckoutModal />
        <ReceiptModal />
      </div>
    );
  }

  // 3. Role Access Enforcement Guard
  if (!canAccessView(activeView)) {
    return (
      <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <div className="flex-1 flex">
          <AppSidebar />
          <main className="flex-1 p-6 md:p-8">
            <AccessDenied attemptedView={activeView} />
          </main>
        </div>
        <AuthModal />
        <LocationSelectModal />
        <ListingDetailModal />
        <CartAndCheckoutModal />
        <ReceiptModal />
      </div>
    );
  }

  // 4. Authenticated View Resolution
  const renderCurrentView = () => {
    // Universal Common Views across roles
    if (activeView === 'messages') return <MessagesView />;
    if (activeView === 'impact' && !isAdminRole(currentUser.role)) return <RoleImpactView />;
    if (activeView === 'profile') return <ProfileView />;
    if (activeView === 'settings') return <SettingsView />;
    if (activeView === 'notifications') return <NotificationsView />;
    if (activeView === 'help') return <HelpSupportView />;
    if (activeView === 'live-tracking') return <LiveTrackingView />;
    if (activeView === 'browse' || activeView === 'explore' || activeView === 'explore-surplus')
      return <BrowseListings />;
    if (activeView === 'map' || activeView === 'live-map') return <InteractiveMapView />;

    // Role Specific Views: ADMIN & SUPER_ADMIN
    if (isAdminRole(currentUser.role)) {
      if (previewRole) {
        if (previewRole === 'CONSUMER') {
          if (activeView === 'orders') return <MyOrdersView />;
          if (activeView === 'receipts') return <ReceiptsView />;
          if (activeView === 'saved') return <SavedListingsView />;
          return <ConsumerDashboard />;
        }
        if (previewRole === 'BUSINESS') return <BusinessDashboard />;
        if (previewRole === 'NGO') return <NgoDashboard />;
        return <AdminOverview />;
      }

      switch (activeView) {
        case 'dashboard':
        case 'admin':
        case 'overview':
          return <AdminOverview />;
        case 'impact':
          return <AdminImpactView />;
        case 'users':
          return <AdminUsersView />;
        case 'businesses':
          return <AdminBusinessesView />;
        case 'ngos':
          return <AdminNgosView />;
        case 'listings':
          return <AdminListingsView />;
        case 'orders':
          return <AdminOrdersView />;
        case 'donations':
          return <AdminDonationsView />;
        case 'reservations':
          return <AdminReservationsView />;
        case 'payments':
          return <AdminPaymentsView />;
        case 'settlements':
          return <AdminSettlementsView />;
        case 'live-logistics':
          return <AdminLiveLogisticsView />;
        case 'live-map':
        case 'map':
          return <AdminLiveMapView />;
        case 'analytics':
          return <AdminAnalyticsView />;
        case 'verification':
          return <AdminVerificationView />;
        case 'location-settings':
        case 'location-radius':
          return <LocationSettingsTab />;
        case 'reports':
        case 'reports-fraud':
          return <AdminReportsFraudView />;
        case 'audit-logs':
          return <AdminAuditLogsView />;
        case 'system-settings':
          return <AdminSettingsView />;
        case 'administrators':
          return <AdminAdministratorsView />;
        case 'messages':
          return <MessagesView />;
        case 'profile':
          return <ProfileView />;
        case 'notifications':
          return <NotificationsView />;
        default:
          return <AdminOverview />;
      }
    }

    if (currentUser.role === 'BUSINESS') {
      return <BusinessDashboard />;
    }

    if (currentUser.role === 'NGO') {
      return <NgoDashboard />;
    }

    if (currentUser.role === 'RETAILER') {
      return <RetailerDashboard />;
    }

    if (currentUser.role === 'RIDER') {
      return <RiderDashboard />;
    }

    // Default CONSUMER Role Views
    switch (activeView) {
      case 'orders':
      case 'my-orders':
      case 'reservations':
        return <MyOrdersView />;
      case 'receipts':
      case 'receipt':
        return <ReceiptsView />;
      case 'saved-listings':
      case 'saved':
        return <SavedListingsView />;
      case 'donations':
      case 'dashboard':
      default:
        return <ConsumerDashboard />;
    }
  };

  // If user is Admin/Super Admin, render dedicated stationary AdminLayout
  if (isAdminRole(currentUser.role)) {
    return (
      <AdminLayout>
        {renderCurrentView()}

        {/* Global Modals */}
        <AuthModal />
        <LocationSelectModal />
        <ListingDetailModal />
        <CartAndCheckoutModal />
        <ReceiptModal />
      </AdminLayout>
    );
  }

  // Non-Admin User Layout (Consumer, Merchant, NGO, Rider, Retailer)
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col antialiased selection:bg-purple-500 selection:text-white">
      <Navbar />

      <div className="flex-1 flex flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 items-start">
        {/* Authoritative Role-Aware AppSidebar */}
        <AppSidebar />

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 pb-16">{renderCurrentView()}</main>
      </div>

      {/* Global Modals */}
      <AuthModal />
      <LocationSelectModal />
      <ListingDetailModal />
      <CartAndCheckoutModal />
      <ReceiptModal />

      {/* App Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>SurplusX Zero-Waste Operating System • ISO 14001 Food Rescue Governance</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Verified 80G Tax Compliant</span>
            <span>•</span>
            <span>FSSAI Hygiene Standards</span>
            <span>•</span>
            <span>1-Device Hardware Trust</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
