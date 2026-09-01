import React, { useState } from 'react';
import { Users, Search, Trash2, Ban, ShieldCheck, Mail, Phone, Calendar, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminUsersView: React.FC = () => {
  const { allUsers, currentUser, triggerToast, addAuditLog, fetchRegisteredUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; role: string; email: string } | null>(null);

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    if ((userToDelete.role === 'ADMIN' || userToDelete.role === 'SUPER_ADMIN') && currentUser?.role !== 'SUPER_ADMIN') {
      triggerToast('You do not have permission to delete administrator accounts.', 'error');
      setUserToDelete(null);
      return;
    }
    if (userToDelete.id === currentUser?.id) {
      triggerToast('Cannot delete currently authenticated administrator session.', 'error');
      setUserToDelete(null);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentUser?.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete user.');
      }
      triggerToast(`User account ${userToDelete.name} deleted permanently.`, 'success');
      await fetchRegisteredUsers();
    } catch (err: any) {
      if (err.status === 403) {
        triggerToast('You do not have permission to perform this action.', 'error');
      } else if (err.status === 404) {
        triggerToast('Record no longer exists.', 'error');
      } else {
        triggerToast(err.message || 'Failed to delete user.', 'error');
      }
    } finally {
      setIsProcessing(false);
      setUserToDelete(null);
    }
  };

  const handleToggleSuspend = async (userId: string, currentBlocked: boolean, userName: string) => {
    setIsProcessing(true);
    try {
      const newStatus = currentBlocked ? 'ACTIVE' : 'SUSPENDED';
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminId: currentUser?.id, reason: 'Admin panel status toggle' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user status.');
      }
      triggerToast(`User ${userName} is now ${newStatus.toLowerCase()}.`, 'success');
      await fetchRegisteredUsers();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update user status.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" /> Platform User Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervise, search, filter, and govern all registered accounts across consumers, businesses, NGOs, and admins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRegisteredUsers()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            title="Refresh Users"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span>Total Records: {allUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Roles</option>
            <option value="CONSUMER">Consumer</option>
            <option value="BUSINESS">Business</option>
            <option value="NGO">NGO</option>
            <option value="RIDER">Rider</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">User / Name</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Contact Details</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No users found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span>{u.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{u.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          u.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : u.role === 'ADMIN'
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            : u.role === 'BUSINESS'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : u.role === 'NGO'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.isBlocked ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">{u.joinedDate || 'Recent'}</td>
                    <td className="py-3.5 px-6 text-right">
                      {u.role === 'SUPER_ADMIN' || u.isProtectedOwner ? (
                        <span className="text-[11px] font-medium text-slate-400 italic pr-2">
                          No actions available
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={isProcessing}
                            onClick={() => handleToggleSuspend(u.id, !!u.isBlocked, u.name)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.isBlocked
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={u.isBlocked ? 'Restore User' : 'Suspend User'}
                            aria-label={u.isBlocked ? 'Restore User' : 'Suspend User'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => setUserToDelete({ id: u.id, name: u.name, role: u.role, email: u.email })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete User Permanently"
                            aria-label="Delete User Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete User?</h3>
                <p className="text-xs text-slate-500">Permanent account and data removal</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-700 border border-slate-200">
              <div><strong>Name:</strong> {userToDelete.name}</div>
              <div><strong>Email:</strong> {userToDelete.email}</div>
              <div><strong>Role:</strong> <span className="font-bold">{userToDelete.role}</span></div>
            </div>

            <p className="text-xs text-rose-600 font-medium">
              "This action will permanently remove this user's account and associated data according to the platform retention policy."
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleDeleteUserConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2"
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

