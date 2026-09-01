import React, { useState } from 'react';
import { ShoppingBag, Search, Trash2, Tag, IndianRupee } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminListingsView: React.FC = () => {
  const { listings, triggerToast, addAuditLog } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemove = (title: string, id: string) => {
    triggerToast(`Listing ${title} removed by administrator.`, 'success');
    addAuditLog('LISTING_REMOVED', 'ADMIN', `Removed listing ${title} (${id}).`);
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
                  <td className="py-3.5 px-6 font-bold text-slate-800">{l.quantity} units</td>
                  <td className="py-3.5 px-6 font-extrabold text-emerald-600">₹{l.discountPrice} <span className="line-through text-slate-400 font-normal">₹{l.originalPrice}</span></td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => handleRemove(l.title, l.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove Listing"
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
    </div>
  );
};
