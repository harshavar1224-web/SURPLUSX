import React from 'react';
import {
  Printer,
  Download,
  Share2,
  CheckCircle,
  QrCode,
  ShieldCheck,
  Leaf,
  MapPin,
  Clock,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';

export const ReceiptModal: React.FC = () => {
  const { selectedOrderForReceipt, setSelectedOrderForReceipt, setActiveView, setSelectedOrderForTracking } =
    useApp();

  if (!selectedOrderForReceipt) return null;

  const order = selectedOrderForReceipt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Official SurplusX Tax Invoice</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setSelectedOrderForReceipt(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 bg-white text-slate-900">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <SurplusXLogo size="md" />
              <p className="text-xs text-slate-500 mt-1 font-mono-code">
                GSTIN: 29AABCS8891P1ZK • FSSAI Lic: 11224334000192
              </p>
              <p className="text-xs text-slate-500 font-mono-code">
                Bengaluru Tech Hub, Koramangala 4th Block, Karnataka 560034
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-bold text-slate-400 uppercase">Receipt No.</div>
              <div className="text-sm font-mono-code font-bold text-slate-900">{order.receiptNumber}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Order ID: <span className="font-bold text-slate-800">#{order.id}</span>
              </div>
              <div className="text-xs text-slate-500">
                Date: {new Date(order.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Customer & Merchant Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Customer Details</div>
              <div className="font-bold text-slate-900">{order.customerName}</div>
              <div className="text-slate-600">{order.customerPhone}</div>
              <div className="text-slate-500 mt-1">Payment Method: {order.paymentMethod} (Razorpay Verified)</div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Store / Merchant</div>
              <div className="font-bold text-slate-900">{order.storeName}</div>
              <div className="text-slate-600">{order.storeAddress}</div>
              <div className="text-emerald-700 font-semibold mt-1">Pickup Window: {order.pickupWindow}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Original</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.unit}</div>
                    </td>
                    <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 text-right">₹{item.price}</td>
                    <td className="py-2.5 text-right text-slate-400 line-through">
                      ₹{item.originalPrice * item.quantity}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation & Verification OTP */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t border-slate-200">
            {/* Left QR Code for Pickup & Verification */}
            <div className="sm:col-span-5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-xs border border-emerald-300 flex items-center justify-center mb-2">
                <QrCode className="w-full h-full text-emerald-800" />
              </div>
              <div className="text-[11px] font-bold text-emerald-900">Pickup OTP Code: {order.pickupCodeOtp}</div>
              <div className="text-[10px] text-emerald-700">Show to store manager upon collection</div>
            </div>

            {/* Right Totals */}
            <div className="sm:col-span-7 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Surplus Savings</span>
                <span>- ₹{order.discount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Logistics Contribution</span>
                <span>₹{order.platformFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5%)</span>
                <span>₹{order.taxes}</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Paid (INR)</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Environmental Impact Summary */}
          <div className="p-3.5 bg-emerald-900 text-white rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-emerald-200">Impact Generated: </span>
                <span>
                  {order.impact.foodSavedKg} kg food rescued • {order.impact.co2SavedKg} kg CO₂ avoided
                </span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-300 font-semibold">
              Partner NGO: {order.assignedNgoName || 'Hope Foundation'}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelectedOrderForReceipt(null)}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200"
          >
            Close Receipt
          </button>

          <button
            onClick={() => {
              setSelectedOrderForReceipt(null);
              setSelectedOrderForTracking(order);
              setActiveView('live-tracking');
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Track NGO Logistics Live</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
