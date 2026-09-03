import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Percent, 
  IndianRupee, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  Eye,
  TrendingUp,
  Layers,
  Building2,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT' | 'FREE_DELIVERY';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  totalUsageLimit: number;
  usedCount: number;
  perUserUsageLimit: number;
  eligibleRole: 'CONSUMER' | 'BUSINESS' | 'NGO' | 'ALL';
  fundingSource: 'PLATFORM' | 'BUSINESS' | 'CAMPAIGN';
  active: boolean;
  archived?: boolean;
  createdAt: string;
  updatedBy: string;
}

export const AdminCouponsView: React.FC = () => {
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT' | 'FREE_DELIVERY',
    discountValue: 10,
    minOrderValue: 200,
    maxDiscount: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalUsageLimit: 1000,
    perUserUsageLimit: 1,
    eligibleRole: 'CONSUMER' as const,
    fundingSource: 'PLATFORM' as const,
    active: true,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setErrorMsg('Unauthorized: Only Super Administrators can create or edit platform coupons.');
      return;
    }

    try {
      const endpoint = editingCoupon ? `/api/coupons/${editingCoupon.id}` : '/api/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adminId: currentUser?.id,
          adminEmail: currentUser?.email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(editingCoupon ? 'Coupon updated successfully.' : 'Coupon created successfully.');
        setIsCreateModalOpen(false);
        setEditingCoupon(null);
        fetchCoupons();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to save coupon.');
      }
    } catch (err) {
      setErrorMsg('Network error while saving coupon.');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (!isSuperAdmin) {
      setErrorMsg('Unauthorized: Super Admin privileges required.');
      return;
    }
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive, adminId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
      }
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
    }
  };

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 250,
      maxDiscount: 150,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalUsageLimit: 500,
      perUserUsageLimit: 1,
      eligibleRole: 'CONSUMER',
      fundingSource: 'PLATFORM',
      active: true,
    });
    setErrorMsg(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount || 100,
      startDate: coupon.startDate.split('T')[0],
      endDate: coupon.endDate.split('T')[0],
      totalUsageLimit: coupon.totalUsageLimit,
      perUserUsageLimit: coupon.perUserUsageLimit,
      eligibleRole: coupon.eligibleRole,
      fundingSource: coupon.fundingSource,
      active: coupon.active,
    });
    setErrorMsg(null);
    setIsCreateModalOpen(true);
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'active') return matchesSearch && c.active;
    if (filterStatus === 'inactive') return matchesSearch && !c.active;
    return matchesSearch;
  });

  // Financial impact metrics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.active).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const platformFundedCoupons = coupons.filter(c => c.fundingSource === 'PLATFORM').length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-purple-600" />
            Super Admin Coupon & Promotion Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, configure, and govern promotional coupons, discount caps, and funding sources across SurplusX.
          </p>
        </div>

        {isSuperAdmin ? (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Coupon
          </button>
        ) : (
          <div className="text-xs bg-amber-50 text-amber-800 px-3 py-2 rounded-xl border border-amber-200 font-medium">
            Read-only Mode: Super Administrator role required to create or edit coupons.
          </div>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-800 font-bold">&times;</button>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Coupons</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCoupons}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Campaigns</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCoupons}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Redemptions</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{totalRedemptions}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Funded</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{platformFundedCoupons}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by coupon code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Coupon Code & Name</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Order / Cap</th>
                <th className="p-4">Funding Source</th>
                <th className="p-4">Usage Limits</th>
                <th className="p-4">Validity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading coupons...</td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No coupons found matching your query.</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                          {coupon.code}
                        </span>
                        <p className="font-semibold text-slate-900 mt-1">{coupon.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{coupon.description}</p>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {coupon.discountType === 'PERCENTAGE' && `${coupon.discountValue}% OFF`}
                      {coupon.discountType === 'FLAT' && `₹${coupon.discountValue} OFF`}
                      {coupon.discountType === 'FREE_DELIVERY' && 'Free Delivery'}
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <div>Min: ₹{coupon.minOrderValue}</div>
                      {coupon.maxDiscount && <div className="text-slate-400">Cap: ₹{coupon.maxDiscount}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        coupon.fundingSource === 'PLATFORM' ? 'bg-indigo-100 text-indigo-800' :
                        coupon.fundingSource === 'BUSINESS' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {coupon.fundingSource}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <div>Used: <strong className="text-slate-900">{coupon.usedCount}</strong> / {coupon.totalUsageLimit}</div>
                      <div className="text-slate-400">Per user: {coupon.perUserUsageLimit}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <div>From: {coupon.startDate.split('T')[0]}</div>
                      <div>To: {coupon.endDate.split('T')[0]}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${coupon.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(coupon.id, coupon.active)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              coupon.active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={coupon.active ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCoupon ? 'Edit Super Admin Coupon' : 'Create New Super Admin Coupon'}
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SURPLUS50"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Coupon Title / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50% Off Surplus Feast"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Save on surplus food orders above ₹200"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="FREE_DELIVERY">Free Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.totalUsageLimit}
                    onChange={(e) => setFormData({ ...formData, totalUsageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Per-User Limit</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.perUserUsageLimit}
                    onChange={(e) => setFormData({ ...formData, perUserUsageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Funding Source</label>
                  <select
                    value={formData.fundingSource}
                    onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="PLATFORM">Platform Funded (Marketing Expense)</option>
                    <option value="BUSINESS">Business Funded (Merchant Discount)</option>
                    <option value="CAMPAIGN">Special Campaign</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Eligible Role</label>
                  <select
                    value={formData.eligibleRole}
                    onChange={(e) => setFormData({ ...formData, eligibleRole: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="CONSUMER">Consumers Only</option>
                    <option value="BUSINESS">Businesses Only</option>
                    <option value="NGO">NGOs Only</option>
                    <option value="ALL">All Roles</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <label htmlFor="activeCheck" className="text-sm font-medium text-slate-800">Activate coupon immediately upon saving</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  {editingCoupon ? 'Save Changes' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
