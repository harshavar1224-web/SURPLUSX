import React, { useState } from 'react';
import { ShoppingBag, Search, Trash2, Tag, IndianRupee } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminListingsView: React.FC = () => {
  const { listings, triggerToast, addAuditLog, currentUser, fetchListings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<{ id: string; title: string; category: string; quantity: number; price: number; status: string } | null>(null);

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingToDelete.id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'admin',
          'x-user-role': currentUser?.role || 'ADMIN'
        },
        body: JSON.stringify({ adminId: currentUser?.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete listing.');
      }
      triggerToast(`Listing ${listingToDelete.title} removed successfully.`, 'success');
      await fetchListings();
    } catch (err: any) {
      if (err.status === 403) {
        triggerToast('You do not have permission to remove this listing.', 'error');
      } else if (err.status === 409) {
        triggerToast('This listing cannot be removed because it has active transactions.', 'error');
      } else {
        triggerToast(err.message || 'Unable to remove listing. Please try again.', 'error');
      }
    } finally {
      setIsProcessing(false);
      setListingToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-600" /> Surplus Listing Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervise all active food surplus listings, pricing integrity, and safety compliance.
          </p>
        </div>
        <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
          Total Listings: {listings.length}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search listings by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Listing Title</th>
              <th className="py-3.5 px-6">Category</th>
              <th className="py-3.5 px-6">Quantity</th>
              <th className="py-3.5 px-6">Discount Price</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No listings found.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-3">
                    <img src={l.imageUrl} alt={l.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <span>{l.title}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{l.id}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-600">{l.category}</td>
                  <td className="py-3.5 px-6 font-bold text-slate-800">{l.quantityAvailable} units</td>
                  <td className="py-3.5 px-6 font-extrabold text-emerald-600">₹{l.discountPrice} <span className="line-through text-slate-400 font-normal">₹{l.originalPrice}</span></td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                      <button
                        disabled={isProcessing}
                        onClick={() => setListingToDelete({ id: l.id, title: l.title, category: l.category, quantity: l.quantityAvailable, price: l.discountPrice, status: l.status })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Listing"
                        aria-label="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {listingToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Listing?</h3>
                <p className="text-xs text-slate-500">Permanent platform removal</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-700 border border-slate-200">
              <div><strong>Listing:</strong> {listingToDelete.title}</div>
              <div><strong>Category:</strong> {listingToDelete.category}</div>
              <div><strong>Quantity:</strong> {listingToDelete.quantity}</div>
              <div><strong>Price:</strong> ₹{listingToDelete.price}</div>
              <div><strong>Status:</strong> {listingToDelete.status}</div>
            </div>

            <p className="text-xs text-rose-600 font-medium">
              "This action will remove this listing from the active platform."
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setListingToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2"
              >
                {isProcessing ? 'Deleting...' : 'Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
