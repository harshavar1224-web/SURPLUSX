import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Smartphone,
  Shield,
  MapPin,
  Globe,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { currentUser, deviceBinding, setIsLocationModalOpen, setActiveView, triggerToast } = useApp();

  const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'devices' | 'location' | 'preferences'>('notifications');

  // Notification toggles
  const [notifSettings, setNotifSettings] = useState({
    orderUpdates: true,
    surplusAlerts: true,
    donationMatches: true,
    whatsappAlerts: true,
    emailSummary: false,
  });

  // Security toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [gpsPrecisionTracking, setGpsPrecisionTracking] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleToggle = (key: keyof typeof notifSettings) => {
    setNotifSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      triggerToast(`Notification preference updated.`, 'info');
      return next;
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Password updated securely with cryptographic hash.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Settings & Preferences</h1>
          </div>
          <p className="text-xs text-slate-500">
            Manage account security, device authorization, communication alerts, and location policies.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & 2FA', icon: Lock },
          { id: 'devices', label: 'Device Management', icon: Smartphone },
          { id: 'location', label: 'Location & Radius', icon: MapPin },
          { id: 'preferences', label: 'Language & Region', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Communication & Push Preferences
          </h2>

          <div className="divide-y divide-slate-100 space-y-3">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs font-bold text-slate-800">Order & Reservation Updates</p>
                <p className="text-[11px] text-slate-500">
                  Real-time push notifications for pickup ready status and live courier tracking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('orderUpdates')}
                className="cursor-pointer"
              >
                {notifSettings.orderUpdates ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-slate-800">Flash Surplus Drops</p>
                <p className="text-[11px] text-slate-500">
                  Instant alerts when bakery, fresh produce, or prepared meals are listed near you at 50%+ discount.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('surplusAlerts')}
                className="cursor-pointer"
              >
                {notifSettings.surplusAlerts ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-slate-800">WhatsApp Dispatch Updates</p>
                <p className="text-[11px] text-slate-500">
                  Receive OTP codes and pickup directions directly on your registered WhatsApp number.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('whatsappAlerts')}
                className="cursor-pointer"
              >
                {notifSettings.whatsappAlerts ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-xs font-bold text-slate-800">Weekly ESG Impact Digest</p>
                <p className="text-[11px] text-slate-500">
                  Summary email of your rescued meals, CO2 avoided, and verified 80G tax deductions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('emailSummary')}
                className="cursor-pointer"
              >
                {notifSettings.emailSummary ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Two-Factor Authentication (2FA)
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Hardware & SMS 2FA Guard</p>
                <p className="text-[11px] text-slate-500">
                  Requires 6-digit OTP verification when signing in or approving merchant payouts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorAuth(!twoFactorAuth);
                  triggerToast('2FA settings updated.', 'info');
                }}
                className="cursor-pointer"
              >
                {twoFactorAuth ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Change Account Password
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 chars with symbols"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Authorized Device Hardware Binding
              </h2>
              <p className="text-xs text-slate-500">
                SurplusX enforces 1 active device session per authenticated account to prevent concurrent account-sharing and fraud.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              1-Device Bound
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    {deviceBinding.deviceName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    THIS DEVICE (ACTIVE)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  ID: {deviceBinding.deviceId}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Bound on: {deviceBinding.boundAt} • IP: {deviceBinding.ipAddress}
                </p>
              </div>
            </div>

            <button
              onClick={() => triggerToast('Device unbind request sent to SMS verification.', 'info')}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold border border-rose-200 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
            >
              Rebind New Device
            </button>
          </div>
        </div>
      )}

      {activeTab === 'location' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Geo-Radius & Delivery Discovery Settings
              </h2>
              <p className="text-xs text-slate-500">
                Locality-aware discovery radius (Village: 20km, Town: 40km, Metro: 40km)
              </p>
            </div>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Configure Location
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-bold text-slate-800">High-Precision GPS Anomaly Shield</p>
              <p className="text-[11px] text-slate-500">
                Rejects mock location spoofing and enforces geofenced delivery handover.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ENABLED & ENFORCED
            </span>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Language & Regional Localization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            {[
              { code: 'en', name: 'English', native: 'English' },
              { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
              { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
              { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
              { code: 'te', name: 'Telugu', native: 'తెలుగు' },
            ].map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    triggerToast(`App language set to ${lang.name}`, 'info');
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{lang.name}</p>
                    <p className="text-[11px] text-slate-500">{lang.native}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
