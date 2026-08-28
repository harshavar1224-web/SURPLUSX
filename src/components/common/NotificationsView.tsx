import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Package,
  Truck,
  HeartHandshake,
  AlertTriangle,
  ChevronRight,
  Clock,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    setActiveView,
    triggerToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ORDER' | 'DELIVERY' | 'DONATION' | 'ALERT'>('ALL');

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ORDER') return n.type === 'order';
    if (activeFilter === 'DELIVERY') return n.type === 'delivery';
    if (activeFilter === 'DONATION') return n.type === 'donation';
    if (activeFilter === 'ALERT') return n.type === 'alert';
    return true;
  });

  const handleMarkAllRead = () => {
    notifications.forEach((n) => markNotificationAsRead(n.id));
    triggerToast('All notifications marked as read', 'info');
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'delivery':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'donation':
        return <HeartHandshake className="w-4 h-4 text-amber-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleAction = (n: typeof notifications[0]) => {
    markNotificationAsRead(n.id);
    if (n.type === 'delivery' || n.type === 'order') {
      setActiveView('live-tracking');
    } else if (n.type === 'donation') {
      setActiveView('donations');
    } else {
      setActiveView('browse');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Notifications & Alerts</h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time logistical milestones, surplus drop flashes, and donation status.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'ORDER', label: 'Orders' },
          { id: 'DELIVERY', label: 'Logistics & Courier' },
          { id: 'DONATION', label: 'Donations' },
          { id: 'ALERT', label: 'Surplus Drops' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === filter.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-bold text-slate-600">No notifications found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              You are all caught up on surplus alerts and logistical movements.
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleAction(n)}
              className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                n.read ? 'hover:bg-slate-50/70' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    n.read ? 'bg-slate-100' : 'bg-white shadow-2xs border border-emerald-200'
                  }`}
                >
                  {getNotifIcon(n.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs ${
                        n.read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'
                      }`}
                    >
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {n.time}
                  </span>
                </div>
              </div>

              <div className="shrink-0 self-center">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
