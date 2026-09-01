import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  Smartphone,
  MapPin,
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCircle2,
  Edit2,
  Save,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfileView: React.FC = () => {
  const { currentUser, updateUserProfile, deviceBinding, triggerToast } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    city: currentUser?.city || 'Bangalore, India',
    organizationName: currentUser?.organizationName || '',
    avatarUrl: currentUser?.avatarUrl || '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
      organizationName: formData.organizationName,
      avatarUrl: formData.avatarUrl,
    });
    setIsEditing(false);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'CONSUMER':
        return { label: 'Consumer', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'BUSINESS':
        return { label: 'Business Merchant', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'NGO':
        return { label: 'NGO Partner', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return { 
          label: role === 'SUPER_ADMIN' ? 'Platform Super Administrator' : 'Platform Administrator', 
          color: 'bg-purple-100 text-purple-800 border-purple-300' 
        };
      default:
        return { label: 'Guest Explorer', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const badge = getRoleBadge(currentUser?.role);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  formData.avatarUrl ||
                  currentUser?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={currentUser?.name || 'User'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs"
              />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {currentUser?.name || 'SurplusX User'}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser?.email || 'user@surplusx.org'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser?.city || 'Bangalore, India'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {currentUser?.joinedDate || 'January 2024'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Security & Role Immutability Notice */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-3">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <p className="font-bold flex items-center gap-2">
                <span>Strict Account Identity & Role Locking Policy</span>
                <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                  Locked
                </span>
              </p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Under SurplusX nationwide policy (ONE EMAIL + ONE MOBILE + ONE ROLE), your role is permanently locked to this account. Role changes cannot be performed via self-service and require authorized SurplusX Trust & Safety administrator approval.
              </p>
            </div>
          </div>

          {/* Identity Anchors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-amber-200/60 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Email Anchor</div>
                <div className="font-bold text-slate-800 truncate">{currentUser?.email}</div>
              </div>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Mobile Anchor</div>
                <div className="font-bold text-slate-800 truncate">{currentUser?.phone}</div>
              </div>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Assigned Role</div>
                <div className="font-bold text-slate-800">{badge.label}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit or Display Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled={true}
                value={formData.email}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                title="Email is fixed to account identity"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary City / Locality
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
              />
            </div>

            {(currentUser?.role === 'BUSINESS' || currentUser?.role === 'NGO') && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organization / Entity Legal Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
                />
              </div>
            )}

            {isEditing && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Security & Device Binding Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">
            One-Device Hardware Binding & Trust
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="text-slate-500 font-medium">Bound Device Name</p>
            <p className="font-bold text-slate-800 mt-1">{deviceBinding.deviceName}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="text-slate-500 font-medium">Hardware Identifier</p>
            <p className="font-mono text-slate-800 mt-1 text-[11px] truncate">
              {deviceBinding.deviceId}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
            <p className="text-emerald-700 font-medium">Device Trust Status</p>
            <p className="font-bold text-emerald-800 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              AUTHENTICATED & ACTIVE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
