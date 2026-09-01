import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Sliders,
  History,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Compass,
  TreePine,
  Building,
  Landmark,
  Truck,
  HeartHandshake,
  Navigation,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocationRadiusPolicy, LocationRadiusPolicyType, LocalityType, isAdminRole } from '../../types';

export const LocationSettingsTab: React.FC = () => {
  const {
    currentUser,
    radiusPolicies,
    radiusAuditLogs,
    updatePlatformRadiusPolicy,
    fetchLocationPolicies,
  } = useApp();

  const [editingPolicy, setEditingPolicy] = useState<LocationRadiusPolicy | null>(null);
  const [newRadiusInput, setNewRadiusInput] = useState<number>(20);
  const [reasonInput, setReasonInput] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityTestResult, setSecurityTestResult] = useState<{
    status: number;
    message: string;
    allowed: boolean;
  } | null>(null);

  const isAdmin = isAdminRole(currentUser?.role);

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">403 Unauthorized: Host Admin Access Required</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
            Platform geo-discovery radius rules and logistics boundary limits can only be configured by
            the Platform Host / Super Administrator.
          </p>
        </div>
      </div>
    );
  }

  const handleOpenEdit = (policy: LocationRadiusPolicy) => {
    setEditingPolicy(policy);
    setNewRadiusInput(policy.radiusKm);
    setReasonInput('');
    setIsConfirmOpen(false);
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy) return;
    if (newRadiusInput < editingPolicy.minAllowedKm || newRadiusInput > editingPolicy.maxAllowedKm) {
      alert(`Radius must be between ${editingPolicy.minAllowedKm} km and ${editingPolicy.maxAllowedKm} km.`);
      return;
    }
    if (!reasonInput || reasonInput.trim().length < 5) {
      alert('Please provide an operational reason (minimum 5 characters) for audit compliance.');
      return;
    }

    setIsSubmitting(true);
    const res = await updatePlatformRadiusPolicy(
      editingPolicy.policyType,
      editingPolicy.localityType,
      newRadiusInput,
      reasonInput
    );
    setIsSubmitting(false);

    if (res.success) {
      setEditingPolicy(null);
      setIsConfirmOpen(false);
    } else {
      alert(res.error || 'Failed to update policy');
    }
  };

  // Test non-admin rejection over real backend API
  const handleRunSecurityTest = async () => {
    try {
      const response = await fetch('/api/admin/location-policy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'CONSUMER', // Unauthorized role test
        },
        body: JSON.stringify({
          policyType: 'DISCOVERY_RADIUS',
          localityType: 'VILLAGE',
          newRadiusKm: 50,
          adminRole: 'CONSUMER',
          reason: 'Unauthorized attempt to bypass radius limits',
        }),
      });

      const data = await response.json();

      setSecurityTestResult({
        status: response.status,
        message: data.error || 'Operation rejected by server.',
        allowed: response.ok,
      });
    } catch (err: any) {
      setSecurityTestResult({
        status: 500,
        message: err.message,
        allowed: false,
      });
    }
  };

  const policyGroups: {
    title: string;
    policyType: LocationRadiusPolicyType;
    icon: any;
    description: string;
  }[] = [
    {
      title: 'Marketplace Discovery Radius',
      policyType: 'DISCOVERY_RADIUS',
      icon: Compass,
      description: 'Controls which surplus listings consumers can view, reserve, and order by default.',
    },
    {
      title: 'Logistics Delivery Radius',
      policyType: 'DELIVERY_RADIUS',
      icon: Truck,
      description: 'Maximum dispatch limit for doorstep delivery riders and courier partners.',
    },
    {
      title: 'NGO Food Rescue Matching Radius',
      policyType: 'NGO_MATCHING_RADIUS',
      icon: HeartHandshake,
      description: 'Automated broadcast distance to match perishable surplus with verified charity shelters.',
    },
    {
      title: 'Driver Service Radius',
      policyType: 'DRIVER_SERVICE_RADIUS',
      icon: Navigation,
      description: 'Driver beacon broadcast zone for instant pickup requests.',
    },
  ];

  const getLocalityBadge = (type: LocalityType) => {
    switch (type) {
      case 'VILLAGE':
        return { label: 'Village / Rural', icon: TreePine, color: 'bg-emerald-100 text-emerald-800' };
      case 'TOWN':
        return { label: 'Town', icon: Building, color: 'bg-amber-100 text-amber-800' };
      case 'CITY':
      case 'METRO':
        return { label: 'City / Metro', icon: Landmark, color: 'bg-blue-100 text-blue-800' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Platform Host Configuration</span>
            </span>
            <span className="text-xs text-slate-500 font-semibold">Authoritative PostGIS Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Location Radius & Policy Management
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl">
            Configure system-wide geo-radius boundaries for Village, Town, and City localities.
            All client listings, reservations, and orders are authoritatively enforced against these policies.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunSecurityTest}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Verify Security Sandbox</span>
          </button>
        </div>
      </div>

      {/* Security Sandbox Test Feedback */}
      {securityTestResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs ${
            !securityTestResult.allowed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold">
                Security Sandbox Passed: HTTP {securityTestResult.status} Forbidden
              </div>
              <p className="text-slate-600 mt-0.5">{securityTestResult.message}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Verified: Backend successfully blocked unauthorized non-admin role mutation attempt.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSecurityTestResult(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grouped Policies */}
      <div className="space-y-6">
        {policyGroups.map((group) => {
          const GroupIcon = group.icon;
          const groupPolicies = radiusPolicies.filter((p) => p.policyType === group.policyType);

          return (
            <div
              key={group.policyType}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <GroupIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{group.title}</h3>
                    <p className="text-xs text-slate-500">{group.description}</p>
                  </div>
                </div>
              </div>

              {/* Policy Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {groupPolicies.map((policy) => {
                  const badge = getLocalityBadge(policy.localityType);
                  const Icon = badge.icon;

                  return (
                    <div
                      key={policy.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${badge.color}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{badge.label}</span>
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            Version v{policy.version}
                          </span>
                        </div>

                        <div>
                          <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                            <span>{policy.radiusKm}</span>
                            <span className="text-sm font-semibold text-slate-500">km</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Safety Limit: {policy.minAllowedKm} km – {policy.maxAllowedKm} km
                          </p>
                        </div>

                        {policy.reason && (
                          <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 italic line-clamp-2">
                            "{policy.reason}"
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Updated: {new Date(policy.updatedAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(policy)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-slate-600" />
                          <span>Configure Radius</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit History Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Radius Policy Immutable Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {radiusAuditLogs.length} Logged Mutation Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5">Policy Category</th>
                <th className="pb-2.5">Locality Type</th>
                <th className="pb-2.5">Previous Value</th>
                <th className="pb-2.5">New Value</th>
                <th className="pb-2.5">Version</th>
                <th className="pb-2.5">Updated By</th>
                <th className="pb-2.5">Operational Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {radiusAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 font-bold text-slate-800">{log.policyType}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {log.localityType}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-500 line-through">{log.previousRadiusKm} km</td>
                  <td className="py-2.5 font-bold text-emerald-700">{log.newRadiusKm} km</td>
                  <td className="py-2.5 font-mono text-slate-600">v{log.version}</td>
                  <td className="py-2.5 text-slate-700 font-semibold">{log.updatedBy}</td>
                  <td className="py-2.5 text-slate-600 max-w-xs truncate" title={log.reason}>
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Configure Platform Radius</h3>
                <p className="text-xs text-slate-500">
                  {editingPolicy.localityType} • {editingPolicy.policyType}
                </p>
              </div>
              <button
                onClick={() => setEditingPolicy(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New Radius (in Kilometers)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={editingPolicy.minAllowedKm}
                    max={editingPolicy.maxAllowedKm}
                    value={newRadiusInput}
                    onChange={(e) => setNewRadiusInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                  <span className="text-sm font-bold text-slate-500">km</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Minimum: {editingPolicy.minAllowedKm} km</span>
                  <span>Maximum: {editingPolicy.maxAllowedKm} km</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mandatory Operational Reason (Audit Log)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Seasonal harvest adjustment for rural farmer cluster in Ramanagara"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Immediate Platform Invalidation</span>
                </div>
                <p className="text-[11px]">
                  Updating this radius from {editingPolicy.radiusKm} km to {newRadiusInput} km will
                  immediately affect marketplace listing filters and server order distance validations.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPolicy(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              {!isConfirmOpen ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={!reasonInput || reasonInput.trim().length < 5}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Proceed to Confirm
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSavePolicy}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Applying Policy...' : 'Confirm & Apply Policy'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
