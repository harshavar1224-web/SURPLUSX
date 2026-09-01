import React, { useState } from 'react';
import { Sliders, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminSettingsView: React.FC = () => {
  const { triggerToast, addAuditLog } = useApp();
  const [takeRate, setTakeRate] = useState('5');
  const [maxRadius, setMaxRadius] = useState('10');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('System settings updated successfully.', 'success');
    addAuditLog('SYSTEM_SETTINGS_UPDATED', 'ADMIN', `Updated platform take rate to ${takeRate}% and max radius to ${maxRadius}km.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-purple-600" /> Platform System Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure global platform parameters, commission take-rates, radius rules, and maintenance modes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Platform Commission Take Rate (%)
            </label>
            <input
              type="number"
              value={takeRate}
              onChange={(e) => setTakeRate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Default Geo-Matching Radius (km)
            </label>
            <input
              type="number"
              value={maxRadius}
              onChange={(e) => setMaxRadius(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Platform Maintenance Mode</span>
              <span className="text-[11px] text-slate-500">Temporarily pause non-admin platform traffic for upgrades.</span>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-xs hover:bg-purple-500 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </form>
    </div>
  );
};
