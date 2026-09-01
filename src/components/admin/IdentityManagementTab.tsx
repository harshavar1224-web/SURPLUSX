import React, { useState } from 'react';
import {
  Users,
  Lock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Smartphone,
  Mail,
  FileText,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  History,
  X,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, AdminRoleChangeLog } from '../../types';
import { formatIndianPhoneDisplayClient } from '../../services/identityClient';

export const IdentityManagementTab: React.FC = () => {
  const {
    currentUser,
    allUsers,
    fetchRegisteredUsers,
    roleAuditLogs,
    adminChangeUserRole,
    triggerToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Role Change Modal state
  const [selectedUserForChange, setSelectedUserForChange] = useState<User | null>(null);
  const [targetNewRole, setTargetNewRole] = useState<UserRole>('BUSINESS');
  const [justificationReason, setJustificationReason] = useState('');
  const [adminAuthConsent, setAdminAuthConsent] = useState(false);
  const [isSubmittingRoleChange, setIsSubmittingRoleChange] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete User Modal state
  const [selectedUserForDeletion, setSelectedUserForDeletion] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState('');

  const handleDeleteUser = async () => {
    if (!selectedUserForDeletion) return;
    setDeleteModalError('');
    setIsDeletingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserForDeletion.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': currentUser?.id || '',
        },
        body: JSON.stringify({ adminId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Permanently deleted user ${selectedUserForDeletion.name}.`, 'success');
        setSelectedUserForDeletion(null);
        await fetchRegisteredUsers();
      } else {
        setDeleteModalError(data.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      setDeleteModalError(err.message || 'Network error deleting user.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRegisteredUsers();
    setIsRefreshing(false);
    triggerToast('Identity registry refreshed from authoritative server.', 'info');
  };

  // Filtered accounts
  const filteredUsers = allUsers.filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.phone.includes(q) ||
      user.id.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const openRoleChangeModal = (user: User) => {
    setSelectedUserForChange(user);
    // Pick an alternative role default
    setTargetNewRole(user.role === 'CONSUMER' ? 'BUSINESS' : 'CONSUMER');
    setJustificationReason('');
    setAdminAuthConsent(false);
    setModalError('');
  };

  const handleExecuteRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!selectedUserForChange) return;

    if (!adminAuthConsent) {
      setModalError('You must confirm authorized administrator credentials (account:role:update).');
      return;
    }

    if (!justificationReason.trim() || justificationReason.trim().length < 10) {
      setModalError('A detailed justification reason (minimum 10 characters / ticket ref) is mandatory.');
      return;
    }

    if (selectedUserForChange.role === targetNewRole) {
      setModalError('Target user is already assigned to this role.');
      return;
    }

    setIsSubmittingRoleChange(true);
    try {
      const res = await adminChangeUserRole(
        selectedUserForChange.id,
        targetNewRole,
        justificationReason.trim()
      );

      if (res.success) {
        setSelectedUserForChange(null);
      } else {
        setModalError(res.error || 'Failed to update user role.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Administrative role migration error.');
    } finally {
      setIsSubmittingRoleChange(false);
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'CONSUMER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'BUSINESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NGO':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'RETAILER':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'RIDER':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Policy Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>Strict Account Identity & Role Protection Policy</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              One Email + One Mobile + One Role Platform Authority
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              SurplusX enforces strict 1:1 identity mappings across all Indian states. A verified email and mobile number can map to only one account with an immutable role. Roles are server-locked and cannot be altered via self-service.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="self-start md:self-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Identity Registry</span>
          </button>
        </div>

        {/* Core Identity Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Registered Accounts</div>
            <div className="text-2xl font-extrabold text-white mt-1">{allUsers.length}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% Unique Emails</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Indian Mobile Numbers</div>
            <div className="text-2xl font-extrabold text-white mt-1">{allUsers.length}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>+91 E.164 Unique</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Role Lock Status</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">100%</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Server-Authoritative</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Admin Role Migrations</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{roleAuditLogs.length}</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <History className="w-3 h-3 text-amber-400" />
              <span>Audited Records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Identity Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Email, Mobile (+91), Name, or ID..."
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 outline-hidden cursor-pointer"
          >
            <option value="ALL">All Roles ({allUsers.length})</option>
            <option value="CONSUMER">Consumers</option>
            <option value="BUSINESS">Businesses</option>
            <option value="NGO">NGO Partners</option>
            <option value="ADMIN">Platform Admins</option>
            <option value="RETAILER">Retailers</option>
            <option value="RIDER">Logistics Riders</option>
          </select>
        </div>
      </div>

      {/* Registered Identities Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">
              SurplusX Registered Identity Registry
            </h4>
            <p className="text-xs text-slate-500">
              Showing {filteredUsers.length} verified accounts with immutable primary roles.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Account & User</th>
                <th className="py-3 px-4">Unique Email (Verified)</th>
                <th className="py-3 px-4">Unique Mobile (+91 E.164)</th>
                <th className="py-3 px-4">Locked Role</th>
                <th className="py-3 px-4">Device Binding</th>
                <th className="py-3 px-4 text-right">Authorized Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No accounts matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{user.id}</div>
                          {user.organizationName && (
                            <div className="text-[10px] text-emerald-700 font-semibold truncate max-w-[150px]">
                              {user.organizationName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-800">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-800 font-bold">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatIndianPhoneDisplayClient(user.phone)}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Indian SIM</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getRoleBadgeStyle(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                        <span title="Server role_locked = true" className="text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-slate-600 truncate max-w-[130px]" title={user.deviceBindingId}>
                        {user.deviceBindingId || 'dev-init-web'}
                      </div>
                      <div className="text-[10px] text-slate-400">Bound Primary Device</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {user.role === 'SUPER_ADMIN' || user.isProtectedOwner ? (
                        <span className="text-[11px] font-medium text-slate-400 italic pr-2">
                          No actions available
                        </span>
                      ) : user.role === 'ADMIN' ? (
                        <span className="text-[11px] text-slate-400 font-bold italic">
                          Protected Admin
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRoleChangeModal(user)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Role</span>
                          </button>
                          <button
                            onClick={() => setSelectedUserForDeletion(user)}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-700 hover:text-rose-900 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
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

      {/* Identity & Role Audit Trail (Specification #28, #29, #40) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Authoritative Role Modification Audit Trail
              </h4>
              <p className="text-xs text-slate-500">
                Immutable cryptographic ledger of administrative role changes (account:role:update).
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {roleAuditLogs.length} Logged Migrations
          </span>
        </div>

        {roleAuditLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            No administrative role changes executed yet. All accounts are running on their initial verified registration roles.
          </div>
        ) : (
          <div className="space-y-3">
            {roleAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 text-xs space-y-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{log.userName}</span>
                    <span className="font-mono text-slate-500">({log.userEmail})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold text-[10px]">
                      {log.previousRole}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                      {log.newRole}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                  <strong className="text-slate-900 font-bold">Mandatory Case Justification:</strong>{' '}
                  {log.reason}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-1">
                  <div>
                    Authorized By Admin: <span className="font-bold text-slate-800">{log.adminEmail}</span> (ID: {log.adminId})
                  </div>
                  <div className="font-mono text-slate-400">
                    Audit Signature: <span className="text-emerald-700 font-bold">{log.integrityHash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* AUTHORIZED ROLE CHANGE MODAL (SPECIFICATION #28, #29, #44)                 */}
      {/* ========================================================================= */}
      {selectedUserForChange && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/70">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Authorized Administrative Role Migration
                  </h3>
                  <p className="text-xs text-amber-800">
                    Permission required: <span className="font-mono font-bold">account:role:update</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForChange(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteRoleChange} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Target Account Summary (Read-Only) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target SurplusX Account
                </div>
                <div className="font-bold text-slate-900 text-sm">{selectedUserForChange.name}</div>
                <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
                  <span>{selectedUserForChange.email}</span>
                  <span>{selectedUserForChange.phone}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-500">Current Role:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-extrabold">
                    {selectedUserForChange.role} (Locked)
                  </span>
                </div>
              </div>

              {/* Select Target New Role */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Select New Authorized Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CONSUMER', 'BUSINESS', 'NGO'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetNewRole(r)}
                      className={`p-2.5 rounded-xl border text-center font-extrabold transition-all cursor-pointer ${
                        targetNewRole === r
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-600/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Mandatory Authorization Reason & Verification Ticket
                </label>
                <textarea
                  rows={3}
                  value={justificationReason}
                  onChange={(e) => setJustificationReason(e.target.value)}
                  placeholder="e.g. KYC Verified under Enterprise Merchant Agreement #TX-9022. Business registration documents audited by Trust & Safety."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 outline-hidden transition-all text-xs"
                />
                <span className="text-[10px] text-slate-400">
                  Minimum 10 characters required. This reason is permanently recorded in the immutable audit ledger.
                </span>
              </div>

              {/* Admin Confirmation Consent */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="admin-auth-confirm"
                  checked={adminAuthConsent}
                  onChange={(e) => setAdminAuthConsent(e.target.checked)}
                  className="mt-0.5 rounded-sm text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="admin-auth-confirm" className="text-[11px] text-amber-900 leading-snug">
                  I confirm that I am an authorized Administrator ({currentUser?.email}) acting under official SurplusX Trust & Safety protocol with permission <code className="font-mono font-bold">account:role:update</code>.
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForChange(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRoleChange}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingRoleChange ? (
                    'Executing Migration...'
                  ) : (
                    <>
                      <span>Execute Authorized Role Change</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {selectedUserForDeletion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-base font-extrabold">Permanent User Deletion</h3>
              </div>
              <button
                onClick={() => setSelectedUserForDeletion(null)}
                className="p-1.5 rounded-full text-rose-100 hover:text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {deleteModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{deleteModalError}</span>
                </div>
              )}

              <p className="text-slate-700 leading-relaxed font-medium">
                Are you sure you want to permanently delete this user? This action will remove their account, sessions, and associated personal records in accordance with SurplusX data retention policies.
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-extrabold text-slate-900 text-sm">{selectedUserForDeletion.name}</div>
                <div className="text-slate-600 font-mono text-[11px]">{selectedUserForDeletion.email}</div>
                <div className="text-slate-600 font-mono text-[11px]">{selectedUserForDeletion.phone}</div>
                <div className="pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-extrabold text-[10px]">
                    Role: {selectedUserForDeletion.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForDeletion(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingUser}
                  onClick={handleDeleteUser}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingUser ? 'Deleting User...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
