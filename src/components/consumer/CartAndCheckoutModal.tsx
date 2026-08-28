import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Lock,
  Leaf,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { SurplusXLogo } from '../SurplusXLogo';

export const CartAndCheckoutModal: React.FC = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    reservationHoldExpiresAt,
    createOrderFromCart,
    setSelectedOrderForReceipt,
    setSelectedOrderForTracking,
    setActiveView,
    triggerToast,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'Wallet'>('UPI');
  const [upiId, setUpiId] = useState('harsha@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('10:00');

  // Countdown timer for inventory reservation hold
  useEffect(() => {
    if (!reservationHoldExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, reservationHoldExpiresAt - Date.now());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [reservationHoldExpiresAt]);

  if (!isCheckoutOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.listing.price * item.quantity, 0);
  const originalSubtotal = cart.reduce((sum, item) => sum + item.listing.originalPrice * item.quantity, 0);
  const discount = originalSubtotal - subtotal;
  const platformFee = cart.length > 0 ? 9 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + platformFee + taxes;

  const handlePayNow = async () => {
    setIsProcessing(true);
    try {
      // Simulate real Razorpay checkout verification step
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const order = await createOrderFromCart(paymentMethod);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#38bdf8'],
      });

      setIsCheckoutOpen(false);
      setSelectedOrderForTracking(order);
      setActiveView('live-tracking');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <SurplusXLogo size="sm" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Reservation Cart & Checkout
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Inventory Hold: {timeLeftStr} remaining</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm font-semibold">Your cart is currently empty.</p>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setActiveView('browse');
                }}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Browse Surplus Deals
              </button>
            </div>
          ) : (
            <>
              {/* Reserved Items List */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Reserved Items ({cart.length})
                </div>
                {cart.map((item) => (
                  <div
                    key={item.listing.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.listing.image}
                        alt={item.listing.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.listing.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.listing.storeName} • Qty: {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-900">
                          ₹{item.listing.price * item.quantity}
                        </div>
                        <div className="text-[10px] text-slate-400 line-through">
                          ₹{item.listing.originalPrice * item.quantity}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.listing.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Surplus Discount Savings</span>
                  <span>- ₹{discount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Logistics & Rescue Contribution</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST 5%)</span>
                  <span>₹{taxes}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              {/* Payment Method Selector (Razorpay Gateway) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Select Payment Method</span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Razorpay 256-bit Secure
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Instant UPI / QR</div>
                      <div className="text-[10px] text-slate-400 font-normal">GPay, PhonePe, Paytm</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'Card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Credit / Debit Card</div>
                      <div className="text-[10px] text-slate-400 font-normal">Visa, Mastercard, RuPay</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('NetBanking')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'NetBanking'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building className="w-4 h-4 text-purple-600" />
                    <div>
                      <div>Net Banking</div>
                      <div className="text-[10px] text-slate-400 font-normal">HDFC, ICICI, SBI, Axis</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('Wallet')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'Wallet'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>SurplusX Wallet</div>
                      <div className="text-[10px] text-slate-400 font-normal">Balance: ₹450</div>
                    </div>
                  </button>
                </div>

                {/* Test Mode Simulation Bar */}
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      TEST GATEWAY MODE — NO REAL MONEY COLLECTED
                    </span>
                    <span className="font-mono-code text-[10px] bg-amber-200/70 text-amber-950 px-1.5 py-0.5 rounded">
                      SANDBOX
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800">
                    Cashfree & Razorpay mock provider active. Select desired outcome for verification testing:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => triggerToast('Gateway simulation set to: IMMEDIATE SUCCESS', 'success')}
                      className="p-1.5 bg-white border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 hover:bg-emerald-50 text-center"
                    >
                      ✓ Force Success
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast('Gateway simulation set to: BANK DECLINED FAILURE', 'warning')}
                      className="p-1.5 bg-white border border-rose-300 rounded-lg text-[10px] font-bold text-rose-800 hover:bg-rose-50 text-center"
                    >
                      ✕ Test Failure
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast('Gateway simulation set to: USER CANCELLED', 'info')}
                      className="p-1.5 bg-white border border-slate-300 rounded-lg text-[10px] font-bold text-slate-800 hover:bg-slate-50 text-center"
                    >
                      ⊘ Test Cancel
                    </button>
                  </div>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@oksbi"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-hidden focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Verified Impact Notice */}
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2 text-xs text-slate-600">
                <Leaf className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  This purchase rescues ~<strong>4.5 kg</strong> of food and avoids{' '}
                  <strong>8.6 kg</strong> CO₂.
                </span>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying with Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{totalAmount} & Confirm Order</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
