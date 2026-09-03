import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  XCircle, 
  Check, 
  Building2, 
  UserCheck, 
  FileText, 
  Search, 
  Filter, 
  Lock, 
  Unlock,
  ExternalLink,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  History,
  FileCheck,
  AlertCircle,
  Mail,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminVerificationView: React.FC = () => {
  const { currentUser, triggerToast } = useApp();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Review form state
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Document expired or unreadable');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Secure document viewing state
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);
  const [signedDocUrl, setSignedDocUrl] = useState<string | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Document action state
  const [reviewingDocTarget, setReviewingDocTarget] = useState<any | null>(null);
  const [docRejectionReason, setDocRejectionReason] = useState('Document unreadable or invalid formatting');
  const [docReviewNotes, setDocReviewNotes] = useState('');

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/business-verifications');
      const data = await res.json();
      if (data.success) {
        setVerifications(data.verifications || []);
      }
    } catch (err) {
      console.error('Failed to load business verifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
  };

  const openSecureDocumentViewer = async (doc: any) => {
    try {
      setViewingDoc(doc);
      setSignedDocUrl(null);
      setIsLoadingDoc(true);
      setZoomLevel(1);
      setRotationAngle(0);

      const res = await fetch(`/api/admin/business-verifications/documents/${doc.id}/signed-view`);
      const data = await res.json();
      if (data.success && data.signedUrl) {
        setSignedDocUrl(data.signedUrl);
      } else {
        triggerToast(data.error || 'Failed to generate secure viewing link', 'error');
      }
    } catch (err) {
      console.error('Error opening document viewer', err);
      triggerToast('Network error while opening secure document viewer', 'error');
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleDocumentReview = async (docId: string, status: 'APPROVED' | 'REJECTED', rejectionReasonText?: string) => {
    try {
      setIsSubmittingReview(true);
      const res = await fetch(`/api/admin/business-verifications/documents/${docId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          rejection_reason: rejectionReasonText || docRejectionReason,
          notes: docReviewNotes,
          reviewed_by: currentUser?.name || 'SUPER_ADMIN'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCase(data.verification);
        setVerifications(verifications.map(v => v.id === data.verification.id ? data.verification : v));
        triggerToast(`Document ${status === 'APPROVED' ? 'Approved' : 'Rejected'} successfully.`, 'success');
        setReviewingDocTarget(null);
      } else {
        triggerToast(data.error || 'Failed to review document', 'error');
      }
    } catch (err) {
      console.error('Document review error', err);
      triggerToast('Network error during document review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleFinalBusinessApprove = async () => {
    if (!selectedCase) return;
    try {
      setIsSubmittingReview(true);
      const res = await fetch(`/api/admin/business-verifications/${selectedCase.id}/approve-business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: currentUser?.name || 'SUPER_ADMIN',
          notes: adminNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCase(data.verification);
        setVerifications(verifications.map(v => v.id === data.verification.id ? data.verification : v));
        triggerToast('Business APPROVED and full marketplace capabilities activated!', 'success');
      } else {
        triggerToast(data.error || 'Cannot approve business', 'error');
      }
    } catch (err) {
      console.error('Business approval error', err);
      triggerToast('Network error during business approval', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOverallReviewAction = async (action: 'APPROVE' | 'REJECT' | 'RESUBMISSION_REQUIRED') => {
    if (!selectedCase) return;

    if (action === 'APPROVE') {
      await handleFinalBusinessApprove();
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await fetch(`/api/admin/business-verifications/${selectedCase.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason,
          adminNotes,
          adminName: currentUser?.name || 'Super Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        setVerifications(data.verifications);
        setSelectedCase(data.verification);
        triggerToast(`Successfully updated business state to ${action}`, 'success');
      } else {
        triggerToast(data.error || 'Failed to update verification status', 'error');
      }
    } catch (err) {
      console.error('Review action failed', err);
      triggerToast('Network error during review action', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRetryEmail = async () => {
    if (!selectedCase) return;
    try {
      setIsSubmittingReview(true);
      const res = await fetch(`/api/admin/business-verifications/${selectedCase.id}/retry-email`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCase(data.verification);
        setVerifications(verifications.map(v => v.id === data.verification.id ? data.verification : v));
        triggerToast(data.message || 'Email notification dispatched successfully', 'success');
      } else {
        triggerToast(data.error || 'Failed to dispatch email', 'error');
      }
    } catch (err) {
      console.error('Email retry error', err);
      triggerToast('Network error while dispatching email', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const pendingCount = verifications.filter(v => v.status === 'UNDER_REVIEW' || v.status === 'SUBMITTED').length;
  const approvedCount = verifications.filter(v => v.status === 'APPROVED').length;
  const rejectedCount = verifications.filter(v => v.status === 'REJECTED' || v.status === 'RESUBMISSION_REQUIRED').length;

  const filteredVerifications = verifications.filter(v => {
    const matchesFilter = filterStatus === 'ALL' || v.status === filterStatus;
    const matchesSearch = (v.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (v.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (v.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-600" /> Business KYC & Verification Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review live owner identity, biometric liveness checks, FSSAI licenses, and category-based documents before marketplace activation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {pendingCount} Pending Review
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending / Under Review</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Awaiting Super Admin decision</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved & Active</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{approvedCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Full marketplace capabilities unlocked</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected / Resubmission</div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">{rejectedCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Requires merchant correction</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Queue Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search business, owner, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUIRED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === status
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Records' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Verification Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading verification queue...</div>
        ) : filteredVerifications.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Verification Records Found</h3>
            <p className="text-xs text-slate-500 mt-1">No businesses match the selected search or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Business Name & Type</th>
                  <th className="p-4">Owner / Authorized Rep</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Identity & Biometrics</th>
                  <th className="p-4">KYC Status</th>
                  <th className="p-4">Email Status</th>
                  <th className="p-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredVerifications.map((v) => {
                  const isApproved = v.status === 'APPROVED';
                  const isPending = v.status === 'UNDER_REVIEW' || v.status === 'SUBMITTED';
                  const isRejected = v.status === 'REJECTED' || v.status === 'RESUBMISSION_REQUIRED';
                  const emailDelivered = v.email_status === 'DELIVERED';
                  const emailFailed = v.email_status === 'FAILED';
                  
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{v.businessName}</div>
                        <div className="text-[11px] text-slate-400">{v.businessType} • {v.category}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{v.ownerName}</div>
                        <div className="text-[11px] text-slate-400">{v.ownerPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800">{v.city}, {v.state}</div>
                        <div className="text-[11px] text-slate-400">{v.postalCode}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Liveness & Face Verified</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Ref: {v.identityVerification?.referenceId || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border ${
                          isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          isPending ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          {v.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        {emailDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Mail className="w-3 h-3 text-emerald-600" /> Sent
                          </span>
                        ) : emailFailed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" /> Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedCase(v);
                            setAdminNotes(v.adminNotes || '');
                            setRejectionReason(v.rejectionReason || 'Document expired or unreadable');
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1 text-[11px]"
                        >
                          Review Case <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Review Modal / Drawer */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Case ID: {selectedCase.id}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedCase.businessName}</h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl flex items-center justify-between ${
                selectedCase.status === 'APPROVED' ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' :
                selectedCase.status === 'UNDER_REVIEW' ? 'bg-amber-50 border border-amber-200 text-amber-900' :
                'bg-rose-50 border border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-3">
                  {selectedCase.status === 'APPROVED' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 text-amber-600" />}
                  <div>
                    <div className="font-bold text-sm">Current Verification State: {selectedCase.status.replace('_', ' ')}</div>
                    <div className="text-xs opacity-80">
                      {selectedCase.status === 'APPROVED' ? 'Business is active and fully authorized to publish listings and receive marketplace orders.' : 'Review each document category individually before granting final approval.'}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-white/80 rounded-xl border">
                  {selectedCase.businessType}
                </div>
              </div>

              {/* Grid: Business Info & Owner Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" /> Business Information
                  </h4>
                  <div className="text-xs space-y-1.5">
                    <div><strong>Business Name:</strong> {selectedCase.businessName}</div>
                    <div><strong>Category:</strong> {selectedCase.category}</div>
                    <div><strong>Address:</strong> {selectedCase.address}, {selectedCase.city}, {selectedCase.state} - {selectedCase.postalCode}</div>
                    <div><strong>Business Phone:</strong> {selectedCase.phone}</div>
                    <div><strong>Business Email:</strong> {selectedCase.email}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" /> Owner / Authorized Person KYC
                  </h4>
                  <div className="text-xs space-y-1.5">
                    <div><strong>Owner Name:</strong> {selectedCase.ownerName}</div>
                    <div><strong>Date of Birth:</strong> {selectedCase.ownerDob}</div>
                    <div><strong>Owner Phone:</strong> {selectedCase.ownerPhone}</div>
                    <div><strong>Owner Email:</strong> {selectedCase.ownerEmail}</div>
                    <div className="pt-1 flex items-center gap-2 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live Liveness & Face Match Passed
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents & Individual Category Reviews */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" /> Category Compliance Documents ({(selectedCase.documents || []).length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Individual document approval required</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(selectedCase.documents || []).map((doc: any) => {
                    const isDocApproved = doc.status === 'APPROVED';
                    const isDocRejected = doc.status === 'REJECTED' || doc.status === 'RESUBMISSION_REQUIRED';

                    return (
                      <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">{doc.category.replace('_', ' ')}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border">
                                v{doc.version || 1}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                isDocApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                isDocRejected ? 'bg-rose-100 text-rose-800 border-rose-200' :
                                'bg-amber-100 text-amber-800 border-amber-200'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                              <span><strong>File:</strong> {doc.original_filename}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>•</span>
                              <span>{doc.mime_type}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openSecureDocumentViewer(doc)}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" /> View Original Document
                            </button>
                          </div>
                        </div>

                        {/* Document details & version history */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                            <div><strong>Uploaded By:</strong> {doc.uploaded_by}</div>
                            <div><strong>Uploaded At:</strong> {new Date(doc.uploaded_at).toLocaleString()}</div>
                            <div><strong>Storage Key:</strong> <span className="font-mono text-[10px] text-slate-600">{doc.storage_key}</span></div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                            <div><strong>Review Status:</strong> {doc.status}</div>
                            {doc.reviewed_by && <div><strong>Reviewed By:</strong> {doc.reviewed_by}</div>}
                            {doc.rejection_reason && <div className="text-rose-700 font-bold"><strong>Reason:</strong> {doc.rejection_reason}</div>}
                          </div>
                        </div>

                        {/* Document Version History Drawer */}
                        {doc.history && doc.history.length > 0 && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                              <History className="w-3.5 h-3.5 text-slate-500" />
                              <span>Document Replacement History ({doc.history.length} Previous Versions Archived)</span>
                            </div>
                            <div className="space-y-1.5">
                              {doc.history.map((prev: any, hIdx: number) => (
                                <div key={hIdx} className="bg-white p-2 rounded-lg border text-[11px] flex justify-between items-center text-slate-600">
                                  <div>
                                    <strong>v{prev.version}</strong>: {prev.original_filename} ({formatFileSize(prev.file_size)})
                                    <span className="text-slate-400 block text-[10px]">{new Date(prev.archived_at || prev.uploaded_at).toLocaleString()}</span>
                                  </div>
                                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                                    {prev.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Individual Document Review Controls */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          {isDocRejected ? (
                            <span className="text-xs font-bold text-rose-600">Document Rejected — Merchant notified to replace</span>
                          ) : (
                            <>
                              <button
                                onClick={() => setReviewingDocTarget(doc)}
                                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                              >
                                Reject Document
                              </button>
                              <button
                                disabled={isSubmittingReview || isDocApproved}
                                onClick={() => handleDocumentReview(doc.id, 'APPROVED')}
                                className={`px-4 py-1.5 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                                  isDocApproved
                                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                {isDocApproved ? 'Document Approved' : 'Approve Document'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Automated Email Notification Engine Status Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" /> Automated Email Notification Engine
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    Sender: surplusx.support@gmail.com
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>Recipient: {selectedCase.email || selectedCase.ownerEmail}</span>
                      {selectedCase.email_status === 'DELIVERED' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                          DELIVERED
                        </span>
                      ) : selectedCase.email_status === 'FAILED' ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-rose-200">
                          FAILED
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-slate-200">
                          NOT SENT YET
                        </span>
                      )}
                    </div>
                    {selectedCase.email_last_sent_at && (
                      <div className="text-[11px] text-slate-500">
                        Last Sent: {new Date(selectedCase.email_last_sent_at).toLocaleString('en-IN')}
                        {selectedCase.email_message_id ? ` • ID: ${selectedCase.email_message_id.substring(0, 16)}...` : ''}
                      </div>
                    )}
                    {selectedCase.email_last_error && (
                      <div className="text-[11px] text-rose-600 font-medium">
                        Error: {selectedCase.email_last_error}
                      </div>
                    )}
                  </div>

                  <button
                    disabled={isSubmittingReview}
                    onClick={handleRetryEmail}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Resend Email Notification
                  </button>
                </div>
              </div>

              {/* Verification Audit Trail */}
              {selectedCase.auditLogs && selectedCase.auditLogs.length > 0 && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" /> Verification & Email Audit History
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedCase.auditLogs.slice().reverse().map((log: any, idx: number) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/60 text-[11px] flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">• By {log.actor}</span>
                          <p className="text-slate-600 mt-0.5 leading-tight">{log.details}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Business Review Decision Controls */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Final Business Decision</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Super Admin Notes / Remarks</label>
                    <textarea
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Enter verification decision remarks..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Rejection / Resubmission Reason</label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Document expired or unreadable">Document expired or unreadable</option>
                      <option value="Owner name mismatch with business records">Owner name mismatch with business records</option>
                      <option value="FSSAI license number invalid or inactive">FSSAI license number invalid or inactive</option>
                      <option value="Live face verification failed / liveness challenge missed">Live face verification failed / liveness challenge missed</option>
                      <option value="Bank account proof does not match business name">Bank account proof does not match business name</option>
                      <option value="Missing required category compliance documents">Missing required category compliance documents</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    disabled={isSubmittingReview}
                    onClick={() => handleOverallReviewAction('RESUBMISSION_REQUIRED')}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Request Business Resubmission
                  </button>
                  <button
                    disabled={isSubmittingReview}
                    onClick={() => handleOverallReviewAction('REJECT')}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Reject Business Registration
                  </button>
                  <button
                    disabled={isSubmittingReview}
                    onClick={() => handleOverallReviewAction('APPROVE')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" /> Approve & Activate Business
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Document Rejection Modal */}
      {reviewingDocTarget && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Reject Document: {reviewingDocTarget.category.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-500">
              Please select a specific rejection reason for <span className="font-bold text-slate-800">{reviewingDocTarget.original_filename}</span>. The merchant will be required to upload a new version.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason</label>
                <select
                  value={docRejectionReason}
                  onChange={(e) => setDocRejectionReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Document image blur or unreadable">Document image blur or unreadable</option>
                  <option value="Expired license or identification document">Expired license or identification document</option>
                  <option value="Business title mismatch on document">Business title mismatch on document</option>
                  <option value="Incomplete document or missing pages">Incomplete document or missing pages</option>
                  <option value="Incorrect document category uploaded">Incorrect document category uploaded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Reviewer Notes</label>
                <textarea
                  rows={2}
                  value={docReviewNotes}
                  onChange={(e) => setDocReviewNotes(e.target.value)}
                  placeholder="Instructions for merchant when uploading replacement..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setReviewingDocTarget(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingReview}
                onClick={() => handleDocumentReview(reviewingDocTarget.id, 'REJECTED')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Secure Document Viewer Modal (PDF iframe & Image Zoom/Rotate) */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] p-6 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {viewingDoc.category?.replace('_', ' ')} • Version {viewingDoc.version || 1}
                </span>
                <h4 className="font-extrabold text-slate-900 text-base mt-1">{viewingDoc.original_filename}</h4>
                <p className="text-[11px] text-slate-400 font-mono">Short-lived Signed URL • Encrypted Storage Access</p>
              </div>
              <button
                onClick={() => {
                  setViewingDoc(null);
                  setSignedDocUrl(null);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document Viewer Workspace */}
            <div className="bg-slate-900 rounded-2xl flex-1 min-h-[450px] max-h-[600px] relative overflow-hidden flex items-center justify-center p-4">
              {isLoadingDoc ? (
                <div className="text-center text-white space-y-2">
                  <Clock className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <div className="text-xs font-bold">Retrieving authorized original file...</div>
                </div>
              ) : signedDocUrl ? (
                viewingDoc.mime_type?.includes('pdf') || viewingDoc.original_filename?.endsWith('.pdf') ? (
                  /* PDF Interactive Viewer Frame */
                  <iframe
                    src={signedDocUrl}
                    className="w-full h-full min-h-[500px] rounded-xl border-0 bg-white"
                    title="Original Business PDF Document"
                  />
                ) : (
                  /* Image Zoom & Rotate Interactive Viewer */
                  <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                    <img
                      src={signedDocUrl}
                      alt={viewingDoc.original_filename}
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
                        transition: 'transform 0.2s ease-out'
                      }}
                      className="max-h-[500px] object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                )
              ) : (
                <div className="text-center text-slate-400 space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <div className="text-xs font-bold text-white">Unable to render document preview</div>
                </div>
              )}
            </div>

            {/* Viewer Toolbar Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {/* Zoom & Rotate Controls (For Images) */}
                {signedDocUrl && !(viewingDoc.mime_type?.includes('pdf') || viewingDoc.original_filename?.endsWith('.pdf')) && (
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                    <button
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                      className="p-1.5 bg-white hover:bg-slate-200 rounded-lg font-bold text-slate-700 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold px-2 text-slate-700">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                      className="p-1.5 bg-white hover:bg-slate-200 rounded-lg font-bold text-slate-700 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRotationAngle((rotationAngle + 90) % 360)}
                      className="p-1.5 bg-white hover:bg-slate-200 rounded-lg font-bold text-slate-700 cursor-pointer"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="text-xs text-slate-500 font-mono">
                  {formatFileSize(viewingDoc.file_size)} • {viewingDoc.mime_type}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {signedDocUrl && (
                  <a
                    href={signedDocUrl}
                    download={viewingDoc.original_filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Original File
                  </a>
                )}
                <button
                  onClick={() => {
                    setViewingDoc(null);
                    setSignedDocUrl(null);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

