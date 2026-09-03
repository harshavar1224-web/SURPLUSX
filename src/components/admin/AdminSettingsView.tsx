import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  FileText,
  ShieldCheck,
  Scale,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  UserX,
  Database,
  Lock,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminSettingsView: React.FC = () => {
  const { triggerToast, addAuditLog, currentUser, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'system' | 'legal' | 'privacy-requests'>('system');

  // System Settings State
  const [takeRate, setTakeRate] = useState('5');
  const [maxRadius, setMaxRadius] = useState('10');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Legal Policy Management State
  const [policiesData, setPoliciesData] = useState<any>({
    currentPrivacyVersion: 'v1.0',
    currentTermsVersion: 'v1.0',
    privacyLastUpdated: '2026-09-02T00:00:00.000Z',
    termsLastUpdated: '2026-09-02T00:00:00.000Z',
    effectiveDate: '2026-09-02T00:00:00.000Z',
    requireReacceptanceOnUpdate: true,
    entityDetails: {
      legalEntityName: 'SurplusX Technologies Private Limited',
      supportEmail: 'surplusx.support@gmail.com',
      governingJurisdiction: 'Bangalore, Karnataka, India',
      legalReviewStatus: 'LEGAL_REVIEW_REQUIRED'
    },
    policyHistory: [
      { id: 'pol-101', type: 'PRIVACY', version: 'v1.0', publishedAt: '2026-09-02T00:00:00.000Z', publishedBy: 'Super Admin', notes: 'Initial production launch version.' },
      { id: 'pol-102', type: 'TERMS', version: 'v1.0', publishedAt: '2026-09-02T00:00:00.000Z', publishedBy: 'Super Admin', notes: 'Initial production launch version.' }
    ]
  });

  const [publishPolicyType, setPublishPolicyType] = useState<'PRIVACY' | 'TERMS'>('PRIVACY');
  const [newPolicyVersion, setNewPolicyVersion] = useState('v1.1');
  const [policyPublishNotes, setPolicyPublishNotes] = useState('');
  const [isPublishingPolicy, setIsPublishingPolicy] = useState(false);

  // Privacy Requests Queue State
  const [privacyRequests, setPrivacyRequests] = useState<any[]>([
    {
      id: 'prv-101',
      requestType: 'DATA_EXPORT',
      requesterName: 'Ananya Sharma',
      requesterEmail: 'ananya@gmail.com',
      accountType: 'CONSUMER',
      details: 'Requesting export of past order receipt transactions and surplus points ledger.',
      status: 'SUBMITTED',
      submittedAt: '2026-09-01T14:30:00.000Z',
      resolutionNotes: '',
      completedAt: null,
      reviewedBy: null
    }
  ]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestResolutionNotes, setRequestResolutionNotes] = useState('');

  // Fetch data on load
  useEffect(() => {
    fetchPolicies();
    fetchPrivacyRequests();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/admin/legal/policies');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.policies) {
          setPoliciesData(data.policies);
        }
      }
    } catch (e) {
      console.error('Failed to fetch legal policies', e);
    }
  };

  const fetchPrivacyRequests = async () => {
    try {
      const res = await fetch('/api/admin/privacy/requests');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.requests) {
          setPrivacyRequests(data.requests);
        }
      }
    } catch (e) {
      console.error('Failed to fetch privacy requests', e);
    }
  };

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('System settings updated successfully.', 'success');
    addAuditLog('SYSTEM_SETTINGS_UPDATED', 'SUPER_ADMIN', `Updated platform take rate to ${takeRate}% and max radius to ${maxRadius}km.`);
  };

  const handlePublishPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyVersion.trim()) {
      triggerToast('Please provide a valid policy version number (e.g. v1.1)', 'error');
      return;
    }

    setIsPublishingPolicy(true);
    try {
      const res = await fetch('/api/admin/legal/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PUBLISH_NEW_VERSION',
          type: publishPolicyType,
          version: newPolicyVersion.trim(),
          notes: policyPublishNotes.trim() || 'Published updated policy version.',
          adminId: currentUser?.id || 'admin-super-primary',
          adminName: currentUser?.name || 'Super Admin'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPoliciesData(data.policies);
          triggerToast(`Successfully published ${publishPolicyType} Policy ${newPolicyVersion}!`, 'success');
          addAuditLog('LEGAL_POLICY_PUBLISHED', 'SUPER_ADMIN', `Published new ${publishPolicyType} Policy version ${newPolicyVersion}`);
          setPolicyPublishNotes('');
          setNewPolicyVersion(publishPolicyType === 'PRIVACY' ? 'v1.2' : 'v1.1');
        }
      }
    } catch (e) {
      triggerToast('Failed to publish policy version update.', 'error');
    } finally {
      setIsPublishingPolicy(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/privacy/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          resolutionNotes: requestResolutionNotes,
          adminId: currentUser?.id || 'admin-super-primary',
          adminName: currentUser?.name || 'Super Admin'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPrivacyRequests(data.requests);
          triggerToast(`Privacy request updated to ${newStatus}`, 'success');
          addAuditLog('PRIVACY_REQUEST_RESOLVED', 'SUPER_ADMIN', `Updated Privacy Request ${requestId} to ${newStatus}`);
          setSelectedRequestId(null);
          setRequestResolutionNotes('');
        }
      }
    } catch (e) {
      triggerToast('Failed to update privacy request status.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-purple-600" /> Platform Governance & System Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure system parameters, manage Privacy & Terms policy versions, and audit user data privacy requests.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System & Fees
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'legal'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Legal Policies ({policiesData.currentPrivacyVersion})
          </button>
          <button
            onClick={() => setActiveTab('privacy-requests')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy-requests'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Privacy Requests</span>
            {privacyRequests.filter(r => r.status === 'SUBMITTED').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: System Settings */}
      {activeTab === 'system' && (
        <form onSubmit={handleSaveSystemSettings} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 max-w-2xl">
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
      )}

      {/* TAB 2: Legal Policies Management */}
      {activeTab === 'legal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Policies Summary & Entity Gate */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Active Legal Policy Versions
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Effective: {new Date(policiesData.effectiveDate).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Privacy Policy Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Privacy Policy</span>
                    <span className="text-xs font-extrabold text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded-md">
                      {policiesData.currentPrivacyVersion}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Covers GPS tracking, identity documents, dual verification, and 80G donations.
                  </p>
                  <button
                    onClick={() => {
                      window.history.pushState(null, '', '/privacy');
                      setActiveView('privacy');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Terms & Conditions Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Terms & Conditions</span>
                    <span className="text-xs font-extrabold text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded-md">
                      {policiesData.currentTermsVersion}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Governs FSSAI compliance, 4-digit OTP handover, escrow funds, and arbitration.
                  </p>
                  <button
                    onClick={() => {
                      window.history.pushState(null, '', '/terms');
                      setActiveView('terms');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>

            {/* Legal Confirmation Gate & Configurable Placeholders Checklist */}
            <div className="bg-amber-50/80 border border-amber-200 p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>SUPER_ADMIN Legal Confirmation Gate</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Platform legal policies currently utilize configurable placeholders for specific items requiring formal legal counsel signoff before final enterprise execution:
              </p>
              <ul className="text-[11px] text-amber-900 space-y-1.5 list-disc list-inside font-medium">
                <li><strong>Entity Registration Details:</strong> Corporate registration, CIN, GSTIN, and physical registered address.</li>
                <li><strong>Statutory Retention Limits:</strong> Data retention durations for user transaction records under Indian IT Rules.</li>
                <li><strong>Jurisdiction:</strong> Confirmation of exclusive arbitration venue (Bangalore, Karnataka, India).</li>
              </ul>
              <div className="pt-2 flex items-center justify-between text-xs text-amber-900 font-bold border-t border-amber-200">
                <span>Legal Status: <span className="underline">LEGAL_REVIEW_REQUIRED</span></span>
                <span>Support Contact: surplusx.support@gmail.com</span>
              </div>
            </div>

            {/* Policy Audit History */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                Policy Version History Log
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {policiesData.policyHistory.map((pol: any) => (
                  <div key={pol.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{pol.type} Policy {pol.version}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{pol.notes}</p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <p className="font-medium text-slate-600">{pol.publishedBy}</p>
                      <p>{new Date(pol.publishedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Publish New Version Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handlePublishPolicy} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 sticky top-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-600" />
                Publish Policy Update
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Policy Document</label>
                  <select
                    value={publishPolicyType}
                    onChange={(e) => setPublishPolicyType(e.target.value as 'PRIVACY' | 'TERMS')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden"
                  >
                    <option value="PRIVACY">Privacy Policy</option>
                    <option value="TERMS">Terms & Conditions</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Version Tag (e.g. v1.1)</label>
                  <input
                    type="text"
                    value={newPolicyVersion}
                    onChange={(e) => setNewPolicyVersion(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden"
                    placeholder="v1.1"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Version Notes / Revision Summary</label>
                  <textarea
                    rows={3}
                    value={policyPublishNotes}
                    onChange={(e) => setPolicyPublishNotes(e.target.value)}
                    placeholder="Describe changes or regulatory updates included in this release..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900 space-y-1">
                  <p className="font-bold">Version Policy Rule:</p>
                  <p>Publishing a new policy version automatically archives historical versions without overwriting existing records.</p>
                </div>

                <button
                  type="submit"
                  disabled={isPublishingPolicy}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPublishingPolicy ? 'Publishing...' : `Publish ${publishPolicyType} ${newPolicyVersion}`}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* TAB 3: Privacy Requests Queue */}
      {activeTab === 'privacy-requests' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                User Privacy & Data Request Processing Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage user requests for data access export, data correction, account deletion, or consent withdrawal.
              </p>
            </div>
            <button
              onClick={fetchPrivacyRequests}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {privacyRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                No active privacy requests in queue.
              </div>
            ) : (
              privacyRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        req.requestType === 'ACCOUNT_DELETION' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {req.requestType}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{req.requesterName}</span>
                      <span className="text-xs text-slate-500">({req.requesterEmail})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(req.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80">
                    {req.details || 'No additional details specified.'}
                  </p>

                  {/* Processing Actions */}
                  {req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW' ? (
                    <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                      <input
                        type="text"
                        placeholder="Resolution notes or export link..."
                        value={selectedRequestId === req.id ? requestResolutionNotes : ''}
                        onChange={(e) => {
                          setSelectedRequestId(req.id);
                          setRequestResolutionNotes(e.target.value);
                        }}
                        className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden flex-1"
                      />
                      <button
                        onClick={() => handleUpdateRequestStatus(req.id, 'COMPLETED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleUpdateRequestStatus(req.id, 'REJECTED')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    req.resolutionNotes && (
                      <p className="text-[11px] text-slate-500 italic">
                        Resolution Notes: {req.resolutionNotes} (by {req.reviewedBy})
                      </p>
                    )
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
