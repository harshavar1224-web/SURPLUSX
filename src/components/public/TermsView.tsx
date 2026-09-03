import React, { useState } from 'react';
import {
  FileText,
  Scale,
  ArrowLeft,
  Search,
  Lock,
  Mail,
  Building,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Gavel,
  ShoppingBag,
  Award,
  DollarSign,
  Printer,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TermsView: React.FC = () => {
  const { setActiveView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  const termsMetadata = {
    title: 'SurplusX Terms & Conditions',
    version: 'v1.0',
    lastUpdated: 'September 2, 2026',
    effectiveDate: 'September 2, 2026',
    contactEmail: 'surplusx.support@gmail.com'
  };

  const sections = [
    { id: 'overview', title: '1. Acceptance of Terms' },
    { id: 'eligibility-roles', title: '2. Eligibility & Permanent Role Governance' },
    { id: 'account-security', title: '3. Account Security & Verification' },
    { id: 'platform-usage', title: '4. SurplusX Platform & Dual Marketplace' },
    { id: 'consumer-terms', title: '5. Consumer Rights & Pickup Verification' },
    { id: 'business-terms', title: '6. Business Obligations & FSSAI Food Safety' },
    { id: 'ngo-terms', title: '7. NGO Partner Terms & 80G Compliance' },
    { id: 'doc-authenticity', title: '8. Document Authenticity Warranty' },
    { id: 'food-safety', title: '9. Food Hygiene & Allergen Disclaimers' },
    { id: 'orders-escrow', title: '10. Orders, Escrow Payments & Refunds' },
    { id: 'coupons-points', title: '11. Coupons, Points & Referral Rules' },
    { id: 'prohibited-activities', title: '12. Prohibited Conduct & Fraud Prevention' },
    { id: 'suspension-termination', title: '13. Account Suspension & Termination' },
    { id: 'ip-content', title: '14. Intellectual Property & User Content' },
    { id: 'disclaimers-liability', title: '15. Disclaimers & Limitation of Liability' },
    { id: 'indemnification', title: '16. Indemnification' },
    { id: 'disputes-jurisdiction', title: '17. Dispute Resolution & Governing Law' },
    { id: 'updates-contact', title: '18. Modifications & Contact Info' },
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
                <Scale className="w-3.5 h-3.5" />
                <span>Official SurplusX Operating Agreement</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Terms & Conditions
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Legal rights, duties, food safety standards, escrow settlement rules, and operational guidelines governing all SurplusX users.
              </p>
            </div>

            {/* Version Metadata Card */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl text-xs space-y-2 shrink-0 md:w-72 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400 font-medium">Terms Version:</span>
                <span className="font-extrabold text-emerald-400 font-mono">{termsMetadata.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Last Updated:</span>
                <span className="text-slate-200 font-semibold">{termsMetadata.lastUpdated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Effective Date:</span>
                <span className="text-slate-200 font-semibold">{termsMetadata.effectiveDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Table of Contents */}
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
                  title="Print Terms & Conditions"
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
                  placeholder="Search terms & conditions..."
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
                <p className="font-bold text-slate-700">Questions Regarding Terms?</p>
                <p>Contact our Legal & Compliance Team:</p>
                <a href={`mailto:${termsMetadata.contactEmail}`} className="font-semibold text-emerald-700 hover:underline">
                  {termsMetadata.contactEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section 1: Acceptance */}
            <section id="overview" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
                  <p className="text-xs text-slate-500">Binding legal contract</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  These Terms & Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;) and <strong>SurplusX</strong> governing your access to and use of the SurplusX digital food marketplace platform, including web applications, API endpoints, merchant tools, and delivery integrations.
                </p>
                <p>
                  By creating an account, selecting the required consent checkbox during registration, or using any feature on SurplusX, you explicitly agree to comply with and be bound by these Terms. If you do not agree, you must immediately cease accessing the platform.
                </p>
              </div>
            </section>

            {/* Section 2: Eligibility & Roles */}
            <section id="eligibility-roles" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">2. Eligibility & Permanent Role Governance</h2>
                  <p className="text-xs text-slate-500">Minimum age 18 & strict 1-role binding</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  <strong>Age Requirement:</strong> You must be at least 18 years of age and legally competent under applicable laws to enter into a contract.
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="font-bold text-slate-900 text-xs block">Permanent Role Security Governance:</span>
                  <p className="text-[11px] text-slate-600">
                    To prevent fraudulent identity switches or privilege escalation, user roles on SurplusX (<strong>CONSUMER</strong>, <strong>BUSINESS</strong>, <strong>NGO</strong>, or <strong>RIDER</strong>) are strictly bound to a verified email address and verified mobile number upon registration. Roles cannot be altered without Super Admin authorization.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Account Security */}
            <section id="account-security" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">3. Account Security & Verification</h2>
                  <p className="text-xs text-slate-500">Dual OTP verification & credentials safeguards</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  Users are responsible for maintaining the confidentiality of account credentials and authentication codes. You agree to notify SurplusX immediately if you suspect unauthorized account access. SurplusX is not liable for losses arising from compromised user devices.
                </p>
              </div>
            </section>

            {/* Section 4: Platform Usage */}
            <section id="platform-usage" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">4. SurplusX Platform & Dual Marketplace</h2>
                  <p className="text-xs text-slate-500">Commercial food rescue & NGO donation channels</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>SurplusX provides a dual-channel ecosystem:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">Consumer Commercial Channel</span>
                    <p className="text-[11px] text-slate-500">Businesses list fresh surplus food at discounted prices for consumer pickup or delivery.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-900 block mb-0.5">NGO Donation Channel</span>
                    <p className="text-[11px] text-slate-500">Businesses donate bulk surplus food to verified NGOs for zero-cost community distribution.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Consumer Terms */}
            <section id="consumer-terms" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">5. Consumer Rights & Pickup Verification</h2>
                  <p className="text-xs text-slate-500">4-digit OTP handover protocol & inspection duty</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  Consumers purchasing food items on SurplusX must inspect items at pickup. To verify pickup completion, consumers present a unique <strong>4-digit PIN / OTP code</strong> generated upon order confirmation. Supplying this code to the merchant authorizes escrow fund release.
                </p>
              </div>
            </section>

            {/* Section 6: Business Terms */}
            <section id="business-terms" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">6. Business Obligations & FSSAI Food Safety</h2>
                  <p className="text-xs text-slate-500">Hygiene compliance & dynamic surplus pricing</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>Business merchants listing food items on SurplusX represent and warrant that:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>They hold a valid, active <strong>FSSAI License / Food Registration</strong>.</li>
                  <li>All items listed are fresh, wholesome, edible, and stored under proper hygiene temperatures up to handover.</li>
                  <li>Listings accurately disclose ingredients, preparation time, and potential allergen warnings.</li>
                </ul>
              </div>
            </section>

            {/* Section 7: NGO Terms */}
            <section id="ngo-terms" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  7
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">7. NGO Partner Terms & 80G Tax Receipting</h2>
                  <p className="text-xs text-slate-500">Non-commercial redistribution & tax acknowledgments</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  NGO partners receiving donated surplus food agree to distribute all received items exclusively for non-commercial charitable relief. Re-selling donated surplus food is strictly illegal and subject to criminal prosecution. NGOs agree to issue valid 80G tax receipt acknowledgments for tax-exempt business donors.
                </p>
              </div>
            </section>

            {/* Section 8: Document Authenticity */}
            <section id="doc-authenticity" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  8
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">8. Document Authenticity Warranty</h2>
                  <p className="text-xs text-slate-500">Zero tolerance for forged government credentials</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  Businesses and NGOs warrant that all uploaded FSSAI licenses, PAN/GST cards, and identity proofs are genuine and unmodified. Uploading forged or expired documents results in permanent account ban, forfeiture of escrow balances, and legal reporting to enforcement agencies.
                </p>
              </div>
            </section>

            {/* Section 9: Food Safety */}
            <section id="food-safety" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  9
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">9. Food Hygiene & Allergen Disclaimers</h2>
                  <p className="text-xs text-slate-500">Merchant liability for preparation standards</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  SurplusX acts as a digital marketplace facilitator connecting merchants and consumers. Individual food businesses remain solely responsible for culinary preparation, ingredient quality, hygienic packaging, and allergen accuracy under the Food Safety and Standards Act.
                </p>
              </div>
            </section>

            {/* Section 10: Orders & Escrow */}
            <section id="orders-escrow" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  10
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">10. Orders, Escrow Payments & Refunds</h2>
                  <p className="text-xs text-slate-500">Secure holding accounts & dispute resolutions</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  Payment for food orders is processed immediately upon placement and held safely in escrow.
                </p>
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                  <span className="font-bold text-emerald-950 block">Refund & Dispute Terms:</span>
                  <ul className="list-disc list-inside space-y-1 text-emerald-900 text-[11px]">
                    <li>Full refunds are automatically processed if a merchant cancels an order prior to pickup.</li>
                    <li>If a consumer arrives and finds the food non-conforming or spoiled, they must refuse handover and raise a dispute via the app before sharing the 4-digit PIN. Refunds are audited and issued upon Super Admin verification.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 11: Coupons & Points */}
            <section id="coupons-points" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  11
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">11. Coupons, Surplus Points & Referral Rules</h2>
                  <p className="text-xs text-slate-500">Non-transferable reward tokens</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  Surplus Points, streak badges, and promotional coupons carry no real-world monetary value outside SurplusX and cannot be transferred, sold, or redeemed for cash. SurplusX reserves the right to adjust reward balances if referral abuse or multi-account farming is detected.
                </p>
              </div>
            </section>

            {/* Section 12: Prohibited Conduct */}
            <section id="prohibited-activities" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  12
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">12. Prohibited Conduct & Anti-Fraud Rules</h2>
                  <p className="text-xs text-slate-500">Forbidden behavior and bot protection</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>Users are strictly forbidden from:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Creating fake store listings or mock orders to manipulate points or ratings.</li>
                  <li>Re-selling rescued surplus food at commercial markup outside the platform.</li>
                  <li>Scraping platform data, reverse-engineering API endpoints, or bypassing security controls.</li>
                </ul>
              </div>
            </section>

            {/* Section 13: Suspension */}
            <section id="suspension-termination" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  13
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">13. Account Suspension & Termination</h2>
                  <p className="text-xs text-slate-500">Right to de-list non-compliant accounts</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  SurplusX reserves the right to suspend or terminate accounts that breach food safety guidelines, fail verification audits, or engage in abusive behavior. Suspended accounts are barred from opening new accounts under different email addresses.
                </p>
              </div>
            </section>

            {/* Section 14: IP & Content */}
            <section id="ip-content" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  14
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">14. Intellectual Property & User Content</h2>
                  <p className="text-xs text-slate-500">Ownership of logos, trademarks, and store photos</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  SurplusX and its logos, design elements, algorithms, and brand assets are the exclusive property of SurplusX. Merchants retain ownership of uploaded product photos but grant SurplusX a worldwide license to display listing photos for marketplace operation.
                </p>
              </div>
            </section>

            {/* Section 15: Disclaimers */}
            <section id="disclaimers-liability" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  15
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">15. Disclaimers & Limitation of Liability</h2>
                  <p className="text-xs text-slate-500">As-is marketplace platform operation</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p className="uppercase text-[11px] font-bold text-slate-700">
                  To the maximum extent permitted by applicable law, SurplusX provides the platform on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. SurplusX shall not be liable for indirect, incidental, or consequential damages arising from merchant food items or third-party service outages.
                </p>
              </div>
            </section>

            {/* Section 16: Indemnification */}
            <section id="indemnification" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  16
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">16. Indemnification</h2>
                  <p className="text-xs text-slate-500">User hold-harmless obligation</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  You agree to indemnify, defend, and hold harmless SurplusX, its founders, administrators, and officers from any claims, liabilities, or expenses arising from your violation of these Terms or non-compliance with food safety laws.
                </p>
              </div>
            </section>

            {/* Section 17: Disputes & Jurisdiction */}
            <section id="disputes-jurisdiction" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  17
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">17. Dispute Resolution & Governing Law</h2>
                  <p className="text-xs text-slate-500">Jurisdiction & arbitration rules</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute or arbitration arising from platform usage shall be subject to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka, India.
                </p>
              </div>
            </section>

            {/* Section 18: Updates & Contact */}
            <section id="updates-contact" className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  18
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">18. Modifications to Terms & Contact Info</h2>
                  <p className="text-xs text-slate-500">Version updates & official contact</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  SurplusX reserves the right to modify these Terms at any time. Continued usage of the platform after effective publication constitutes agreement to updated terms.
                </p>

                <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Official Support Contact
                  </h3>
                  <div className="text-xs space-y-1 text-slate-300">
                    <p><strong>Support Email:</strong> <a href={`mailto:${termsMetadata.contactEmail}`} className="text-emerald-400 font-semibold underline">{termsMetadata.contactEmail}</a></p>
                    <p><strong>Response Time:</strong> Within 48 hours</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
