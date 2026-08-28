import React, { useState } from 'react';
import {
  Store,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Truck,
  TrendingDown,
  ShoppingBag,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WholesaleListing, PurchaseOrder } from '../../types';

export const RetailerDashboard: React.FC = () => {
  const { currentUser, triggerToast, addAuditLog } = useApp();

  const [activeTab, setActiveTab] = useState<'bulk-market' | 'purchase-orders' | 'intake'>('bulk-market');
  const [selectedListingForPO, setSelectedListingForPO] = useState<WholesaleListing | null>(null);
  const [orderQty, setOrderQty] = useState(50);
  const [paymentTerms, setPaymentTerms] = useState<PurchaseOrder['paymentTerms']>('NET_15');
  const [isSubmittingPO, setIsSubmittingPO] = useState(false);

  // Sample Wholesale Listings
  const [wholesaleListings] = useState<WholesaleListing[]>([
    {
      id: 'ws-101',
      title: 'Bulk Organic Tomatoes (Grade A Surplus)',
      storeName: 'Sahyadri Agro Producer Co.',
      storeId: 'store-agro-1',
      category: 'Fruits & Vegetables',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      price: 18, // per kg
      originalPrice: 42,
      discountPercentage: 57,
      quantityAvailable: 450,
      unit: 'kg (in 25kg crates)',
      rating: 4.9,
      reviewCount: 38,
      distanceKm: 4.8,
      pickupWindow: 'Today & Tomorrow, 6:00 AM - 12:00 PM',
      pickupAddress: 'APMC Market Yard Gate 3, Yeshwanthpur, Bangalore',
      coordinates: { lat: 13.028, lng: 77.5409 },
      description: 'Export surplus grade A table tomatoes. Firm, flawless skin, ideal for supermarket retail packaging or commercial food production.',
      dietaryTags: ['Veg', 'Vegan'],
      expiresInHours: 72,
      stockAlertThreshold: 50,
      storePositiveRating: 99,
      storeHappyCustomers: 85,
      storeYearsActive: 5,
      minimumOrderQuantity: 50,
      bulkTierPrices: [
        { minQty: 50, pricePerUnit: 18 },
        { minQty: 150, pricePerUnit: 15 },
        { minQty: 300, pricePerUnit: 12 },
      ],
      lotNumber: 'LOT-TOM-2026-08B',
      gradeQuality: 'Export Surplus',
      fssaiBatchId: 'FSSAI-APMC-99210-BLR',
    },
    {
      id: 'ws-102',
      title: 'Wholesale Whole Wheat Flour (Chakki Atta)',
      storeName: 'Punjab Grain Mills',
      storeId: 'store-mill-2',
      category: 'Others',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      price: 24, // per kg
      originalPrice: 48,
      discountPercentage: 50,
      quantityAvailable: 800,
      unit: 'kg (in 50kg gunny bags)',
      rating: 4.8,
      reviewCount: 52,
      distanceKm: 6.2,
      pickupWindow: 'Anytime 9:00 AM - 6:00 PM',
      pickupAddress: 'Grain Depot 4, Peenya Industrial Area, Bangalore',
      coordinates: { lat: 13.031, lng: 77.518 },
      description: '100% whole grain stone ground chakki atta surplus milling lot. Shelf life 90 days.',
      dietaryTags: ['Veg', 'Vegan'],
      expiresInHours: 240,
      stockAlertThreshold: 100,
      storePositiveRating: 98,
      storeHappyCustomers: 140,
      storeYearsActive: 8,
      minimumOrderQuantity: 100,
      bulkTierPrices: [
        { minQty: 100, pricePerUnit: 24 },
        { minQty: 300, pricePerUnit: 21 },
        { minQty: 500, pricePerUnit: 19 },
      ],
      lotNumber: 'LOT-ATTA-8819',
      gradeQuality: 'A',
      fssaiBatchId: 'FSSAI-MILL-34190',
    },
    {
      id: 'ws-103',
      title: 'Pasteurized Dairy Butter 20kg Block Cartons',
      storeName: 'Karnataka Milk Federation Surplus',
      storeId: 'store-kmf-3',
      category: 'Dairy',
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80',
      price: 260,
      originalPrice: 480,
      discountPercentage: 45,
      quantityAvailable: 120,
      unit: 'kg (Cartons of 20kg)',
      rating: 5.0,
      reviewCount: 76,
      distanceKm: 8.1,
      pickupWindow: 'Today, 2:00 PM - 7:00 PM',
      pickupAddress: 'KMF Cold Chain Central, Dairy Circle, Bangalore',
      coordinates: { lat: 12.938, lng: 77.602 },
      description: 'Commercial bakery grade pure unsalted butter. Cold chain maintained at 4°C.',
      dietaryTags: ['Veg'],
      expiresInHours: 96,
      stockAlertThreshold: 20,
      storePositiveRating: 100,
      storeHappyCustomers: 210,
      storeYearsActive: 12,
      minimumOrderQuantity: 20,
      bulkTierPrices: [
        { minQty: 20, pricePerUnit: 260 },
        { minQty: 60, pricePerUnit: 240 },
      ],
      lotNumber: 'LOT-BTR-9901-KMF',
      gradeQuality: 'A',
      fssaiBatchId: 'FSSAI-KMF-88100',
    },
  ]);

  // Purchase Orders Ledger
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'PO-2026-0801',
      retailerId: currentUser.id,
      retailerName: currentUser.organizationName || 'Metro Mart Supermarkets',
      businessId: 'store-agro-1',
      businessName: 'Sahyadri Agro Producer Co.',
      listingId: 'ws-101',
      itemTitle: 'Bulk Organic Tomatoes (Grade A Surplus)',
      quantityOrdered: 150,
      unit: 'kg',
      unitPrice: 15,
      totalAmount: 2250,
      status: 'IN_TRANSIT',
      paymentTerms: 'NET_15',
      orderDate: '2026-08-25',
      expectedDeliveryDate: '2026-08-27',
      deliveryAddress: 'Metro Mart Distribution Hub, Bannerghatta Rd, Bangalore',
      batchDetails: 'LOT-TOM-2026-08B (FSSAI-APMC-99210-BLR)',
    },
    {
      id: 'PO-2026-0789',
      retailerId: currentUser.id,
      retailerName: currentUser.organizationName || 'Metro Mart Supermarkets',
      businessId: 'store-kmf-3',
      businessName: 'Karnataka Milk Federation Surplus',
      listingId: 'ws-103',
      itemTitle: 'Pasteurized Dairy Butter 20kg Block Cartons',
      quantityOrdered: 40,
      unit: 'kg',
      unitPrice: 260,
      totalAmount: 10400,
      status: 'RECEIVED',
      paymentTerms: 'INSTANT_ESCROW',
      orderDate: '2026-08-22',
      expectedDeliveryDate: '2026-08-23',
      deliveryAddress: 'Metro Mart Bakery Kitchen, Indiranagar',
      batchDetails: 'LOT-BTR-9901-KMF',
    },
  ]);

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingForPO) return;

    setIsSubmittingPO(true);

    // Calculate tier price
    let effectivePrice = selectedListingForPO.price;
    for (const tier of selectedListingForPO.bulkTierPrices) {
      if (orderQty >= tier.minQty) {
        effectivePrice = tier.pricePerUnit;
      }
    }

    const total = effectivePrice * orderQty;

    const newPO: PurchaseOrder = {
      id: `PO-${Date.now().toString(36).toUpperCase()}`,
      retailerId: currentUser.id,
      retailerName: currentUser.organizationName || 'Metro Mart Supermarkets',
      businessId: selectedListingForPO.storeId,
      businessName: selectedListingForPO.storeName,
      listingId: selectedListingForPO.id,
      itemTitle: selectedListingForPO.title,
      quantityOrdered: orderQty,
      unit: selectedListingForPO.unit.split(' ')[0] || 'units',
      unitPrice: effectivePrice,
      totalAmount: total,
      status: 'SUBMITTED',
      paymentTerms,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      deliveryAddress: 'Metro Mart Central Warehouse, Hosur Main Road, Bangalore',
      batchDetails: `${selectedListingForPO.lotNumber} (${selectedListingForPO.fssaiBatchId})`,
    };

    setTimeout(() => {
      setPurchaseOrders((prev) => [newPO, ...prev]);
      setIsSubmittingPO(false);
      setSelectedListingForPO(null);
      triggerToast(`Purchase Order ${newPO.id} generated & dispatched to supplier!`, 'success');
      addAuditLog(
        'WHOLESALE_PO_CREATED',
        'FINANCIAL',
        `Retailer generated ${newPO.id} for ${newPO.quantityOrdered} ${newPO.unit} (₹${newPO.totalAmount})`
      );
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Retailer Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xl flex-shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">
                {currentUser.organizationName || 'Metro Mart Supermarket Chain'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                Verified B2B Retailer ✓
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Wholesale Bulk Surplus Intake • FEFO Stock Replenishment • GSTIN: 29AAACM8819Q1Z4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('bulk-market')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Find Bulk Surplus</span>
          </button>
        </div>
      </div>

      {/* 4 Retailer KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Bulk Procurement Savings</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹1,42,800</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">52% avg discount vs APMC mandis</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Purchase Orders</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{purchaseOrders.length} POs</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">1 in-transit delivery today</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Surplus Volume Intake</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">4.8 Tons</div>
          <div className="text-[11px] text-slate-500 mt-1">FEFO tracked in warehouse</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Escrow Credit Line</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">₹5,00,000</div>
          <div className="text-[11px] text-slate-500 mt-1">NET-15 / NET-30 Terms Active</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('bulk-market')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bulk-market' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bulk Wholesale Surplus Marketplace
        </button>

        <button
          onClick={() => setActiveTab('purchase-orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'purchase-orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Purchase Orders & Invoices ({purchaseOrders.length})
        </button>
      </div>

      {/* Tab 1: Bulk Wholesale Surplus Marketplace */}
      {activeTab === 'bulk-market' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wholesaleListings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs">
                      {item.discountPercentage}% OFF APMC
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-mono-code font-bold backdrop-blur-xs">
                      MOQ: {item.minimumOrderQuantity} {item.unit.split(' ')[0]}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                        {item.gradeQuality} • {item.category}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.title}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.storeName} • {item.distanceKm} km away
                      </div>
                    </div>

                    {/* Pricing Tiers */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-700 text-[11px] flex items-center justify-between">
                        <span>Wholesale Pricing Tiers</span>
                        <span className="text-slate-400">Available: {item.quantityAvailable} {item.unit.split(' ')[0]}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        {item.bulkTierPrices.map((tier, idx) => (
                          <div key={idx} className="bg-white p-1.5 rounded-xl border border-slate-200/60">
                            <div className="text-[10px] text-slate-500 font-semibold">{tier.minQty}+ {item.unit.split(' ')[0]}</div>
                            <div className="font-extrabold text-emerald-700">₹{tier.pricePerUnit}/{item.unit.split(' ')[0]}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono-code text-[11px]">Batch: {item.lotNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Pickup / Dispatch: {item.pickupWindow}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setSelectedListingForPO(item);
                      setOrderQty(item.minimumOrderQuantity);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Generate Purchase Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Purchase Orders */}
      {activeTab === 'purchase-orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">B2B Purchase Orders & Invoices</h3>
              <p className="text-xs text-slate-500">
                Track supplier fulfillment, dispatch schedules, and automatic escrow release.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-bold text-xs text-slate-900">{po.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        po.status === 'RECEIVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : po.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {po.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{po.paymentTerms}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">{po.itemTitle}</div>
                  <div className="text-xs text-slate-500">
                    Supplier: {po.businessName} • Ordered: {po.quantityOrdered} {po.unit} @ ₹{po.unitPrice}/{po.unit}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono-code">
                    {po.batchDetails} • Delivery: {po.expectedDeliveryDate}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-extrabold text-slate-900">₹{po.totalAmount.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    GST Invoice Generated ✓
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Generate Purchase Order */}
      {selectedListingForPO && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create B2B Purchase Order</h3>
                <p className="text-xs text-slate-500">To {selectedListingForPO.storeName}</p>
              </div>
              <button
                onClick={() => setSelectedListingForPO(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item & Lot</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900">{selectedListingForPO.title}</div>
                  <div className="text-[11px] text-slate-500 font-mono-code">
                    {selectedListingForPO.lotNumber} • {selectedListingForPO.fssaiBatchId}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Order Quantity (Min {selectedListingForPO.minimumOrderQuantity})
                  </label>
                  <input
                    type="number"
                    min={selectedListingForPO.minimumOrderQuantity}
                    max={selectedListingForPO.quantityAvailable}
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment & Credit Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="NET_15">NET-15 Days (Escrow Backed)</option>
                    <option value="NET_30">NET-30 Days</option>
                    <option value="INSTANT_ESCROW">Instant Bank Transfer (2% Cash Discount)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Destination Warehouse</label>
                <input
                  type="text"
                  defaultValue="Metro Mart Central Hub, Hosur Main Road, Bangalore - 560100"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-emerald-800 font-semibold">Total PO Valuation</div>
                  <div className="text-base font-extrabold text-emerald-900">
                    ₹{(orderQty * selectedListingForPO.price).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold">100% Tax Deductible (GST Input Credit)</span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPO}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isSubmittingPO ? 'Authorizing & Hashing PO...' : 'Sign & Submit Purchase Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
