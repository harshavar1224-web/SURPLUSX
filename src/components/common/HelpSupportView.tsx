import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupportTicket } from '../../types';

export const HelpSupportView: React.FC = () => {
  const { currentUser, supportTickets, createSupportTicket, triggerToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaqCategory, setActiveFaqCategory] = useState<'ALL' | 'CONSUMER' | 'BUSINESS' | 'NGO' | 'GENERAL'>('ALL');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  // Ticket creation form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('GENERAL_INQUIRY');
  const [ticketPriority, setTicketPriority] = useState<SupportTicket['priority']>('MEDIUM');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      id: 'faq-1',
      category: 'CONSUMER',
      question: 'How do I collect my surplus food order at the store?',
      answer:
        'When your order is confirmed, you receive a secure 4-digit Pickup OTP. Visit the store during the allocated pickup window, present the OTP at the express counter, and the merchant will hand over your climate-sealed surplus bundle.',
    },
    {
      id: 'faq-2',
      category: 'CONSUMER',
      question: 'What is the food quality and freshness guarantee on SurplusX?',
      answer:
        'All listings are subject to strict FSSAI food safety regulations. Prepared meals must be packaged within safe thermal thresholds, and bakery items are baked on the same day. If you ever receive an item that fails our freshness standards, our 100% Instant Escrow Refund protects you.',
    },
    {
      id: 'faq-3',
      category: 'BUSINESS',
      question: 'When do merchants receive payout settlements for completed orders?',
      answer:
        'Merchant payouts are automatically processed via T+1 automated escrow clearance after successful OTP verification. Platform commissions are deducted transparently with complete GST tax invoices available in your Finance tab.',
    },
    {
      id: 'faq-4',
      category: 'BUSINESS',
      question: 'Can businesses claim 80G tax deductions for food donations to NGOs?',
      answer:
        'Yes. SurplusX automatically generates digitally signed 80G tax receipts and ESG compliance certificates for every food donation matched and acknowledged by registered NGO partners.',
    },
    {
      id: 'faq-5',
      category: 'NGO',
      question: 'How are temperature-regulated food transports verified?',
      answer:
        'During active deliveries, drivers log real-time vehicle GPS coordinates and temperature readings before pickup and at delivery drop-off. Geofenced OTP handovers ensure verifiable chain-of-custody.',
    },
    {
      id: 'faq-6',
      category: 'GENERAL',
      question: 'Why does SurplusX enforce 1-Device hardware binding?',
      answer:
        'To eliminate fraudulent order claiming, unauthorized merchant withdrawals, and concurrent driver account spoofing, each user account is bound to a single verified hardware signature with cryptographic verification.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat =
      activeFaqCategory === 'ALL' || faq.category === activeFaqCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    setIsSubmitting(true);
    createSupportTicket({
      userId: currentUser?.id || 'guest-user',
      userName: currentUser?.name || 'Guest User',
      userRole: currentUser?.role || 'CONSUMER',
      userEmail: currentUser?.email || 'user@surplusx.org',
      category: ticketCategory,
      subject: ticketSubject.trim(),
      description: ticketDescription.trim(),
      priority: ticketPriority,
    });

    setTicketSubject('');
    setTicketDescription('');
    setIsSubmitting(false);
  };

  const userTickets = supportTickets.filter(
    (t) => currentUser?.role === 'ADMIN' || t.userId === (currentUser?.id || 'user-consumer-1')
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Help Center & Support Desk
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            24x7 Food rescue assistance, order dispute resolution, and platform guides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="text-slate-400 font-medium">Rescue Hotline</p>
            <p className="font-bold text-slate-800">1800-SURPLUS-X</p>
          </div>
        </div>
      </div>

      {/* Search FAQs */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs (e.g. pickup OTP, refund, temperature, 80G tax receipt)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'ALL', label: 'All FAQs' },
            { id: 'CONSUMER', label: 'Consumer & Pickup' },
            { id: 'BUSINESS', label: 'Merchant & Settlements' },
            { id: 'NGO', label: 'NGO Logistics & Compliance' },
            { id: 'GENERAL', label: 'Trust & Hardware Security' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFaqCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFaqCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="divide-y divide-slate-100">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div key={faq.id} className="py-3">
                <button
                  type="button"
                  onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  className="w-full flex items-center justify-between text-left cursor-pointer py-1 group"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    {faq.question}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Submission Form & Tickets Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submit Ticket */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Submit a Support Request
            </h2>
          </div>

          <form onSubmit={handleTicketSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ORDER_ISSUE">Order / Pickup Issue</option>
                <option value="DELIVERY_DELAY">Delivery / Courier Issue</option>
                <option value="PAYMENT_ESCROW">Payment / Settlement Inquiry</option>
                <option value="FOOD_SAFETY">Food Quality & Freshness</option>
                <option value="ACCOUNT_SECURITY">Device & Account Security</option>
                <option value="GENERAL_INQUIRY">General Inquiry</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pickup window issue"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="LOW">Low (24 hrs)</option>
                  <option value="MEDIUM">Medium (6 hrs)</option>
                  <option value="HIGH">High Priority (1-2 hrs)</option>
                  <option value="URGENT">Urgent Food Rescue (Immediate)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Description
              </label>
              <textarea
                required
                rows={3}
                placeholder="Please describe the issue, store name, or order ID..."
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Ticket to Trust & Safety</span>
            </button>
          </form>
        </div>

        {/* Existing User Tickets */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Your Support Tickets ({userTickets.length})
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">Live Status</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[290px] pr-1">
            {userTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <p>No active support tickets.</p>
              </div>
            ) : (
              userTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {t.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900">{t.subject}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{t.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Priority: {t.priority}</span>
                    <span>Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
