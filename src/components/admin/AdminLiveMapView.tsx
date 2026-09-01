import React from 'react';
import { Map, Navigation } from 'lucide-react';
import { InteractiveMapView } from '../consumer/InteractiveMapView';

export const AdminLiveMapView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-purple-600" /> Mappls Live GIS Fleet Telemetry Map
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geospatial tracking of active delivery routes, merchant hubs, and NGO shelters.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Mappls SDK Connected
        </div>
      </div>

      <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
        <InteractiveMapView />
      </div>
    </div>
  );
};
