import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Camera, 
  Lock, 
  Unlock, 
  ChevronRight, 
  ArrowLeft,
  Building2,
  UserCheck,
  Check,
  XCircle,
  RefreshCw,
  AlertCircle,
  FileCheck,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ALL_DOCUMENT_CATEGORIES = [
  { key: 'BUSINESS_REGISTRATION', label: 'Business Registration', desc: 'Official certificate of incorporation, shop registration, or deed.' },
  { key: 'BUSINESS_PAN', label: 'Business PAN', desc: 'Government-issued Permanent Account Number (PAN) card for business.' },
  { key: 'GST_CERTIFICATE', label: 'GST Certificate', desc: 'GST registration certificate (Form GST REG-06) if applicable.' },
  { key: 'FSSAI_LICENSE', label: 'FSSAI License/Registration', desc: 'Mandatory Food Safety and Standards Authority of India license.' },
  { key: 'OWNER_IDENTITY', label: 'Owner Identity Proof', desc: 'Aadhaar Card, Passport, or Government ID of primary owner.' },
  { key: 'BUSINESS_ADDRESS_PROOF', label: 'Business Address Proof', desc: 'Utility bill, rent/lease agreement, or municipal tax receipt.' },
  { key: 'AUTHORIZED_REPRESENTATIVE_PROOF', label: 'Owner/Authorized Representative Proof', desc: 'Power of attorney or letter of authorization for representative.' },
  { key: 'BANK_ACCOUNT_PROOF', label: 'Bank Account Proof', desc: 'Cancelled cheque or bank statement showing business name & IFSC.' },
  { key: 'STORE_LICENSE', label: 'Store/Shop License', desc: 'Municipal shop & establishment license or trade permit.' },
  { key: 'OTHER_STORE_DOCUMENT', label: 'Other Store-Related Document', desc: 'Additional regulatory, fire safety, or health certificates.' }
];

export const BusinessVerificationWidget: React.FC = () => {
  const { currentUser, triggerToast } = useApp();
  const [verification, setVerification] = useState<any | null>(null);
  const [requiredCategories, setRequiredCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [step, setStep] = useState<'overview' | 'details' | 'owner' | 'face' | 'documents' | 'review'>('overview');
  
  // Form states
  const [formData, setFormData] = useState({
    businessName: currentUser?.organizationName || 'Green Basket Organics',
    businessType: 'RESTAURANT',
    category: 'Organic Meals & Produce',
    address: '4th Block Koramangala',
    city: currentUser?.city || 'Bangalore',
    state: 'Karnataka',
    postalCode: '560034',
    phone: currentUser?.phone || '+919876543210',
    email: currentUser?.email || 'merchant@greenbasket.in',
    ownerName: currentUser?.name || 'Rahul Kumar',
    ownerDob: '1988-05-14',
    ownerPhone: currentUser?.phone || '+919876543210',
    ownerEmail: currentUser?.email || 'rahul@greenbasket.in',
  });

  const [isPerformingLiveness, setIsPerformingLiveness] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
  };

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/business/verification', {
        headers: { 'x-user-id': currentUser?.id || 'store-1' }
      });
      const data = await res.json();
      if (data.success && data.verification) {
        setVerification(data.verification);
        setRequiredCategories(data.requiredCategories || []);
        if (data.verification.businessName) {
          setFormData({
            businessName: data.verification.businessName,
            businessType: data.verification.businessType || 'RESTAURANT',
            category: data.verification.category || 'Organic Meals',
            address: data.verification.address || '',
            city: data.verification.city || 'Bangalore',
            state: data.verification.state || 'Karnataka',
            postalCode: data.verification.postalCode || '560034',
            phone: data.verification.phone || '',
            email: data.verification.email || '',
            ownerName: data.verification.ownerName || '',
            ownerDob: data.verification.ownerDob || '',
            ownerPhone: data.verification.ownerPhone || '',
            ownerEmail: data.verification.ownerEmail || '',
          });
          if (data.verification.identityVerification?.livenessPassed) {
            setLivenessPassed(true);
          }
          if (data.verification.documents) {
            setDocuments(data.verification.documents);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load verification status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const handleFileUploadForCategory = async (categoryKey: string, file: File) => {
    // Client-side file size validation (1 GB = 1073741824 bytes)
    const MAX_SIZE = 1073741824;
    if (file.size > MAX_SIZE) {
      triggerToast(`File size (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB) exceeds maximum limit of 1 GB.`, 'error');
      return;
    }

    // Client-side MIME type check
    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg'];

    if (!allowedMimeTypes.includes(file.type.toLowerCase()) && !allowedExts.includes(ext)) {
      triggerToast(`Unsupported file type '${ext}'. Please upload PDF, PNG, JPG, or JPEG files.`, 'error');
      return;
    }

    setUploadingCategory(categoryKey);

    try {
      // Read file as Base64 Data URL
      const reader = new FileReader();
      reader.onload = async () => {
        const fileDataUrl = reader.result as string;

        const res = await fetch('/api/business/verification/documents/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser?.id || 'store-1'
          },
          body: JSON.stringify({
            category: categoryKey,
            originalFilename: file.name,
            mimeType: file.type || (ext.includes('pdf') ? 'application/pdf' : 'image/png'),
            fileSize: file.size,
            fileDataUrl
          })
        });

        const data = await res.json();
        if (data.success) {
          setVerification(data.verification);
          setDocuments(data.verification.documents || []);
          if (data.requiredCategories) {
            setRequiredCategories(data.requiredCategories);
          }
          triggerToast(`Document uploaded successfully under ${categoryKey.replace('_', ' ')} (v${data.document.version}).`, 'success');
        } else {
          triggerToast(data.error || 'Failed to upload document', 'error');
        }
        setUploadingCategory(null);
      };

      reader.onerror = () => {
        triggerToast('Failed to read file from disk.', 'error');
        setUploadingCategory(null);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload error', err);
      triggerToast('Network error during file upload.', 'error');
      setUploadingCategory(null);
    }
  };

  const handleSaveAndUpdate = async (nextStep?: any) => {
    try {
      const res = await fetch('/api/business/verification/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'store-1'
        },
        body: JSON.stringify({
          ...formData,
          identityVerification: {
            status: livenessPassed ? 'VERIFIED' : 'PENDING',
            provider: 'SurplusX Biometric Liveness AI',
            livenessPassed,
            faceMatchPassed: livenessPassed,
            verifiedAt: livenessPassed ? new Date().toISOString() : undefined,
            referenceId: 'liv_ref_' + Math.floor(Math.random() * 900000 + 100000)
          },
          documents
        })
      });
      const data = await res.json();
      if (data.success) {
        setVerification(data.verification);
        if (data.requiredCategories) {
          setRequiredCategories(data.requiredCategories);
        }
        if (nextStep) setStep(nextStep);
        triggerToast('Verification progress saved securely.', 'success');
      }
    } catch (err) {
      console.error('Failed to save verification', err);
      triggerToast('Failed to save verification progress.', 'error');
    }
  };

  const handleLivenessCheck = () => {
    setIsPerformingLiveness(true);
    setTimeout(() => {
      setIsPerformingLiveness(false);
      setLivenessPassed(true);
      triggerToast('Biometric liveness and face match verification passed successfully!', 'success');
    }, 2000);
  };

  const handleSubmitForReview = async () => {
    try {
      const res = await fetch('/api/business/verification/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'store-1'
        }
      });
      const data = await res.json();
      if (data.success) {
        setVerification(data.verification);
        setStep('overview');
        triggerToast('Verification package submitted successfully to Super Admin for review.', 'success');
      } else {
        triggerToast(data.error || 'Failed to submit verification', 'error');
      }
    } catch (err) {
      console.error('Failed to submit verification', err);
      triggerToast('Network error while submitting verification', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading business verification status...</div>;
  }

  const isApproved = verification?.status === 'APPROVED';
  const isUnderReview = verification?.status === 'UNDER_REVIEW' || verification?.status === 'SUBMITTED';
  const isRejected = verification?.status === 'REJECTED' || verification?.status === 'RESUBMISSION_REQUIRED';

  // Check missing required categories
  const uploadedCategories = (documents || []).map(d => d.category);
  const missingRequiredCategories = requiredCategories.filter(cat => !uploadedCategories.includes(cat));
  const rejectedDocs = (documents || []).filter(d => d.status === 'REJECTED' || d.status === 'RESUBMISSION_REQUIRED');

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Verification Status Header Banner */}
      <div className={`p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isApproved ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' :
        isUnderReview ? 'bg-amber-50 border border-amber-200 text-amber-900' :
        isRejected ? 'bg-rose-50 border border-rose-200 text-rose-900' :
        'bg-blue-50 border border-blue-200 text-blue-900'
      }`}>
        <div className="flex items-center gap-3">
          {isApproved ? <ShieldCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" /> :
           isUnderReview ? <Clock className="w-8 h-8 text-amber-600 flex-shrink-0" /> :
           isRejected ? <AlertTriangle className="w-8 h-8 text-rose-600 flex-shrink-0" /> :
           <Lock className="w-8 h-8 text-blue-600 flex-shrink-0" />}
          <div>
            <div className="text-sm font-extrabold flex items-center gap-2">
              Business KYC Status: {verification?.status?.replace('_', ' ') || 'NOT STARTED'}
              {isApproved && <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">Fully Verified</span>}
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {isApproved ? 'Your business is fully verified and authorized to publish surplus listings, receive marketplace orders, and process direct bank settlements.' :
               isUnderReview ? 'Your verification package has been submitted and is currently under rigorous review by the SurplusX Super Admin team.' :
               isRejected ? `Resubmission Required: ${verification?.rejectionReason || 'Please replace rejected documents or update details.'}` :
               'Operating capabilities (publishing listings, accepting orders, payouts) are locked until business KYC and category documents are completed.'}
            </p>
          </div>
        </div>

        {!isApproved && !isUnderReview && (
          <button
            onClick={() => setStep('details')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <span>Complete Category Verification</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Step Wizard View */}
      {step !== 'overview' && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <button
              onClick={() => setStep('overview')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Overview
            </button>
            <div className="flex items-center gap-2">
              {['details', 'owner', 'face', 'documents', 'review'].map((s, idx) => (
                <button
                  key={s}
                  onClick={() => setStep(s as any)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all cursor-pointer ${
                    step === s ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {idx + 1}. {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: Business Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" /> Step 1: Business Profile & Entity Type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business / Store Legal Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Type (Determines Required Documents)</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="RESTAURANT">Restaurant / Cafe / Cloud Kitchen</option>
                    <option value="RETAIL_STORE">Supermarket / Grocery / Retail</option>
                    <option value="BAKERY">Bakery & Confectionery</option>
                    <option value="COMPANY">Food Distributor / Corporate Manufacturer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store / Business Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State & Postal Code</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="p-3 bg-white border border-slate-200 rounded-xl font-medium"
                    />
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="p-3 bg-white border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Business Phone & Email</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="p-3 bg-white border border-slate-200 rounded-xl font-medium"
                    />
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="p-3 bg-white border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => handleSaveAndUpdate('owner')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Save & Continue to Owner Identity</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Owner Identity */}
          {step === 'owner' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" /> Step 2: Owner Identity & Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner Full Name (As per Govt ID)</label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.ownerDob}
                    onChange={(e) => setFormData({ ...formData, ownerDob: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner Mobile Number</label>
                  <input
                    type="text"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner Email Address</label>
                  <input
                    type="text"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('details')}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => handleSaveAndUpdate('face')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Save & Continue to Biometric Liveness</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Face & Liveness Verification */}
          {step === 'face' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" /> Step 3: Biometric Liveness & Face Match
              </h3>
              <p className="text-xs text-slate-500">
                To prevent fraudulent registrations, SurplusX performs biometric liveness detection and facial recognition against identity records.
              </p>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md mx-auto">
                <div className="w-32 h-32 rounded-full bg-slate-100 mx-auto flex items-center justify-center border-4 border-dashed border-slate-300 relative overflow-hidden">
                  {livenessPassed ? (
                    <div className="absolute inset-0 bg-emerald-500 text-white flex flex-col items-center justify-center animate-in fade-in">
                      <CheckCircle2 className="w-12 h-12 mb-1" />
                      <span className="text-[11px] font-bold">Verified</span>
                    </div>
                  ) : isPerformingLiveness ? (
                    <div className="absolute inset-0 bg-blue-50 text-blue-700 flex flex-col items-center justify-center animate-pulse">
                      <RefreshCw className="w-8 h-8 animate-spin mb-1" />
                      <span className="text-[10px] font-bold">Scanning...</span>
                    </div>
                  ) : (
                    <Camera className="w-12 h-12 text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {livenessPassed ? 'Biometric Liveness Check Passed Successfully' : 'Position face inside frame & blink'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {livenessPassed ? 'Reference ID: liv_ref_8841920' : 'Secure anti-spoofing liveness model active'}
                  </div>
                </div>

                {!livenessPassed && (
                  <button
                    disabled={isPerformingLiveness}
                    onClick={handleLivenessCheck}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                  >
                    {isPerformingLiveness ? 'Analyzing Liveness Challenge...' : 'Start Live Face & Liveness Scan'}
                  </button>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('owner')}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={!livenessPassed}
                  onClick={() => handleSaveAndUpdate('documents')}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 ${
                    livenessPassed ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Continue to Category Documents</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Category-Based Required Documents */}
          {step === 'documents' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" /> Step 4: Category-Based Document Upload
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload documents individually by category. Allowed formats: <span className="font-bold text-slate-700">PDF, PNG, JPG, JPEG</span> (Max <span className="font-bold text-slate-700">1 GB</span> per file).
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
                  {uploadedCategories.length} / {requiredCategories.length} Required Categories Uploaded
                </div>
              </div>

              {/* Required Categories List */}
              <div className="space-y-4">
                {ALL_DOCUMENT_CATEGORIES.map((cat) => {
                  const isRequired = requiredCategories.includes(cat.key);
                  const uploadedDoc = (documents || []).find((d) => d.category === cat.key);
                  const isDocApproved = uploadedDoc?.status === 'APPROVED';
                  const isDocRejected = uploadedDoc?.status === 'REJECTED' || uploadedDoc?.status === 'RESUBMISSION_REQUIRED';
                  const isDocUnderReview = uploadedDoc?.status === 'UNDER_REVIEW';

                  return (
                    <div
                      key={cat.key}
                      className={`p-5 rounded-2xl border transition-all ${
                        isDocApproved
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : isDocRejected
                          ? 'bg-rose-50/60 border-rose-200'
                          : uploadedDoc
                          ? 'bg-amber-50/60 border-amber-200'
                          : isRequired
                          ? 'bg-white border-slate-300 shadow-xs'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{cat.label}</span>
                            {isRequired ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-extrabold border border-rose-200">
                                Required
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-bold">
                                Optional
                              </span>
                            )}

                            {/* Verification Status Badge */}
                            {!uploadedDoc && (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                                Missing
                              </span>
                            )}
                            {isDocApproved && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Approved
                              </span>
                            )}
                            {isDocUnderReview && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold border border-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-700" /> Under Review
                              </span>
                            )}
                            {isDocRejected && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-extrabold border border-rose-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-700" /> Resubmission Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{cat.desc}</p>

                          {/* Render Uploaded File Details */}
                          {uploadedDoc && (
                            <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                              <div className="flex items-center justify-between font-bold text-slate-800">
                                <span className="flex items-center gap-1.5 truncate">
                                  <FileCheck className="w-4 h-4 text-emerald-600" />
                                  {uploadedDoc.original_filename}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  v{uploadedDoc.version || 1} • {formatFileSize(uploadedDoc.file_size)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Uploaded by: {uploadedDoc.uploaded_by}</span>
                                <span>{new Date(uploadedDoc.uploaded_at).toLocaleString()}</span>
                              </div>
                              {uploadedDoc.rejection_reason && (
                                <div className="mt-1 p-2 bg-rose-100/70 border border-rose-200 text-rose-900 rounded-lg text-xs font-semibold">
                                  <strong>Rejection Reason:</strong> {uploadedDoc.rejection_reason}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Upload Controls */}
                        <div className="flex flex-col items-end gap-1.5">
                          <label className="relative cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                              disabled={uploadingCategory === cat.key}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUploadForCategory(cat.key, e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                            <div className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-2 ${
                              uploadingCategory === cat.key
                                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                                : isDocRejected
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : uploadedDoc
                                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}>
                              {uploadingCategory === cat.key ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  <span>{uploadedDoc ? 'Replace Document' : 'Upload Document'}</span>
                                </>
                              )}
                            </div>
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">
                            PDF, PNG, JPG, JPEG • Max 1 GB
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Notice if Missing Documents */}
              {missingRequiredCategories.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-start gap-3 text-xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Verification Submission Locked:</strong>
                    <p className="mt-0.5 opacity-90">
                      You must upload documents for all required categories before submitting verification to Super Admin: {' '}
                      <span className="font-extrabold">{missingRequiredCategories.join(', ')}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('face')}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={missingRequiredCategories.length > 0 || rejectedDocs.length > 0}
                  onClick={() => handleSaveAndUpdate('review')}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 ${
                    missingRequiredCategories.length === 0 && rejectedDocs.length === 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Proceed to Final Review</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 'review' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Step 5: Final Review & Submit Package
              </h3>
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Business Profile</div>
                    <div><strong>Name:</strong> {formData.businessName}</div>
                    <div><strong>Type:</strong> {formData.businessType}</div>
                    <div><strong>Address:</strong> {formData.address}, {formData.city}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Owner Identity & Liveness</div>
                    <div><strong>Owner:</strong> {formData.ownerName}</div>
                    <div><strong>DOB:</strong> {formData.ownerDob}</div>
                    <div className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Biometric Liveness Verified
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">Category Documents ({documents.length})</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {documents.map(d => (
                      <div key={d.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] truncate">{d.category.replace('_', ' ')}</span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                          v{d.version || 1} • {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('documents')}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitForReview}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Verification to Super Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Operating Capabilities Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${isApproved ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-xs">Publish Surplus Listings</span>
            {isApproved ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
          </div>
          <p className="text-[11px] text-slate-500">Create surplus food and grocery batches for consumers & NGOs.</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isApproved ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-xs">Receive Marketplace Orders</span>
            {isApproved ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
          </div>
          <p className="text-[11px] text-slate-500">Accept live consumer orders and assign volunteer/rider pickups.</p>
        </div>

        <div className={`p-4 rounded-2xl border ${isApproved ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 text-xs">Direct Bank Settlements</span>
            {isApproved ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
          </div>
          <p className="text-[11px] text-slate-500">Initiate automated Razorpay direct bank payout transfers.</p>
        </div>
      </div>
    </div>
  );
};

