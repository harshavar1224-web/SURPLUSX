import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Search,
  FileText,
  Mail,
  Building,
  MapPin,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Database,
  Trash2,
  ExternalLink,
  UserCheck,
  Award,
  Sparkles,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PrivacyPolicyView: React.FC = () => {
  const { setActiveView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  // Privacy Request Form State
  const [requestType, setRequestType] = useState<'DATA_EXPORT' | 'DATA_CORRECTION' | 'ACCOUNT_DELETION' | 'CONSENT_WITHDRAWAL'>('DATA_EXPORT');
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqDetails, setReqDetails] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqSuccessMsg, setReqSuccessMsg] = useState('');

  const handlePrivacyRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqEmail.trim()) return;

    setIsSubmittingReq(true);
    setReqSuccessMsg('');
    try {
      const res = await fetch('/api/privacy/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType,
          requesterName: reqName.trim(),
          requesterEmail: reqEmail.trim(),
          details: reqDetails.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReqSuccessMsg(data.message || 'Privacy request submitted successfully!');
        setReqName('');
        setReqEmail('');
        setReqDetails('');
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const policyMetadata = {
    title: 'SurplusX Privacy Policy',
    version: 'v1.0',
    lastUpdated: 'September 2, 2026',
    effectiveDate: 'September 2, 2026',
    contactEmail: 'surplusx.support@gmail.com'
  };

  const sections = [
    { id: 'overview', title: '1. Introduction & Legal Framework' },
    { id: 'info-collected', title: '2. Information We Collect' },
    { id: 'location-gps', title: '3. Location & GPS Data Usage' },
    { id: 'business-docs', title: '4. Business Verification Documents' },
    { id: 'identity-verification', title: '5. Identity & Hardware Verification' },
    { id: 'use-of-data', title: '6. How We Use Your Information' },
    { id: 'payments-escrow', title: '7. Payments, Escrow & Financial Data' },
    { id: 'coupons-referrals', title: '8. Coupons, Rewards & Surplus Points' },
    { id: 'third-party', title: '9. Third-Party Service Providers' },
    { id: 'security-retention', title: '10. Data Security & Retention' },
    { id: 'user-rights', title: '11. Your Privacy Rights & Requests' },
    { id: 'cookies-storage', title: '12. Cookies & Local Storage' },
    { id: 'account-deletion', title: '13. Account Deletion Workflow' },
    { id: 'children-privacy', title: '14. Children\'s Privacy' },
    { id: 'updates-contact', title: '15. Policy Updates & Contact' },
  ];

  const handleScrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredSections = sections.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <button
            onClick={() => {
              window.history.pushState(null, '', '/');
              setActiveView('landing');
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/80"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Official SurplusX Legal Document</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                How SurplusX collects, protects, processes, and respects user data across Consumers, Verified Businesses, NGOs, and Delivery Partners.
              </p>
            </div>

            {/* Version Metadata Card */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl text-xs space-y-2 shrink-0 md:w-72 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400 font-medium">Policy Version:</span>
                <span className="font-extrabold text-emerald-400 font-mono">{policyMetadata.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Last Updated:</span>
                <span className="text-slate-200 font-semibold">{policyMetadata.lastUpdated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Effective Date:</span>
                <span className="text-slate-200 font-semibold">{policyMetadata.effectiveDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Table of Contents (Sticky on Desktop) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-xl border border-slate-200/80 sticky top-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Table of Contents
                </h3>
                <button
                  onClick={() => window.print()}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  title="Print Privacy Policy"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>

              {/* Quick Filter Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search policy sections..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              {/* Navigation List */}
              <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => handleScrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer ${
                      activeSection === sec.id
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      activeSection === sec.id ? 'text-emerald-600 translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                    }`} />
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">Need Privacy Support?</p>
                <p>Email our Data Governance Officer:</p>
                <a href={`mailto:${policyMetadata.contactEmail}`} className="font-semibold text-emerald-700 hover:underline">
                  {policyMetadata.contactEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Main Legal Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section 1: Overview */}
            <section id="overview" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">1. Introduction & Legal Framework</h2>
                  <p className="text-xs text-slate-500">Scope of privacy commitment for SurplusX Platform</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  Welcome to <strong>SurplusX</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). SurplusX operates a dual-purpose digital surplus food marketplace connecting food merchants (&quot;Businesses&quot;), non-profit organizations (&quot;NGOs&quot;), consumers, and delivery partners (&quot;Riders&quot;) to eliminate edible food waste and promote sustainable food security.
                </p>
                <p>
                  This Privacy Policy details our policies regarding the collection, processing, storage, sharing, and protection of personal and organizational data when you use the SurplusX web application, mobile interfaces, and associated API services. By registering an account or accessing SurplusX, you acknowledge that you have read and understood this policy.
                </p>
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-emerald-950 font-medium space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Core Privacy Commitment</span>
                  </div>
                  <p className="text-[11px]">
                    SurplusX never sells, rents, or monetizes personal identity, location logs, or business compliance documents. All data collection serves strictly operational food rescue, safety compliance, 1:1 hardware security, and transaction escrow settlement.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Info Collected */}
            <section id="info-collected" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
                  <p className="text-xs text-slate-500">Categorized breakdown by user role</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                {/* Consumer */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" /> A. Consumer Users
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Account Profile:</strong> Full name, verified email address, verified Indian 10-digit mobile number, city.</li>
                    <li><strong>Transactional History:</strong> Rescued food order records, reservation statuses, 4-digit OTP pickup codes, item receipts.</li>
                    <li><strong>Financial Metadata:</strong> Payment transaction reference IDs, payment method tokens (Razorpay/UPI IDs - raw credit/debit card numbers are never stored on SurplusX servers).</li>
                    <li><strong>Rewards & Points:</strong> Surplus Points ledger, streak histories, active coupon redemptions, referral codes.</li>
                    <li><strong>User Content:</strong> Ratings, feedback, support messages, and food quality dispute logs.</li>
                  </ul>
                </div>

                {/* Business */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-600" /> B. Business / Merchant Users
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Store Profile:</strong> Commercial store name, proprietor/manager contact name, store category, physical street address, geo-coordinates.</li>
                    <li><strong>Verification Compliance:</strong> Food license/FSSAI registration number, PAN/GST numbers (where applicable), trade registration certificates.</li>
                    <li><strong>Verification Documents:</strong> Uploaded government & food safety compliance documents (PDF, PNG, JPG up to 1GB).</li>
                    <li><strong>Settlement Accounts:</strong> Bank account details, IFSC code, UPI VPA for automated escrow payout settlements.</li>
                  </ul>
                </div>

                {/* NGO */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" /> C. Non-Profit / NGO Partners
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Organization Profile:</strong> Registered NGO entity name, authorized representative name, official contact details, service area radius.</li>
                    <li><strong>Exemption Credentials:</strong> 80G tax registration number, NGO Darpan ID, society registration certificates.</li>
                    <li><strong>Donation Telemetry:</strong> Bulk food donation claim records, distribution receipts, 80G tax receipt acknowledgments.</li>
                  </ul>
                </div>

                {/* Technical */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" /> D. Technical & Security Logs
                  </h3>
                  <p>
                    IP addresses, browser/device user-agent strings, device fingerprint hashes (used for 1:1 hardware security binding to prevent fraud), authentication timestamp logs, and system diagnostic logs.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Location & GPS */}
            <section id="location-gps" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">3. Location & GPS Data Usage</h2>
                  <p className="text-xs text-slate-500">Proximity calculations, interactive maps, and live logistics</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  Location data is central to rescuing surplus food before expiration. SurplusX handles location with strict access boundaries:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Current Location
                    </div>
                    <p className="text-[11px] text-slate-500">
                      With explicit browser permission, we request current GPS coordinates to calculate real-time distance (in km) to nearby food listings.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-600" /> Stored Store Location
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Merchant store addresses and coordinates are publicly displayed on interactive maps to guide consumer pickup.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" /> Live Delivery Telemetry
                    </div>
                    <p className="text-[11px] text-slate-500">
                      For delivery orders, active rider GPS locations are streamed during fulfillment and expire immediately upon order completion.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Note: SurplusX does not track or store background location when the application is closed or idle.
                </p>
              </div>
            </section>

            {/* Section 4: Business Documents */}
            <section id="business-docs" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">4. Business Verification Documents Privacy</h2>
                  <p className="text-xs text-slate-500">Secure document processing standards (PDF, PNG, JPG up to 1GB)</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  To enforce strict food safety and legal compliance, business merchants and NGOs submit verification documents (FSSAI licenses, business registrations, identity proofs).
                </p>
                <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Technical Document Protection Specs:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                    <li><strong>Supported Formats & Size:</strong> PDF, PNG, JPG, JPEG formats up to 1GB per document.</li>
                    <li><strong>Isolated Storage Architecture:</strong> Original uploaded files are placed directly into private object storage buckets. The application database stores reference metadata only—never raw file buffers or JSON base64 strings.</li>
                    <li><strong>Short-Lived Signed Token Proxy:</strong> Admin document viewing is powered by `/api/admin/business-verifications/documents/view-secure/:token` using short-lived cryptographic signed tokens expiring in 15 minutes.</li>
                    <li><strong>Zero Public Exposure:</strong> Document files are never publicly accessible, indexed by search engines, or exposed via static CDN paths.</li>
                    <li><strong>Audit Logging:</strong> Every document upload, review, view, approval, rejection, or replacement triggers an immutable audit entry recording administrator identity and timestamp.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: Identity & Hardware */}
            <section id="identity-verification" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">5. Identity & Hardware Security</h2>
                  <p className="text-xs text-slate-500">1:1 Device binding and fraud prevention</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  SurplusX uses authoritative dual-verification (1 Verified Email + 1 Verified Indian Mobile Number + 1 User Role).
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li><strong>Hardware Binding:</strong> Accounts are bound to hardware device fingerprints to prevent multi-account referral abuse or promo code fraud.</li>
                  <li><strong>No Biometric Sale:</strong> SurplusX does not sell, extract, or share biometric templates or facial scan geometry with external ad networks or third parties.</li>
                  <li><strong>Verification Outcomes:</strong> Verification decisions (APPROVED, REJECTED, RESUBMISSION_REQUIRED) are logged securely for compliance auditing.</li>
                </ul>
              </div>
            </section>

            {/* Section 6: How We Use Info */}
            <section id="use-of-data" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">6. How We Use Your Information</h2>
                  <p className="text-xs text-slate-500">Operational processing purposes</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>We process collected information strictly for:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">Order Fulfillment</span>
                    <p className="text-[11px] text-slate-500">Connecting consumers with store listings, issuing 4-digit pickup OTPs, and handling pickup/delivery.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">Escrow & Settlements</span>
                    <p className="text-[11px] text-slate-500">Calculating merchant payouts, deducting platform commission, and triggering bank settlements.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">Food Safety Compliance</span>
                    <p className="text-[11px] text-slate-500">Verifying FSSAI licenses, managing batch expiry alerts, and handling quality reports.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">Automated Notifications</span>
                    <p className="text-[11px] text-slate-500">Sending verification approvals, order receipts, and support updates via email and SMS.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Payments & Escrow */}
            <section id="payments-escrow" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  7
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">7. Payments, Escrow & Financial Data</h2>
                  <p className="text-xs text-slate-500">PCI-DSS payment processing & escrow safeguards</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  All customer payments on SurplusX pass through PCI-DSS compliant payment gateways (Razorpay, UPI).
                </p>
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                  <span className="font-bold text-emerald-950 block">SurplusX Escrow Protection Protocol:</span>
                  <p className="text-emerald-900 text-[11px]">
                    Customer payments are held in escrow until successful order completion verified by the merchant scanning/verifying the consumer&apos;s unique 4-digit pickup OTP. In case of non-conforming or spoiled items reported within the dispute window, funds remain protected in escrow pending review.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8: Coupons & Rewards */}
            <section id="coupons-referrals" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  8
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">8. Coupons, Rewards & Surplus Points</h2>
                  <p className="text-xs text-slate-500">Gamification points ledger and referral tracking</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  Surplus Points and referral rewards are tracked in an internal digital ledger. Referral code activity is logged alongside referrer and referee IDs to enforce one-time bonus rules and detect bot accounts.
                </p>
              </div>
            </section>

            {/* Section 9: Third Party */}
            <section id="third-party" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  9
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">9. Third-Party Service Providers</h2>
                  <p className="text-xs text-slate-500">Authorized data processors</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>We work with trusted third-party service providers bound by strict confidentiality:</p>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Maps & Location Provider</span>
                      <span className="text-[11px] text-slate-500">Mappls (MapmyIndia) & Google Maps Platform for reverse geocoding and routing.</span>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Essential</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Payment Processor</span>
                      <span className="text-[11px] text-slate-500">Razorpay / Bank UPI Gateways for PCI-compliant checkout.</span>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Essential</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Transactional Email Engine</span>
                      <span className="text-[11px] text-slate-500">NodeMailer / SMTP Relay Service for transactional emails.</span>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Essential</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Security & Retention */}
            <section id="security-retention" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  10
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">10. Data Security & Retention Rules</h2>
                  <p className="text-xs text-slate-500">Encryption standards and statutory retention schedules</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  <strong>Encryption:</strong> Data in transit is protected using TLS 1.3 encryption. Sensitive document references and session secrets are encrypted at rest using AES-256 standards.
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="font-bold text-slate-900 text-xs block">Data Retention Schedule:</span>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li><strong>Active Account Data:</strong> Retained for the duration of account activity.</li>
                    <li><strong>Financial & Escrow Records:</strong> Retained for 7 years to comply with statutory accounting and GST requirements.</li>
                    <li><strong>Verification Documents:</strong> Retained during merchant active status + 3 years post-deactivation.</li>
                    <li><strong>Security & Audit Logs:</strong> Retained for 180 days in active security rotation.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 11: User Rights */}
            <section id="user-rights" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  11
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">11. Your Privacy Rights & Requests</h2>
                  <p className="text-xs text-slate-500">Access, correction, export, and privacy requests</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>You have the right to request access to, correction of, or export of your personal data stored on SurplusX:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">Right to Access & Export</span>
                    <p className="text-[11px] text-slate-500">Request a structured digital copy of your profile, orders, and points ledger.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">Right to Rectification</span>
                    <p className="text-[11px] text-slate-500">Update inaccurate profile details or business contact details directly via settings.</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  To submit a privacy request, email <a href={`mailto:${policyMetadata.contactEmail}`} className="font-semibold text-emerald-700 hover:underline">{policyMetadata.contactEmail}</a>.
                </p>
              </div>
            </section>

            {/* Section 12: Cookies */}
            <section id="cookies-storage" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  12
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">12. Cookies & Local Storage</h2>
                  <p className="text-xs text-slate-500">Session persistence and client storage</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  SurplusX uses standard browser <code className="bg-slate-100 px-1.5 py-0.5 rounded-md text-emerald-800 font-mono">localStorage</code> and session tokens to preserve logged-in sessions, active cart selections, and dark/light UI theme preferences across page reloads. We do not place third-party advertising tracking cookies.
                </p>
              </div>
            </section>

            {/* Section 13: Account Deletion */}
            <section id="account-deletion" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  13
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">13. Account Deletion & Anonymization Workflow</h2>
                  <p className="text-xs text-slate-500">Orderly account termination protocol</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  Users may initiate an account deletion request through Account Settings or by emailing support.
                </p>
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs space-y-1.5">
                  <span className="font-bold text-rose-950 block flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-600" /> Account Deletion Execution Steps:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-rose-900 text-[11px]">
                    <li>Identity verification is required before initiating account deletion.</li>
                    <li>Active pending orders, active escrow balances, or unfulfilled food rescue reservations must be settled prior to account termination.</li>
                    <li>Upon confirmation, personal identifiers (name, email, phone) are anonymized or purged. Transaction logs required by statutory law are retained in anonymized format.</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Section 14: Children Privacy */}
            <section id="children-privacy" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  14
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">14. Children&apos;s Privacy</h2>
                  <p className="text-xs text-slate-500">Age limit compliance</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  SurplusX is intended solely for individuals aged 18 and above. We do not knowingly collect or solicit personal data from children under 18. If we discover an account created by an underage individual, it will be promptly terminated.
                </p>
              </div>
            </section>

            {/* Section 15: Policy Updates & Contact */}
            <section id="updates-contact" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  15
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">15. Policy Updates & Contact Information</h2>
                  <p className="text-xs text-slate-500">Grievance contact & notification protocol</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  We may update this Privacy Policy periodically to reflect platform updates or legal changes. When material changes occur, we will publish the new version with an updated version number and date.
                </p>

                <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> SurplusX Support & Grievance Contact
                  </h3>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p><strong>Platform Email:</strong> <a href={`mailto:${policyMetadata.contactEmail}`} className="text-emerald-400 font-semibold underline">{policyMetadata.contactEmail}</a></p>
                    <p><strong>Support Window:</strong> 24/7 Monitored Email Queue</p>
                    <p><strong>Grievance Response Time:</strong> Within 48 hours</p>
                  </div>
                </div>

                {/* Interactive Privacy Request Portal */}
                <div className="pt-4 border-t border-slate-100">
                  <form onSubmit={handlePrivacyRequestSubmit} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900">Submit a Privacy or Data Request</h4>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Submit a request for personal data export, data correction, or account deletion. Our Data Protection Officer will process your request within 48 hours.
                    </p>

                    {reqSuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{reqSuccessMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Request Type</label>
                        <select
                          value={requestType}
                          onChange={(e) => setRequestType(e.target.value as any)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden"
                        >
                          <option value="DATA_EXPORT">Personal Data Export</option>
                          <option value="DATA_CORRECTION">Data Correction</option>
                          <option value="ACCOUNT_DELETION">Account Deletion Request</option>
                          <option value="CONSENT_WITHDRAWAL">Withdraw Marketing Consent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={reqName}
                          onChange={(e) => setReqName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold text-slate-700 mb-1">Your Verified Email Address</label>
                      <input
                        type="email"
                        required
                        value={reqEmail}
                        onChange={(e) => setReqEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold text-slate-700 mb-1">Request Details / Reason</label>
                      <textarea
                        rows={2}
                        value={reqDetails}
                        onChange={(e) => setReqDetails(e.target.value)}
                        placeholder="Provide details about your request or scope of data..."
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReq}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingReq ? 'Submitting Request...' : 'Submit Privacy Request'}
                    </button>
                  </form>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
