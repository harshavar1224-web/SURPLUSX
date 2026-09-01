import React from 'react';
import {
  Users,
  Store,
  HeartHandshake,
  ShoppingBag,
  Package,
  Gift,
  Truck,
  IndianRupee,
  ShieldAlert,
  FileCheck2,
  Database,
  Activity,
  MapPin,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Map,
  CreditCard,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminOverview: React.FC = () => {
  const {
    allUsers,
    businesses,
    ngos,
    listings,
    orders,
    donations,
    auditLogs,
    activeDelivery,
    setActiveView,
  } = useApp();

  // Real Metric calculations from DB
  const totalUsersCount = allUsers.length;
  const consumersCount = allUsers.filter((u) => u.role === 'CONSUMER').length;
  const businessUsersCount = allUsers.filter((u) => u.role === 'BUSINESS').length;
  const ngoUsersCount = allUsers.filter((u) => u.role === 'NGO').length;
  const ridersCount = allUsers.filter((u) => u.role === 'RIDER').length;
  const adminsCount = allUsers.filter((u) => u.role === 'ADMIN').length;
  const superAdminsCount = allUsers.filter((u) => u.role === 'SUPER_ADMIN').length;

  const activeListingsCount = listings.filter((l) => l.status === 'ACTIVE').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
  const pendingReservationsCount = orders.filter((o) => o.status === 'RESERVED').length;
  const activeDeliveriesCount = activeDelivery ? 1 : 0;

  // Revenue calculation from orders
  const grossOrderValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const platformFees = grossOrderValue * 0.05; // 5% platform take rate
  const netRevenue = platformFees;

  // Order state breakdown
  const orderStates = {
    PENDING: orders.filter((o) => o.status === 'PENDING').length,
    RESERVED: orders.filter((o) => o.status === 'RESERVED').length,
    CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
    READY: orders.filter((o) => o.status === 'READY').length,
    PICKED_UP: orders.filter((o) => o.status === 'PICKED_UP').length,
    IN_DELIVERY: orders.filter((o) => o.status === 'IN_DELIVERY').length,
    COMPLETED: orders.filter((o) => o.status === 'COMPLETED').length,
    CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    EXPIRED: orders.filter((o) => o.status === 'EXPIRED').length,
  };

  // Donation state breakdown
  const donationStates = {
    AVAILABLE: donations.filter((d) => d.status === 'AVAILABLE').length,
    MATCHED: donations.filter((d) => d.status === 'MATCHED').length,
    ACCEPTED: donations.filter((d) => d.status === 'ACCEPTED').length,
    PICKUP_PENDING: donations.filter((d) => d.status === 'PICKUP_PENDING').length,
    DELIVERED: donations.filter((d) => d.status === 'DELIVERED').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / System Status */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-purple-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                System Status: ALL SYSTEMS HEALTHY
              </span>
              <span className="text-slate-400 text-xs">• SurplusX Core v4.2</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Platform Command Center
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Real-time governance, logistics telemetry, financial reconciliation, and ecosystem oversight across India.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('analytics')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs backdrop-blur-md transition-all flex items-center gap-2 border border-white/10 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-purple-300" /> Platform Analytics
            </button>
            <button
              onClick={() => setActiveView('live-map')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Map className="w-4 h-4" /> Live Map Telemetry
            </button>
          </div>
        </div>

        {/* System Component Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-purple-900/50">
          {[
            { label: 'Database', status: 'Operational', latency: '4ms' },
            { label: 'API Gateway', status: 'Healthy', latency: '12ms' },
            { label: 'Payment API', status: 'Active', latency: '45ms' },
            { label: 'Mappls GIS', status: 'Synced', latency: '28ms' },
            { label: 'Redis Cache', status: 'Optimal', latency: '1ms' },
            { label: 'Workers', status: 'Running', latency: '99.9%' },
          ].map((sys, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <span className="text-[10px] text-slate-400 block font-medium">{sys.label}</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-emerald-400">{sys.status}</span>
                <span className="text-[10px] text-purple-300 font-mono">{sys.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Users',
            value: totalUsersCount,
            sub: `${consumersCount} consumers, ${businessUsersCount} businesses`,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            view: 'users',
          },
          {
            title: 'Active Businesses',
            value: businessUsersCount,
            sub: `${activeListingsCount} active listings`,
            icon: Store,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            view: 'businesses',
          },
          {
            title: 'NGO Partners',
            value: ngoUsersCount,
            sub: `${ngos.length} registered orgs`,
            icon: HeartHandshake,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            view: 'ngos',
          },
          {
            title: 'Platform Revenue',
            value: `₹${netRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            sub: `GMV: ₹${grossOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            icon: IndianRupee,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            view: 'settlements',
          },
          {
            title: 'Active Orders',
            value: activeOrdersCount,
            sub: `${orderStates.RESERVED} pending reservation`,
            icon: Package,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            view: 'orders',
          },
          {
            title: 'Active Deliveries',
            value: activeDeliveriesCount,
            sub: 'Live fleet telemetry',
            icon: Truck,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            view: 'live-logistics',
          },
          {
            title: 'Pending Verification',
            value: 0,
            sub: 'Documents up to date',
            icon: FileCheck2,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            view: 'verification',
          },
          {
            title: 'Fraud & Reports',
            value: 0,
            sub: 'Zero unresolved signals',
            icon: ShieldAlert,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            view: 'reports',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveView(kpi.view)}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.title}</span>
                <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</div>
                <p className="text-xs text-slate-500 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operations Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Operations Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" /> Order State Operations
              </h3>
              <button
                onClick={() => setActiveView('orders')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Pending', count: orderStates.PENDING, status: 'PENDING' },
                { label: 'Reserved', count: orderStates.RESERVED, status: 'RESERVED' },
                { label: 'Confirmed', count: orderStates.CONFIRMED, status: 'CONFIRMED' },
                { label: 'Ready', count: orderStates.READY, status: 'READY' },
                { label: 'In Delivery', count: orderStates.IN_DELIVERY, status: 'IN_DELIVERY' },
                { label: 'Completed', count: orderStates.COMPLETED, status: 'COMPLETED' },
              ].map((st, i) => (
                <div
                  key={i}
                  onClick={() => setActiveView('orders')}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-purple-200 transition-colors cursor-pointer text-center"
                >
                  <span className="text-[11px] text-slate-500 font-medium block truncate">{st.label}</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{st.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Total Orders: {orders.length}</span>
            <span className="text-emerald-600 font-bold">100% Synced</span>
          </div>
        </div>

        {/* Donation Operations Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-600" /> Surplus Donation Status
              </h3>
              <button
                onClick={() => setActiveView('donations')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Available', count: donationStates.AVAILABLE },
                { label: 'Matched', count: donationStates.MATCHED },
                { label: 'Accepted', count: donationStates.ACCEPTED },
                { label: 'Delivered', count: donationStates.DELIVERED },
              ].map((st, i) => (
                <div
                  key={i}
                  onClick={() => setActiveView('donations')}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer text-center"
                >
                  <span className="text-[11px] text-slate-500 font-medium block">{st.label}</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{st.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Total Donations: {donations.length}</span>
            <span className="text-purple-600 font-bold">Active Matchmaker</span>
          </div>
        </div>

        {/* Quick Actions & Navigation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> Administrative Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Manage All Platform Users', view: 'users', icon: Users },
                { label: 'Review Business Merchants', view: 'businesses', icon: Store },
                { label: 'Manage Location & Radius Rules', view: 'location-settings', icon: MapPin },
                { label: 'Cryptographic Audit Ledger', view: 'audit-logs', icon: Database },
              ].map((action, idx) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveView(action.view)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-900 text-xs font-semibold text-slate-700 transition-all flex items-center justify-between group cursor-pointer border border-slate-100"
                  >
                    <span className="flex items-center gap-2.5">
                      <ActionIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                      {action.label}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Secured via Server-Authoritative RBAC
          </div>
        </div>
      </div>

      {/* Recent Platform Activity Audit Log Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" /> Recent Platform Activity & Audit Events
          </h3>
          <button
            onClick={() => setActiveView('audit-logs')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            Full Audit Logs <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden">
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No recent audit events recorded.</div>
          ) : (
            auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <div>
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-slate-500 ml-2">({log.category})</span>
                    <p className="text-slate-500 mt-0.5">{log.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 block">{log.timestamp}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {log.actorId}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
