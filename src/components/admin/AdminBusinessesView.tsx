import React, { useState, useEffect } from 'react';
import { Store, Search, CheckCircle, Ban, Building2, MapPin, Trash2, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminBusinessesView: React.FC = () => {
  const { currentUser, triggerToast, addAuditLog } = useApp();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bizToDelete, setBizToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/businesses');
      const data = await res.json();
      if (data.success) {
        setBusinesses(data.businesses || []);
      }
    } catch (err) {
      triggerToast('Failed to load business merchants.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const filteredBusinesses = (businesses || []).filter((b) =>
    (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (id: string, name: string, status: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/businesses/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: 'Admin panel status update', adminId: currentUser?.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update status.');
      setBusinesses(data.businesses);
      triggerToast(`Business merchant ${name} status updated to ${status}.`, 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update status.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBusinessConfirm = async () => {
    if (!bizToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/businesses/${bizToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser?.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete business.');
      setBusinesses(data.businesses);
      triggerToast(`Business merchant ${bizToDelete.name} deleted successfully.`, 'success');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to delete business.', 'error');
    } finally {
      setIsProcessing(false);
      setBizToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-600" /> Business Merchant Governance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage merchant profiles, FSSAI verification compliance, categories, and operational status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBusinesses}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
            Total Merchants: {(businesses || []).length}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search businesses by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Merchant Name</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Location</th>
              <th className="py-3.5 px-6">Rating</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">Loading business merchants...</td>
              </tr>
            ) : (filteredBusinesses || []).length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No business merchants registered.
                </td>
              </tr>
            ) : (
              (filteredBusinesses || []).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {(b.name || 'B').charAt(0)}
                    </div>
                    <div>
                      <span>{b.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{b.id}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-600">{b.category || 'General'}</td>
                  <td className="py-3.5 px-6 text-slate-600 flex items-center gap-1 pt-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.address}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-amber-600">★ {b.rating || '4.8'}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {b.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status !== 'VERIFIED' && (
                        <button
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(b.id, b.name, 'VERIFIED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
                          title="Verify / Approve Business"
                          aria-label="Verify / Approve Business"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        disabled={isProcessing}
                        onClick={() => handleUpdateStatus(b.id, b.name, b.status === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED')}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100 transition-colors"
                        title={b.status === 'SUSPENDED' ? 'Restore Business' : 'Suspend Business'}
                        aria-label={b.status === 'SUSPENDED' ? 'Restore Business' : 'Suspend Business'}
                      >
                        {b.status === 'SUSPENDED' ? 'Restore' : 'Suspend'}
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => setBizToDelete({ id: b.id, name: b.name })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Business"
                        aria-label="Delete Business"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {bizToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Delete Business Merchant?</h3>
            <p className="text-xs text-slate-600">
              This will permanently delete merchant <strong>{bizToDelete.name}</strong>, their active listings, and associated records according to retention rules.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setBizToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleDeleteBusinessConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                {isProcessing ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

