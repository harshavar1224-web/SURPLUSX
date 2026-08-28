import React from 'react';
import {
  Receipt,
  Download,
  Printer,
  QrCode,
  CheckCircle2,
  Building2,
  Calendar,
  IndianRupee,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const ReceiptsView: React.FC = () => {
  const { orders, selectedOrderForTracking, triggerToast } = useApp();

  const activeOrder: Order = selectedOrderForTracking || orders[0] || {
    id: 'SX-10294',
    receiptNumber: 'REC-2026-10294',
    userId: 'usr-1',
    customerName: 'Verified Rescuer',
    customerPhone: '+91 98765 43210',
    items: [
      {
        listingId: 'item-1',
        title: 'Organic Vegetable Rescue Pack',
        storeName: 'Green Basket Organics',
        price: 120,
        originalPrice: 300,
        quantity: 1,
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
      },
    ],
    subtotal: 120,
    discount: 180,
    platformFee: 5,
    taxes: 6,
    totalAmount: 120,
    status: 'COMPLETED',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    pickupCodeOtp: '8492',
    storeName: 'Green Basket Organics',
    storeAddress: '12th Main, Indiranagar, Bangalore',
    createdAt: '2026-08-26 18:30',
    pickupWindow: '06:00 PM - 09:00 PM',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    triggerToast(`Tax invoice PDF for #${activeOrder.id} downloaded!`, 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Tax Invoice & Receipt</h1>
          </div>
          <p className="text-xs text-slate-500">
            FSSAI and GST compliant verified invoice for your zero-waste transaction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Invoice Top Meta */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                SX
              </div>
              <span className="text-base font-bold text-slate-900">SurplusX Commerce</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">GSTIN: 29ABCDE1234F1Z5</p>
            <p className="text-xs text-slate-500">FSSAI License: 11223344556677</p>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-lg font-mono font-bold text-slate-900">
              INVOICE #{activeOrder.id}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Date: {activeOrder.createdAt}</p>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              PAID VIA ESCROW
            </span>
          </div>
        </div>

        {/* Billed To & Merchant Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Merchant Details
            </p>
            <p className="font-bold text-slate-900">{activeOrder.storeName}</p>
            <p className="text-slate-600 mt-0.5">{activeOrder.storeAddress}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Customer Details
            </p>
            <p className="font-bold text-slate-900">{activeOrder.customerName || 'Verified Surplus Rescuer'}</p>
            <p className="text-slate-600 mt-0.5">Pickup Method: Self-Collection Express Window</p>
            <p className="text-slate-600">Window: {activeOrder.pickupWindow}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeOrder.items.map((item, idx) => (
                <tr key={idx} className="text-slate-800">
                  <td className="p-3 font-medium">{item.title}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right font-mono">₹{item.price}</td>
                  <td className="p-3 text-right font-mono font-bold">
                    ₹{item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 self-start">
            <QrCode className="w-12 h-12 text-slate-800" />
            <div>
              <p className="font-bold text-slate-900 text-[11px]">Cryptographic Receipt Proof</p>
              <p className="text-[10px] text-slate-500">Scan at merchant counter or tax audit.</p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Gross Retail Value:</span>
              <span className="font-mono">₹{activeOrder.totalAmount + (activeOrder.discount || 0)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Surplus Discount:</span>
              <span className="font-mono">-₹{activeOrder.discount || 0}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (5% Included):</span>
              <span className="font-mono">₹{(activeOrder.totalAmount * 0.05).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Amount Paid:</span>
              <span className="font-mono text-emerald-700">₹{activeOrder.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Security & ESG Note */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Waste certified transaction. 1.85 kg of greenhouse gases avoided.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
