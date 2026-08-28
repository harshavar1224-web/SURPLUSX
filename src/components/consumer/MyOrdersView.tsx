import React, { useState } from 'react';
import {
  Package,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  Navigation,
  Receipt,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const MyOrdersView: React.FC = () => {
  const {
    orders,
    setActiveView,
    setSelectedOrderForTracking,
    triggerToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ACTIVE') return o.status !== 'COMPLETED' && o.status !== 'CANCELLED';
    if (activeTab === 'COMPLETED') return o.status === 'COMPLETED';
    return true;
  });

  const handleTrack = (order: Order) => {
    setSelectedOrderForTracking(order);
    setActiveView('live-tracking');
  };

  const handleViewReceipt = (order: Order) => {
    setSelectedOrderForTracking(order);
    setActiveView('receipts');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              My Surplus Orders
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Track active pickups, display verification OTPs, and access verified tax receipts.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Orders' : tab === 'ACTIVE' ? 'Active' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Explore nearby surplus bundles and save quality food from going to waste.
            </p>
            <button
              onClick={() => setActiveView('browse')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Explore Surplus Near Me
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isCompleted = order.status === 'COMPLETED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                      <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          Order #{order.id}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.storeName} • {order.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Pickup OTP Code Box */}
                  {!isCompleted && order.pickupCodeOtp && (
                    <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200 px-3.5 py-2 rounded-xl">
                      <QrCode className="w-5 h-5 text-emerald-700" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          Pickup OTP
                        </p>
                        <p className="text-base font-mono font-bold text-emerald-950 tracking-wider">
                          {order.pickupCodeOtp}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items & Store details */}
                <div className="py-3.5 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-8 space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-700">
                        <span className="font-medium">
                          {item.quantity}x {item.title}
                        </span>
                        <span className="font-bold">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pickup Window: {order.pickupWindow}</span>
                    </div>
                  </div>

                  <div className="md:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-slate-800">
                      <span className="font-medium">Total Paid:</span>
                      <span className="font-bold text-sm text-emerald-700">₹{order.totalAmount}</span>
                    </div>
                    {order.discount > 0 && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">
                        Surplus Savings: ₹{order.discount} OFF
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{order.storeAddress}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewReceipt(order)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Tax Invoice</span>
                    </button>

                    {!isCompleted && (
                      <button
                        onClick={() => handleTrack(order)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Live Route & GPS</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
