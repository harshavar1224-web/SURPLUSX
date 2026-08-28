import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  TrendingUp,
  PackageCheck,
  AlertTriangle,
  HeartHandshake,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Zap,
  BarChart3,
  Percent,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BusinessInventoryItem } from '../../types';

export const BusinessDashboard: React.FC = () => {
  const {
    currentUser,
    activeView,
    inventory,
    updateInventoryItem,
    createListingFromInventory,
    createDonation,
    ledgers,
    triggerMerchantSettlement,
    orders,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'listings' | 'donations' | 'finance' | 'ai'>('inventory');

  useEffect(() => {
    if (activeView === 'inventory') setActiveTab('inventory');
    else if (activeView === 'listings' || activeView === 'surplus-listings') setActiveTab('listings');
    else if (activeView === 'donations' || activeView === 'ngo-partners') setActiveTab('donations');
    else if (activeView === 'finance' || activeView === 'finance-settlements' || activeView === 'analytics') setActiveTab('finance');
    else if (activeView === 'orders' || activeView === 'reservations' || activeView === 'pickup-management') setActiveTab('listings');
  }, [activeView]);
  const [selectedInvForSurplus, setSelectedInvForSurplus] = useState<BusinessInventoryItem | null>(null);
  const [discountVal, setDiscountVal] = useState(50);
  const [qtyVal, setQtyVal] = useState(3);
  const [pickupWindowVal, setPickupWindowVal] = useState('Today, 5:00 PM - 8:00 PM');

  // Donation creation modal state
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationFoodType, setDonationFoodType] = useState('Prepared Gourmet Meal Boxes (Dal & Rice)');
  const [donationMeals, setDonationMeals] = useState(40);
  const [donationWeight, setDonationWeight] = useState(22);
  const [donationDietary, setDonationDietary] = useState('Vegetarian');

  const pendingLedgers = ledgers.filter((l) => l.settlementStatus === 'PENDING');
  const totalSettledRevenue = ledgers
    .filter((l) => l.settlementStatus === 'SETTLED')
    .reduce((sum, l) => sum + l.netPayableToMerchant, 0);

  const handleCreateSurplusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvForSurplus) return;
    createListingFromInventory(selectedInvForSurplus.id, discountVal, qtyVal, pickupWindowVal);
    setSelectedInvForSurplus(null);
  };

  const handleCreateDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDonation({
      foodType: donationFoodType,
      quantityMeals: donationMeals,
      weightKg: donationWeight,
      dietary: donationDietary,
      pickupDeadline: 'Today, 9:00 PM',
      pickupAddress: currentUser.city,
    });
    setIsDonationModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-200 flex-shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentUser.organizationName || 'Green Basket Organics'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Verified Business
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              FSSAI Lic: 11224334000192 • Koramangala 4th Block, Bangalore
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDonationModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Donate Surplus to NGO</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Recovered Value</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹42,850</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +18% this week
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Items Rescued</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">284 Packs</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Zero landfill waste</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">NGO Donations</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">160 Meals</div>
          <div className="text-[11px] text-slate-500 mt-1">Hope Foundation & Robin Hood Army</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Net Disbursed Payouts</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalSettledRevenue}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Razorpay Direct Bank Settlement</div>
        </div>
      </div>

      {/* Business Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inventory & Surplus Thresholds
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'finance'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Financial Ledger & Settlements ({pendingLedgers.length} pending)
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'ai'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI Surplus Intelligence</span>
        </button>
      </div>

      {/* Tab 1: Real Concurrency-Safe Inventory Manager */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Inventory Stock & Automatic Surplus Detector</h3>
              <p className="text-xs text-slate-500">
                When stock exceeds surplus thresholds near expiry, SurplusX prompts one-click discounted listing or NGO donation.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3">Product Name</th>
                  <th className="py-3">Category</th>
                  <th className="py-3 text-center">Current Stock</th>
                  <th className="py-3 text-center">Surplus Threshold</th>
                  <th className="py-3 text-center">Expiry Window</th>
                  <th className="py-3 text-right">Standard Price</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                  const isSurplusAlert = item.currentStock > item.surplusThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          {isSurplusAlert && (
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          )}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600">{item.category}</td>
                      <td className="py-3 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            isSurplusAlert ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-500">{item.surplusThreshold} {item.unit}</td>
                      <td className="py-3 text-center text-slate-600 font-medium">
                        <span className="flex items-center justify-center gap-1 text-rose-600">
                          <Clock className="w-3.5 h-3.5" />
                          {item.expiryHoursLeft}h left
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">₹{item.sellingPrice}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvForSurplus(item);
                              setQtyVal(Math.min(item.currentStock, 4));
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            List Surplus Deal
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Financial Ledger & Settlements */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Merchant Financial Ledger & Automated Settlements</h3>
            <p className="text-xs text-slate-500">
              Transparent ledger tracking gross revenue, SurplusX commission (8%), GST taxes, and direct bank payouts.
            </p>
          </div>

          <div className="space-y-3">
            {ledgers.map((ledger) => (
              <div
                key={ledger.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-code font-bold text-slate-900">
                      Order #{ledger.orderId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ledger.settlementStatus === 'SETTLED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ledger.settlementStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Gross: ₹{ledger.grossAmount} • Commission: -₹{ledger.platformCommission} • Tax: ₹{ledger.taxAmount}
                  </div>
                  <div className="text-[11px] text-slate-400">Gateway Ref: {ledger.paymentGatewayRef}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Net Merchant Payout</div>
                    <div className="text-lg font-extrabold text-slate-900">₹{ledger.netPayableToMerchant}</div>
                  </div>

                  {ledger.settlementStatus === 'PENDING' ? (
                    <button
                      onClick={() => triggerMerchantSettlement(ledger.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Instant Settle Payout
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Settled to Bank</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Surplus Intelligence */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Predictive Forecasting & Dynamic Pricing Engine</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Forecast Card */}
            <div className="p-5 rounded-2xl bg-emerald-950 text-white space-y-4">
              <h4 className="text-sm font-bold text-emerald-200">Weekend Surplus Demand Forecast</h4>
              <p className="text-xs text-slate-300">
                Machine learning model trained on local Bangalore weather, footfall, and 90-day historic batch sales.
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-emerald-900">
                  <span className="text-slate-300">Expected Bakery Surplus:</span>
                  <span className="font-bold text-emerald-300">18 Loaves (High Risk)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-emerald-900">
                  <span className="text-slate-300">Expected Cooked Meal Surplus:</span>
                  <span className="font-bold text-emerald-300">8 Trays (Moderate)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-300">Recommended Action:</span>
                  <span className="font-bold text-amber-300">Trigger 55% discount at 4:30 PM</span>
                </div>
              </div>
            </div>

            {/* Dynamic Pricing Recommendations */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Live Dynamic Pricing Suggestions</h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Fresh Vegetables Box</div>
                    <div className="text-[11px] text-slate-500">2.5 hours remaining in pickup window</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                      Set 52% OFF (₹120)
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Sourdough Loaves</div>
                    <div className="text-[11px] text-slate-500">Stock exceeds threshold by 6 units</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                      Donate 6 units to NGO
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surplus Listing Creator Modal */}
      {selectedInvForSurplus && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900">
              Create Surplus Deal: {selectedInvForSurplus.name}
            </h3>
            <form onSubmit={handleCreateSurplusSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Discount Percentage ({discountVal}%)
                </label>
                <input
                  type="range"
                  min="30"
                  max="80"
                  step="5"
                  value={discountVal}
                  onChange={(e) => setDiscountVal(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-slate-400 mt-1">
                  <span>30%</span>
                  <span className="font-bold text-emerald-700">₹{Math.round(selectedInvForSurplus.sellingPrice * (1 - discountVal / 100))}</span>
                  <span>80%</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantity to List</label>
                <input
                  type="number"
                  min="1"
                  max={selectedInvForSurplus.currentStock}
                  value={qtyVal}
                  onChange={(e) => setQtyVal(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pickup Window</label>
                <input
                  type="text"
                  value={pickupWindowVal}
                  onChange={(e) => setPickupWindowVal(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvForSurplus(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Publish Surplus Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Donation Creation Modal */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900">
              Donate Surplus Food to NGO Fleet
            </h3>
            <form onSubmit={handleCreateDonationSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Food Description</label>
                <input
                  type="text"
                  value={donationFoodType}
                  onChange={(e) => setDonationFoodType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Meal Count</label>
                  <input
                    type="number"
                    value={donationMeals}
                    onChange={(e) => setDonationMeals(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={donationWeight}
                    onChange={(e) => setDonationWeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dietary Spec</label>
                <input
                  type="text"
                  value={donationDietary}
                  onChange={(e) => setDonationDietary(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDonationModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Broadcast to NGOs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
