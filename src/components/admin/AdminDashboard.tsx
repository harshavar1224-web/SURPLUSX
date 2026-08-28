import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  FileCheck,
  DollarSign,
  Lock,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Building,
  HeartHandshake,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NGO, AuditLog, LedgerEntry } from '../../types';
import { LocationSettingsTab } from './LocationSettingsTab';

interface MockVerificationDoc {
  id: string;
  organizationName: string;
  organizationType: 'BUSINESS' | 'NGO';
  documentType: 'FSSAI License' | '80G Tax Certificate' | 'NGO Darpan' | 'Trade License';
  documentNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
}

export const AdminDashboard: React.FC = () => {
  const {
    activeView,
    ngos,
    auditLogs,
    ledgers,
    triggerMerchantSettlement,
    activeDelivery,
    triggerToast,
    addAuditLog,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'verifications' | 'fleet' | 'ledger' | 'audit' | 'disputes' | 'fraud' | 'location'>('verifications');

  useEffect(() => {
    if (activeView === 'verification' || activeView === 'users' || activeView === 'businesses' || activeView === 'ngos') setActiveTab('verifications');
    else if (activeView === 'live-logistics' || activeView === 'fleet') setActiveTab('fleet');
    else if (activeView === 'settlements' || activeView === 'payments' || activeView === 'ledger') setActiveTab('ledger');
    else if (activeView === 'audit-logs' || activeView === 'audit') setActiveTab('audit');
    else if (activeView === 'reports' || activeView === 'fraud' || activeView === 'disputes') setActiveTab('fraud');
    else if (activeView === 'system-settings' || activeView === 'location' || activeView === 'location-settings') setActiveTab('location');
  }, [activeView]);

  const [fraudSignals, setFraudSignals] = useState<any[]>([
    {
      id: 'fraud-sig-1',
      userId: 'usr-susp-991',
      userRole: 'CONSUMER',
      severity: 'HIGH',
      signalType: 'OTP_BRUTE_FORCE_ATTEMPT',
      details: '4 consecutive invalid delivery OTP attempts logged within 45 seconds from IP 49.37.12.8',
      timestamp: '2026-08-26 14:10:02',
      resolved: false,
    },
    {
      id: 'fraud-sig-2',
      userId: 'usr-susp-412',
      userRole: 'CONSUMER',
      severity: 'MEDIUM',
      signalType: 'EXCESSIVE_CHECKOUT_VELOCITY',
      details: '12 simultaneous reservation locks generated across multiple browser sessions',
      timestamp: '2026-08-26 13:45:18',
      resolved: false,
    },
  ]);

  const [disputes, setDisputes] = useState<any[]>([
    {
      id: 'dsp-8801',
      orderId: 'ord-1029',
      claimantName: 'Kavita Sundaram',
      claimantRole: 'CONSUMER',
      merchantName: 'Sunrise Bakery & Cafe',
      reason: 'PACKAGING_DAMAGED',
      amount: 140,
      description: 'Items crushed during transport; seal broken on delivery handoff.',
      status: 'OPEN',
      createdAt: '2026-08-26 12:30:00',
    },
  ]);

  const resolveDispute = (disputeId: string, action: 'REFUND' | 'DISMISS') => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: action === 'REFUND' ? 'REFUNDED' : 'DISMISSED' } : d))
    );
    triggerToast(
      action === 'REFUND' ? `Dispute ${disputeId} refunded to consumer wallet!` : `Dispute ${disputeId} dismissed after review.`,
      'success'
    );
    addAuditLog('DISPUTE_RESOLVED', 'FINANCIAL', `Admin resolved ${disputeId} with action ${action}`);
  };

  const [verifications, setVerifications] = useState<MockVerificationDoc[]>([
    {
      id: 'doc-101',
      organizationName: 'Green Basket Organics Pvt Ltd',
      organizationType: 'BUSINESS',
      documentType: 'FSSAI License',
      documentNumber: '11224334000192',
      status: 'APPROVED',
      uploadedAt: '2026-08-20',
    },
    {
      id: 'doc-102',
      organizationName: 'Hope Foundation Bangalore',
      organizationType: 'NGO',
      documentType: '80G Tax Certificate',
      documentNumber: 'AAATH8819CF20214',
      status: 'APPROVED',
      uploadedAt: '2026-08-21',
    },
    {
      id: 'doc-103',
      organizationName: 'Sunrise Bakery & Cafe',
      organizationType: 'BUSINESS',
      documentType: 'FSSAI License',
      documentNumber: '11225339000481',
      status: 'PENDING',
      uploadedAt: '2026-08-26',
    },
    {
      id: 'doc-104',
      organizationName: 'Robin Hood Army Bangalore',
      organizationType: 'NGO',
      documentType: 'NGO Darpan',
      documentNumber: 'KA/2019/0248819',
      status: 'PENDING',
      uploadedAt: '2026-08-25',
    },
  ]);

  const approveVerification = (docId: string) => {
    setVerifications((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'APPROVED' } : d))
    );
    triggerToast(`Document ${docId} approved & verified!`, 'success');
    addAuditLog('COMPLIANCE_APPROVED', 'VERIFICATION', `Admin verified compliance doc ${docId}`);
  };

  const rejectVerification = (docId: string, reason: string) => {
    setVerifications((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'REJECTED' } : d))
    );
    triggerToast(`Document ${docId} rejected: ${reason}`, 'warning');
    addAuditLog('COMPLIANCE_REJECTED', 'VERIFICATION', `Admin rejected doc ${docId}: ${reason}`);
  };

  const pendingDocs = verifications.filter((v) => v.status === 'PENDING');
  const pendingLedgers = ledgers.filter((l) => l.settlementStatus === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">SurplusX Platform Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono-code font-bold border border-emerald-500/30">
              CLUSTER: IND-BLR-01
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global Compliance, Cryptographic Audit Trail & Real-time Logistics Orchestration Engine
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-code">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>ALL SYSTEMS HEALTHY</span>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Admin Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Pending Verifications</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingDocs.length} Docs</div>
          <div className="text-[11px] text-slate-500 mt-1">FSSAI & NGO 80G Certificates</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Logistics Fleet</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">4 Drivers</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Live telemetry streaming</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Platform Take-Rate Revenue</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹3,420</div>
          <div className="text-[11px] text-slate-500 mt-1">8% Gross Commission</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Immutable Audit Blocks</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{auditLogs.length} Entries</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Tamper-evident</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'verifications'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Compliance Queue ({pendingDocs.length})
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'fleet'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Live Logistics Fleet Radar
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Financial Payout Settlements ({pendingLedgers.length})
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'disputes'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Disputes & Resolutions ({disputes.filter((d) => d.status === 'OPEN').length})
        </button>

        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'fraud'
              ? 'bg-rose-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fraud Radar ({fraudSignals.length})
        </button>

        <button
          onClick={() => setActiveTab('location')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'location'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Geo-Radius & Location Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Cryptographic Audit Ledger</span>
        </button>
      </div>

      {/* Tab 1: Merchant & NGO Compliance Verification Queue */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Partner Legal & Health Compliance Queue</h3>
            <p className="text-xs text-slate-500">
              Review and verify official government certifications (FSSAI, NGO Darpan, 80G Tax Exemption, Trade License) before onboarding.
            </p>
          </div>

          <div className="space-y-3">
            {verifications.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{doc.organizationName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                        {doc.organizationType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      <span className="font-semibold">{doc.documentType}</span>: {doc.documentNumber}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Uploaded on {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {doc.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => rejectVerification(doc.id, 'Document failed verification audit')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approveVerification(doc.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Approve Partner
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        doc.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Live Logistics Fleet Radar */}
      {activeTab === 'fleet' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Logistics Fleet Radar</h3>
              <p className="text-xs text-slate-500">
                Tracking all active NGO rescue vans and volunteer motorbikes across Bangalore coordinates.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-ping" />
              <span>4 Drivers Online</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Rahul Deshmukh (Van #KA-01-MJ-8821)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  IN TRANSIT
                </span>
              </div>
              <div className="text-xs text-slate-600">
                Trip: Green Basket Store ➔ Hope Foundation Ejipura • Speed: 24 km/h • ETA: 12 mins
              </div>
              <div className="text-[11px] text-slate-400 font-mono-code">
                Coordinates: 12.9352° N, 77.6245° E (Accuracy: ±4m)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Priya Nair (Two-Wheeler #KA-05-EB-4190)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  AT PICKUP STORE
                </span>
              </div>
              <div className="text-xs text-slate-600">
                Trip: Bake House Indiranagar ➔ Robin Hood Distribution Hub • ETA: 25 mins
              </div>
              <div className="text-[11px] text-slate-400 font-mono-code">
                Coordinates: 12.9716° N, 77.6412° E (Accuracy: ±6m)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Financial Settlements */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Razorpay Payouts & Commission Engine</h3>
            <p className="text-xs text-slate-500">
              Admin authority to trigger bulk or instant automated direct deposit disbursements to merchant bank accounts.
            </p>
          </div>

          <div className="space-y-3">
            {ledgers.map((l) => (
              <div
                key={l.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Order #{l.orderId}</div>
                  <div className="text-slate-500">
                    Gross: ₹{l.grossAmount} • Commission (8%): ₹{l.platformCommission} • Payout: ₹{l.netPayableToMerchant}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      l.settlementStatus === 'SETTLED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {l.settlementStatus}
                  </span>
                  {l.settlementStatus === 'PENDING' && (
                    <button
                      onClick={() => triggerMerchantSettlement(l.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                    >
                      Authorize Payout
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Disputes & Resolutions */}
      {activeTab === 'disputes' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Consumer & Merchant Dispute Resolution</h3>
            <p className="text-xs text-slate-500">
              Review order quality mismatches, delivery delays, and trigger instant escrow release or refunds.
            </p>
          </div>

          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-bold text-xs text-slate-900">{d.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'REFUNDED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.status === 'DISMISSED'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono-code">Order #{d.orderId}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Claimant: {d.claimantName} ({d.claimantRole}) vs {d.merchantName}
                  </div>
                  <p className="text-xs text-slate-600 italic">"{d.description}"</p>
                  <div className="text-[11px] text-slate-400">Disputed Amount: ₹{d.amount} • {d.createdAt}</div>
                </div>

                {d.status === 'OPEN' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resolveDispute(d.id, 'REFUND')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Approve Refund (₹{d.amount})
                    </button>
                    <button
                      onClick={() => resolveDispute(d.id, 'DISMISS')}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Dismiss Claim
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Fraud Radar */}
      {activeTab === 'fraud' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Real-Time Fraud & Anomaly Radar</h3>
              <p className="text-xs text-slate-500">
                Automated rate-limiting, OTP brute-force alarms, and payment tampering detection.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold font-mono-code">
              THREAT LEVEL: LOW
            </span>
          </div>

          <div className="space-y-3">
            {fraudSignals.map((sig) => (
              <div
                key={sig.id}
                className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold font-mono-code">
                      {sig.severity} SEVERITY
                    </span>
                    <span className="font-bold text-xs text-rose-950 font-mono-code">{sig.signalType}</span>
                    <span className="text-[10px] text-slate-500">{sig.timestamp}</span>
                  </div>
                  <div className="text-xs text-slate-700">{sig.details}</div>
                  <div className="text-[10px] text-slate-400 font-mono-code">Target: {sig.userId} ({sig.userRole})</div>
                </div>

                <button
                  onClick={() => triggerToast(`IP and Session blocked for ${sig.userId}`, 'success')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Block Session & Terminate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Authoritative Geo-Radius & Location Engine Policy Management */}
      {activeTab === 'location' && <LocationSettingsTab />}

      {/* Tab 6: Immutable Cryptographic Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Immutable Audit Block Sequence</h3>
              <p className="text-xs text-slate-500">
                Every critical transaction, status change, and payment is hashed into an unalterable audit chain.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold font-mono-code">
              STATUS: ZERO TAMPER DETECTED
            </span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-900 text-white font-mono-code text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="font-bold">BLOCK #{log.id} • {log.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px]">{log.details}</div>
                <div className="text-[10px] text-slate-500 break-all">
                  SHA-256 INTEGRITY HASH: {log.integrityHash}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
