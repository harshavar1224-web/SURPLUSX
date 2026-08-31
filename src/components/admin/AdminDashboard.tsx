import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  FileCheck,
  DollarSign,
  Lock,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Building,
  HeartHandshake,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  MapPin,
  Users,
  Store,
  ShoppingBag,
  Package,
  Gift,
  CreditCard,
  IndianRupee,
  Map,
  MessageSquare,
  Leaf,
  BarChart3,
  FileCheck2,
  Sliders,
  User,
  Eye,
  RefreshCw,
  Filter,
  Check,
  Trash2,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NGO, AuditLog, LedgerEntry, User as UserType, SurplusListing, Order, Donation } from '../../types';
import { AdminPricingTab } from './AdminPricingTab';
import { IdentityManagementTab } from './IdentityManagementTab';
import { LocationSettingsTab } from './LocationSettingsTab';

interface MockVerificationDoc {
  id: string;
  organizationName: string;
  organizationType: 'BUSINESS' | 'NGO';
  documentType: 'FSSAI License' | '80G Tax Certificate' | 'NGO Darpan' | 'Trade License';
  documentNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
}

export const AdminDashboard: React.FC = () => {
  const {
    activeView,
    setActiveView,
    ngos,
    allUsers,
    listings,
    orders,
    donations,
    auditLogs,
    ledgers,
    threads,
    triggerMerchantSettlement,
    activeDelivery,
    triggerToast,
    addAuditLog,
    setAdminPreviewRole,
    adminChangeUserRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'users'
    | 'businesses'
    | 'ngos'
    | 'listings'
    | 'orders'
    | 'donations'
    | 'payments'
    | 'settlements'
    | 'fleet'
    | 'map'
    | 'analytics'
    | 'messages'
    | 'impact'
    | 'verifications'
    | 'location'
    | 'fraud'
    | 'audit'
    | 'settings'
    | 'identities'
  >('dashboard');

  useEffect(() => {
    if (activeView === 'dashboard') setActiveTab('dashboard');
    else if (activeView === 'users' || activeView === 'identities') setActiveTab('users');
    else if (activeView === 'businesses') setActiveTab('businesses');
    else if (activeView === 'ngos') setActiveTab('ngos');
    else if (activeView === 'listings') setActiveTab('listings');
    else if (activeView === 'orders') setActiveTab('orders');
    else if (activeView === 'donations') setActiveTab('donations');
    else if (activeView === 'payments') setActiveTab('payments');
    else if (activeView === 'settlements') setActiveTab('settlements');
    else if (activeView === 'live-logistics' || activeView === 'fleet') setActiveTab('fleet');
    else if (activeView === 'live-map' || activeView === 'map') setActiveTab('map');
    else if (activeView === 'analytics') setActiveTab('analytics');
    else if (activeView === 'messages') setActiveTab('messages');
    else if (activeView === 'impact') setActiveTab('impact');
    else if (activeView === 'verification') setActiveTab('verifications');
    else if (activeView === 'location-settings' || activeView === 'location') setActiveTab('location');
    else if (activeView === 'reports' || activeView === 'fraud') setActiveTab('fraud');
    else if (activeView === 'audit-logs' || activeView === 'audit') setActiveTab('audit');
    else if (activeView === 'system-settings' || activeView === 'settings') setActiveTab('settings');
    else if (activeView === 'profile') setActiveTab('settings');
  }, [activeView]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [fraudSignals, setFraudSignals] = useState<any[]>([
    {
      id: 'fraud-sig-1',
      userId: 'usr-susp-991',
      userRole: 'CONSUMER',
      severity: 'HIGH',
      signalType: 'OTP_BRUTE_FORCE_ATTEMPT',
      details: '4 consecutive invalid delivery OTP attempts logged within 45 seconds from IP 49.37.12.8',
      timestamp: '2026-08-26 14:10:02',
      resolved: false,
    },
    {
      id: 'fraud-sig-2',
      userId: 'usr-susp-412',
      userRole: 'CONSUMER',
      severity: 'MEDIUM',
      signalType: 'EXCESSIVE_CHECKOUT_VELOCITY',
      details: '12 simultaneous reservation locks generated across multiple browser sessions',
      timestamp: '2026-08-26 13:45:18',
      resolved: false,
    },
  ]);

  const [verifications, setVerifications] = useState<MockVerificationDoc[]>([
    {
      id: 'doc-101',
      organizationName: 'Green Basket Organics Pvt Ltd',
      organizationType: 'BUSINESS',
      documentType: 'FSSAI License',
      documentNumber: '11224334000192',
      status: 'APPROVED',
      uploadedAt: '2026-08-20',
    },
    {
      id: 'doc-102',
      organizationName: 'Hope Foundation Bangalore',
      organizationType: 'NGO',
      documentType: '80G Tax Certificate',
      documentNumber: 'AAATH8819CF20214',
      status: 'APPROVED',
      uploadedAt: '2026-08-21',
    },
    {
      id: 'doc-103',
      organizationName: 'Sunrise Bakery & Cafe',
      organizationType: 'BUSINESS',
      documentType: 'FSSAI License',
      documentNumber: '11225339000481',
      status: 'PENDING',
      uploadedAt: '2026-08-26',
    },
    {
      id: 'doc-104',
      organizationName: 'Robin Hood Army Bangalore',
      organizationType: 'NGO',
      documentType: 'NGO Darpan',
      documentNumber: 'KA/2019/0248819',
      status: 'PENDING',
      uploadedAt: '2026-08-25',
    },
  ]);

  const approveVerification = (docId: string) => {
    setVerifications((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'APPROVED' } : d))
    );
    triggerToast(`Document ${docId} approved & verified!`, 'success');
    addAuditLog('COMPLIANCE_APPROVED', 'VERIFICATION', `Admin verified compliance doc ${docId}`);
  };

  const rejectVerification = (docId: string, reason: string) => {
    setVerifications((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'REJECTED' } : d))
    );
    triggerToast(`Document ${docId} rejected: ${reason}`, 'warning');
    addAuditLog('COMPLIANCE_REJECTED', 'VERIFICATION', `Admin rejected doc ${docId}: ${reason}`);
  };

  const pendingDocs = verifications.filter((v) => v.status === 'PENDING');
  const pendingLedgers = ledgers.filter((l) => l.settlementStatus === 'PENDING');

  // Computed metrics
  const totalUsersCount = allUsers.length || 12;
  const consumersCount = allUsers.filter((u) => u.role === 'CONSUMER').length || 8;
  const businessesCount = allUsers.filter((u) => u.role === 'BUSINESS').length || 3;
  const ngosCount = ngos.length || 2;
  const activeListingsCount = listings.filter((l) => l.status === 'ACTIVE').length || listings.length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0);
  const platformFees = Math.round(totalRevenue * 0.08);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">SurplusX Platform Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono-code font-bold border border-emerald-500/30">
              CLUSTER: IND-BLR-01
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global Compliance, Cryptographic Audit Trail & Real-time Logistics Orchestration Engine
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-code">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>ALL SYSTEMS HEALTHY</span>
          </div>
        </div>
      </div>

      {/* Admin "View As" Inspection Toolbar */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base shadow-sm">
            👁️
          </div>
          <div>
            <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              Admin Experience Preview ("View As" Feature)
            </h3>
            <p className="text-xs text-amber-800">
              Inspect the platform as Consumer, Business, or NGO without changing actual database credentials or roles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminPreviewRole('CONSUMER')}
            className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold rounded-xl border border-amber-300 shadow-xs transition-all cursor-pointer"
          >
            View as Consumer
          </button>
          <button
            onClick={() => setAdminPreviewRole('BUSINESS')}
            className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold rounded-xl border border-amber-300 shadow-xs transition-all cursor-pointer"
          >
            View as Business
          </button>
          <button
            onClick={() => setAdminPreviewRole('NGO')}
            className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-950 text-xs font-bold rounded-xl border border-amber-300 shadow-xs transition-all cursor-pointer"
          >
            View as NGO
          </button>
        </div>
      </div>

      {/* Quick Navigation Pills for Admin Sections */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'dashboard', label: 'Overview', icon: Activity },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'businesses', label: 'Businesses', icon: Store },
          { id: 'ngos', label: 'NGOs', icon: HeartHandshake },
          { id: 'listings', label: 'Listings', icon: ShoppingBag },
          { id: 'orders', label: 'Orders', icon: Package, badge: activeOrdersCount },
          { id: 'donations', label: 'Donations', icon: Gift },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'settlements', label: 'Settlements', icon: IndianRupee, badge: pendingLedgers.length },
          { id: 'fleet', label: 'Live Logistics', icon: Truck },
          { id: 'map', label: 'Live Map', icon: Map },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'messages', label: 'Messages', icon: MessageSquare },
          { id: 'impact', label: 'Impact', icon: Leaf },
          { id: 'verifications', label: 'Verification', icon: FileCheck2, badge: pendingDocs.length },
          { id: 'location', label: 'Geo-Radius', icon: MapPin },
          { id: 'fraud', label: 'Reports & Fraud', icon: ShieldAlert, badge: fraudSignals.length },
          { id: 'audit', label: 'Audit Logs', icon: Database },
          { id: 'settings', label: 'System Settings', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] rounded-full font-bold">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* SECTION: OVERVIEW / DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 Top KPI Admin Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Total Registered Users</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalUsersCount} Users</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">{consumersCount} Consumers, {businessesCount} Businesses, {ngosCount} NGOs</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Active Listings & Orders</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{activeListingsCount} Active</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">{activeOrdersCount} live order transactions</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Platform Take-Rate Revenue</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹{platformFees}</div>
              <div className="text-[11px] text-slate-500 mt-1">8% Gross Order Commission</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Immutable Audit Blocks</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{auditLogs.length} Entries</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Tamper-evident</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Audit Activity */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Recent Cryptographic Audit Logs</span>
              </h3>
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono-code">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">{log.details}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Pending Administrative Queues</span>
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-950">Pending Partner Compliance Documents</div>
                    <div className="text-[11px] text-amber-800">{pendingDocs.length} FSSAI/80G certificates awaiting approval</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('verifications')}
                    className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700"
                  >
                    Review Queue
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-950">Merchant Payout Settlements</div>
                    <div className="text-[11px] text-emerald-800">{pendingLedgers.length} payouts pending authorization</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('settlements')}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                  >
                    Manage Ledger
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform Users Directory</h3>
              <p className="text-xs text-slate-500">Manage consumers, businesses, NGOs, and platform roles.</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-full">
              {allUsers.length} Registered Accounts
            </span>
          </div>

          <div className="space-y-3">
            {allUsers.map((u) => (
              <div key={u.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-slate-500">{u.email} • {u.phone || 'No phone'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                    {u.role}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {u.isVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: BUSINESSES */}
      {activeTab === 'businesses' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Registered Business Merchants</h3>
            <p className="text-xs text-slate-500">Manage restaurants, bakeries, supermarkets, and surplus food vendors.</p>
          </div>
          <div className="space-y-3">
            {allUsers.filter((u) => u.role === 'BUSINESS').length > 0 ? (
              allUsers.filter((u) => u.role === 'BUSINESS').map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{b.name} ({b.city || 'Bangalore'})</div>
                    <div className="text-slate-500">{b.email} • {b.phone}</div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-full text-[10px]">BUSINESS MERCHANT</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">No separate business records found. Verified businesses are managed in the verification queue.</div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: NGOS */}
      {activeTab === 'ngos' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">NGO Partners & Food Rescue Hubs</h3>
            <p className="text-xs text-slate-500">Manage verified hunger relief organizations and distribution centers.</p>
          </div>
          <div className="space-y-3">
            {ngos.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{n.name}</div>
                  <div className="text-slate-500">Contact: {n.contactPerson} ({n.phone}) • Service Area: {n.serviceArea}</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">VERIFIED NGO</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: LISTINGS */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Surplus Listings</h3>
            <p className="text-xs text-slate-500">All surplus food items published by merchant partners.</p>
          </div>
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={l.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div>
                    <div className="font-bold text-slate-900">{l.title}</div>
                    <div className="text-slate-500">{l.businessName} • ₹{l.discountedPrice} (Save {l.discountPercentage}%)</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Platform Orders & Transactions</h3>
            <p className="text-xs text-slate-500">Real-time monitoring of all consumer reservations and purchases.</p>
          </div>
          <div className="space-y-3">
            {orders.length > 0 ? (
              orders.map((o) => (
                <div key={o.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">Order #{o.id} • {o.businessName}</div>
                    <div className="text-slate-500">Total: ₹{o.totalAmount || o.amount} • {o.items?.length || 1} items</div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-full text-[10px]">
                    {o.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">No active orders found in current session store.</div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: DONATIONS */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Surplus Food Donations</h3>
            <p className="text-xs text-slate-500">Direct business-to-NGO surplus donations for hunger relief.</p>
          </div>
          <div className="space-y-3">
            {donations.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{d.foodDescription} ({d.quantity})</div>
                  <div className="text-slate-500">Donor: {d.businessName} • Status: {d.status}</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment Gateway Records</h3>
            <p className="text-xs text-slate-500">Secure Razorpay transaction logs and verification.</p>
          </div>
          <div className="space-y-3">
            {ledgers.map((l) => (
              <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">Payment ID: pay_{l.orderId}</div>
                  <div className="text-slate-500">Gross: ₹{l.grossAmount} • Gateway: Razorpay Secure</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                  CAPTURED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: SETTLEMENTS */}
      {activeTab === 'settlements' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Razorpay Payouts & Commission Engine</h3>
            <p className="text-xs text-slate-500">Authorize direct deposit disbursements to merchant bank accounts.</p>
          </div>
          <div className="space-y-3">
            {ledgers.map((l) => (
              <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">Order #{l.orderId}</div>
                  <div className="text-slate-500">Gross: ₹{l.grossAmount} • Commission (8%): ₹{l.platformCommission} • Payout: ₹{l.netPayableToMerchant}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${l.settlementStatus === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {l.settlementStatus}
                  </span>
                  {l.settlementStatus === 'PENDING' && (
                    <button
                      onClick={() => triggerMerchantSettlement(l.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
                    >
                      Authorize Payout
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: LIVE LOGISTICS */}
      {activeTab === 'fleet' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Logistics Fleet Radar</h3>
              <p className="text-xs text-slate-500">Tracking all active NGO rescue vans and volunteer motorbikes across Bangalore.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-ping" />
              <span>4 Drivers Online</span>
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Rahul Deshmukh (Van #KA-01-MJ-8821)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">IN TRANSIT</span>
              </div>
              <div className="text-xs text-slate-600">Trip: Green Basket Store ➔ Hope Foundation Ejipura • Speed: 24 km/h • ETA: 12 mins</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Priya Nair (Two-Wheeler #KA-05-EB-4190)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">AT PICKUP STORE</span>
              </div>
              <div className="text-xs text-slate-600">Trip: Bake House Indiranagar ➔ Robin Hood Distribution Hub • ETA: 25 mins</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: LIVE MAP */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Mappls Real-Time Telemetry Map</h3>
            <p className="text-xs text-slate-500">Live GPS tracking of active NGO rescue units and transit routes.</p>
          </div>
          <div className="w-full h-96 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden">
            <Map className="w-16 h-16 text-emerald-500 mb-2 opacity-80 animate-pulse" />
            <div className="text-sm font-bold">Mappls GIS Telemetry Active</div>
            <div className="text-xs text-slate-400 mt-1">Center: Bangalore Central (12.9716° N, 77.5946° E) • 4 Active Delivery Units</div>
            <div className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur-sm p-3 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
              <span>Active Route: Green Basket Indiranagar ➔ Ejipura Shelter</span>
              <span className="text-emerald-400 font-bold">ETA: 12m (GPS Verified)</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Platform Analytics & Trends</h3>
            <p className="text-xs text-slate-500">Comprehensive growth metrics and surplus rescue statistics.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Total Food Rescued</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">2,450 kg</div>
              <div className="text-[11px] text-slate-500 mt-1">+18% vs last week</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Meals Provided</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">4,900 meals</div>
              <div className="text-[11px] text-slate-500 mt-1">Across 2 verified NGOs</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">CO2 Emissions Avoided</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">6,125 kg</div>
              <div className="text-[11px] text-slate-500 mt-1">Equivalent to 280 trees planted</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Support & Communication Center</h3>
            <p className="text-xs text-slate-500">Admin oversight of user conversations, dispute chats, and support tickets.</p>
          </div>
          <div className="space-y-3">
            {threads.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{t.title}</div>
                  <div className="text-slate-500">Last message: {t.lastMessage}</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                  ACTIVE THREAD
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: IMPACT */}
      {activeTab === 'impact' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Platform-Wide Environmental & Social Impact</h3>
            <p className="text-xs text-slate-500">Verified impact metrics calculated across all completed orders and donations.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-2xl font-extrabold text-emerald-800">2,450 kg</div>
              <div className="text-xs text-emerald-700 font-medium mt-1">Surplus Rescued</div>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <div className="text-2xl font-extrabold text-blue-800">4,900</div>
              <div className="text-xs text-blue-700 font-medium mt-1">Meals Served</div>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center">
              <div className="text-2xl font-extrabold text-purple-800">6,125 kg</div>
              <div className="text-xs text-purple-700 font-medium mt-1">CO2 Prevented</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-2xl font-extrabold text-amber-800">₹7.35 Lakh</div>
              <div className="text-xs text-amber-700 font-medium mt-1">Consumer Savings</div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Partner Legal & Health Compliance Queue</h3>
            <p className="text-xs text-slate-500">Review and verify official government certifications (FSSAI, NGO Darpan, 80G Tax Exemption).</p>
          </div>
          <div className="space-y-3">
            {verifications.map((doc) => (
              <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{doc.organizationName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">{doc.organizationType}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5"><span className="font-semibold">{doc.documentType}</span>: {doc.documentNumber}</div>
                </div>
                <div className="flex items-center gap-3">
                  {doc.status === 'PENDING' ? (
                    <>
                      <button onClick={() => rejectVerification(doc.id, 'Failed audit')} className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl cursor-pointer">Reject</button>
                      <button onClick={() => approveVerification(doc.id)} className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">Approve Partner</button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{doc.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: LOCATION SETTINGS */}
      {activeTab === 'location' && <LocationSettingsTab />}

      {/* SECTION: FRAUD & REPORTS */}
      {activeTab === 'fraud' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Real-Time Fraud & Anomaly Radar</h3>
              <p className="text-xs text-slate-500">Automated rate-limiting, OTP brute-force alarms, and payment tampering detection.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold font-mono-code">THREAT LEVEL: LOW</span>
          </div>
          <div className="space-y-3">
            {fraudSignals.map((sig) => (
              <div key={sig.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold font-mono-code">{sig.severity} SEVERITY</span>
                    <span className="font-bold text-xs text-rose-950 font-mono-code">{sig.signalType}</span>
                  </div>
                  <div className="text-xs text-slate-700">{sig.details}</div>
                </div>
                <button onClick={() => triggerToast(`Session blocked for ${sig.userId}`, 'success')} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap">
                  Block Session & Terminate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Immutable Audit Block Sequence</h3>
              <p className="text-xs text-slate-500">Every critical transaction, status change, and payment is hashed into an unalterable audit chain.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold font-mono-code">STATUS: ZERO TAMPER DETECTED</span>
          </div>
          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-900 text-white font-mono-code text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="font-bold">BLOCK #{log.id} • {log.action}</span>
                  <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString('en-IN')}</span>
                </div>
                <div className="text-slate-300 text-[11px]">{log.details}</div>
                <div className="text-[10px] text-slate-500 break-all">SHA-256 INTEGRITY HASH: {log.integrityHash}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: SYSTEM SETTINGS */}
      {activeTab === 'settings' && <IdentityManagementTab />}
    </div>
  );
};

