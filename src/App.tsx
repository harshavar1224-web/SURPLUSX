import React from 'react';
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
import { AdminDashboard } from './components/admin/AdminDashboard';
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
import { SurplusXLogo } from './components/SurplusXLogo';
import { Leaf, Menu } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentUser,
    activeView,
    canAccessView,
    isSidebarCollapsed,
    setIsMobileSidebarOpen,
  } = useApp();

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
    if (activeView === 'impact') return <RoleImpactView />;
    if (activeView === 'profile') return <ProfileView />;
    if (activeView === 'settings') return <SettingsView />;
    if (activeView === 'notifications') return <NotificationsView />;
    if (activeView === 'help') return <HelpSupportView />;
    if (activeView === 'live-tracking') return <LiveTrackingView />;
    if (activeView === 'browse' || activeView === 'explore' || activeView === 'explore-surplus')
      return <BrowseListings />;
    if (activeView === 'map' || activeView === 'live-map') return <InteractiveMapView />;

    // Role Specific Views
    if (currentUser.role === 'ADMIN') {
      return <AdminDashboard />;
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

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
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
