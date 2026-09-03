import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  Database, 
  Activity, 
  MapPin, 
  ChevronDown,
  Settings,
  Menu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';
import { useOutsideClick } from '../../hooks/useOutsideClick';

export const AdminHeader: React.FC = () => {
  const {
    currentUser,
    logout,
    setActiveView,
    notifications,
    setIsMobileSidebarOpen,
    isMobileSidebarOpen,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useOutsideClick(notifRef, () => setIsNotifOpen(false), isNotifOpen);
  useOutsideClick(profileRef, () => setIsProfileOpen(false), isProfileOpen);

  const unreadNotifs = (notifications || []).filter((n) => !n.read);

  return (
    <header className="shrink-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 grid grid-cols-3 items-center shadow-xs z-30 w-full">
      {/* Left: Mobile Toggle & Logo */}
      <div className="flex items-center gap-4 justify-start">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex">
          <SurplusXLogo size="sm" showWordmark={false} />
        </div>
      </div>

      {/* Center: Brand / Context */}
      <div className="text-center justify-self-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Platform Command Center
          </h1>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            {currentUser?.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMINISTRATOR'}
          </span>
        </div>
        <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Systems Operational
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3 h-3 text-slate-400" /> Platform-wide (India HQ)
          </span>
        </p>
      </div>

      {/* Right: Global Search, System Health, Notifications, Profile */}
      <div className="flex items-center gap-3 justify-end">
        {/* System Health Indicators */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>DB: Connected</span>
          <span className="text-slate-300">|</span>
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>API: 99.98%</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Platform Notifications"
          >
            <Bell className="w-5 h-5" />
            {(unreadNotifs || []).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">
                {(unreadNotifs || []).length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Alerts</h3>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  {(unreadNotifs || []).length} Unread
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {(notifications || []).length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No active platform notifications.</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                      <p className="font-semibold text-slate-800">{n.title}</p>
                      <p className="text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setActiveView('notifications');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile / Admin Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">
                {currentUser?.name || 'Platform Admin'}
              </span>
              <span className="text-[10px] text-purple-600 font-semibold uppercase block">
                {currentUser?.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveView('profile');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" /> My Profile & Security
                </button>
                <button
                  onClick={() => {
                    setActiveView('system-settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> System Settings
                </button>
                {currentUser?.role === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => {
                      setActiveView('administrators');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" /> Admin Management
                  </button>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
