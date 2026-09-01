import React from 'react';
import { Truck, Navigation, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLiveLogisticsView: React.FC = () => {
  const { activeDelivery, setActiveView } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-cyan-600" /> Live Operational Logistics Fleet
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time delivery telemetry, active rider and NGO transit tracking across Mappls GIS.
          </p>
        </div>
        <button
          onClick={() => setActiveView('live-map')}
          className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs hover:bg-purple-500 transition-colors flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" /> Open Mappls Live Map
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        {!activeDelivery ? (
          <div className="py-16 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Active Deliveries in Transit</h3>
            <p className="text-xs text-slate-500 mt-1">All pickup and transit routes are currently completed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-purple-600 uppercase">Active Delivery Telemetry</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                IN TRANSIT
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-400 block font-medium">Pickup Location</span>
                <span className="font-bold text-slate-900 mt-1 block">{activeDelivery.pickupAddress}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-400 block font-medium">Destination NGO</span>
                <span className="font-bold text-slate-900 mt-1 block">{activeDelivery.destinationAddress}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <span className="text-slate-400 block font-medium">Estimated Time of Arrival</span>
                <span className="font-bold text-emerald-600 mt-1 block">{activeDelivery.etaMinutes} minutes</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
