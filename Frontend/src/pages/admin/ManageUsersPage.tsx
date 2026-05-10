import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, ChevronLeft, ChevronRight,
  ShieldCheck, ShieldOff, UserCog,
  XCircle, Loader2, MailCheck, MailX, Trash2, AlertTriangle, BookOpen, Award, Check
} from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import { formatDate } from '@/utils';
import toast from 'react-hot-toast';

const ROLES = ['Student', 'Instructor', 'Admin'];

const roleBadge: Record<string, string> = {
  Student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Instructor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

// ── Confirmation Dialog
const ConfirmDialog: React.FC<{
  user: any;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ user, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    />
    {/* Dialog */}
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-rose-600" />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
            Delete User
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to permanently delete{' '}
            <span className="font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [openRoleMenu, setOpenRoleMenu] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pageSize = 20;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        page,
        pageSize,
        search: search || undefined,  // ✅ send search to backend
      });
      setUsers(res.data ?? res.items ?? res ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalCount(res.totalCount ?? 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const handler = () => setOpenRoleMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // ── Search: reset to page 1 when search changes
  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  // ── Toggle Status
  const handleToggleStatus = async (user: any) => {
    try {
      setActionLoading(prev => ({ ...prev, [user.id]: 'status' }));
      await adminApi.toggleUserStatus(user.id);
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u)
      );
      toast.success(
        user.isActive
          ? `${user.firstName} has been deactivated`
          : `${user.firstName} has been activated`,
        { icon: user.isActive ? '🚫' : '✅' }
      );
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(prev => ({ ...prev, [user.id]: '' }));
    }
  };

  // ── Change Role
  const handleChangeRole = async (user: any, newRole: string) => {
    if (newRole === user.role) return;
    try {
      setActionLoading(prev => ({ ...prev, [user.id]: 'role' }));
      setOpenRoleMenu(null);
      await adminApi.updateUserRole(user.id, newRole);
      setUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, role: newRole } : u)
      );
      toast.success(`Role changed to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    } finally {
      setActionLoading(prev => ({ ...prev, [user.id]: '' }));
    }
  };

  // ── Delete User
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await adminApi.deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setTotalCount(prev => prev - 1);
      toast.success(`${deleteTarget.firstName} has been deleted`, { icon: '🗑️' });
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Client-side role + verified filter (search is now handled by backend)
  const filtered = users.filter(u => {
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchVerified =
      !verifiedFilter ||
      (verifiedFilter === 'verified' && u.emailConfirmed) ||
      (verifiedFilter === 'unverified' && !u.emailConfirmed);
    return matchRole && matchVerified;
  });

  const getInitials = (u: any) =>
    `${u.firstName?.charAt(0) ?? ''}${u.lastName?.charAt(0) ?? ''}`.toUpperCase();

  const verifiedCount = users.filter(u => u.emailConfirmed).length;
  const unverifiedCount = users.filter(u => !u.emailConfirmed).length;

  return (
    <div className="flex flex-col gap-8 w-full p-4 md:p-6 lg:p-8 min-h-screen">

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          user={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isLoading={deleteLoading}
        />
      )}

      {/* ── HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#1C1F26] p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Manage Users
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalCount} total users across the platform
            </p>
          </div>
        </div>

        {/* Verified Summary Pills */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
            <MailCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {verifiedCount} Verified
            </span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30 shadow-sm">
            <MailX className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {unverifiedCount} Unverified
            </span>
          </div>
        </div>
      </div>

      {/* ── FILTERS */}
      <div className="bg-white/90 dark:bg-[#1C1F26]/90 backdrop-blur-xl p-3.5 rounded-[2rem] border border-gray-200/60 dark:border-gray-800/60 shadow-lg flex flex-col xl:flex-row gap-4 items-center relative z-10">

        {/* Search */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181A20] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Unique Role Segmented Control */}
        <div className="flex bg-gray-100/80 dark:bg-[#13151A]/80 p-1.5 rounded-[1.25rem] w-full xl:w-auto shadow-inner border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md relative overflow-x-auto hide-scrollbar">
          {[
            { value: '', label: 'All Roles', icon: Users },
            { value: 'Student', label: 'Student', icon: BookOpen },
            { value: 'Instructor', label: 'Instructor', icon: Award },
            { value: 'Admin', label: 'Admin', icon: ShieldCheck },
          ].map((role) => {
            const isActive = roleFilter === role.value;
            const Icon = role.icon;
            return (
              <button
                key={role.value}
                onClick={() => setRoleFilter(role.value)}
                className={`relative flex items-center justify-center gap-2 flex-1 xl:flex-none px-4 lg:px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 ease-out z-10 ${
                  isActive
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white dark:bg-[#1C1F26] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700/50 -z-10" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                <span className="relative z-10 whitespace-nowrap">{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Unique Verified Segmented Control */}
        <div className="flex bg-gray-100/80 dark:bg-[#13151A]/80 p-1.5 rounded-[1.25rem] w-full xl:w-auto shadow-inner border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md relative overflow-x-auto hide-scrollbar">
          {[
            { value: '', label: 'All Users', icon: Users },
            { value: 'verified', label: 'Verified', icon: MailCheck },
            { value: 'unverified', label: 'Unverified', icon: MailX },
          ].map((v) => {
            const isActive = verifiedFilter === v.value;
            const Icon = v.icon;
            return (
              <button
                key={v.value}
                onClick={() => setVerifiedFilter(v.value)}
                className={`relative flex items-center justify-center gap-2 flex-1 xl:flex-none px-4 lg:px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-500 ease-out z-10 ${
                  isActive
                    ? v.value === 'verified' ? 'text-emerald-700 dark:text-emerald-400' : v.value === 'unverified' ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white dark:bg-[#1C1F26] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700/50 -z-10" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? (v.value === 'verified' ? 'text-emerald-500' : v.value === 'unverified' ? 'text-amber-500' : 'text-indigo-500') : 'text-gray-400'}`} />
                <span className="relative z-10 whitespace-nowrap">{v.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSearch}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          Search
        </button>
      </div>

      {/* ── TABLE */}
      <div className="bg-white dark:bg-[#1C1F26] rounded-[2rem] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/80 dark:bg-gray-800/20 border-b border-gray-200 dark:border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-500">
          <div className="col-span-4">User Profile</div>
          <div className="col-span-2">Access Role</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Verification</div>
          <div className="col-span-1">Joined Date</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">No users found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
            {search && (
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg text-sm font-bold transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/30">
            {filtered.map((user) => {
              const isLoadingStatus = actionLoading[user.id] === 'status';
              const isLoadingRole = actionLoading[user.id] === 'role';

              return (
                <div
                  key={user.id}
                  className="group grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors relative"
                >
                  {/* User Info */}
                  <div className="col-span-4 flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-black shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
                      ) : getInitials(user)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="col-span-2 flex items-center">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${roleBadge[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Active Status */}
                  <div className="col-span-1 flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center justify-center w-2 h-2">
                        <div className={`absolute w-full h-full rounded-full opacity-50 animate-ping ${user.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        <div className={`relative w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      </div>
                      <span className={`text-xs font-bold ${user.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Email Verified */}
                  <div className="col-span-2 flex items-center">
                    {user.emailConfirmed ? (
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 w-max">
                        <MailCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 w-max">
                        <MailX className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Unverified</span>
                      </div>
                    )}
                  </div>

                  {/* Joined Date */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{formatDate(user.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                    {/* Change Role Button */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenRoleMenu(openRoleMenu === user.id ? null : user.id)}
                        disabled={isLoadingRole}
                        title="Change Role"
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {isLoadingRole
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <UserCog className="w-4 h-4" />
                        }
                      </button>

                      {/* Stunning Role Popover */}
                      {openRoleMenu === user.id && (
                        <div className="absolute right-0 top-14 z-50 w-72 bg-white/95 dark:bg-[#181A20]/95 backdrop-blur-2xl border border-white/50 dark:border-gray-700/50 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                             <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Assign Role</span>
                             <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                             </div>
                          </div>
                          <div className="flex flex-col gap-1 mt-2">
                            {ROLES.map(role => {
                              const icons = {
                                Student: <BookOpen className="w-5 h-5" />,
                                Instructor: <Award className="w-5 h-5" />,
                                Admin: <ShieldCheck className="w-5 h-5" />
                              };
                              const isCurrent = user.role === role;
                              return (
                                <button
                                  key={role}
                                  onClick={() => handleChangeRole(user, role)}
                                  className={`flex items-center gap-4 p-3 w-full rounded-2xl transition-all duration-300 group
                                    ${isCurrent 
                                      ? 'bg-indigo-600 shadow-xl shadow-indigo-500/30 text-white translate-x-1' 
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:translate-x-1'}`}
                                >
                                  <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-500 ${isCurrent ? 'bg-white/20 text-white shadow-inner' : 'bg-gray-100 dark:bg-gray-900 text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10'}`}>
                                    {icons[role as keyof typeof icons]}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{role}</p>
                                    <p className={`text-[10px] font-semibold mt-0.5 ${isCurrent ? 'text-indigo-200' : 'text-gray-400'}`}>
                                      {role === 'Admin' ? 'Full platform access' : role === 'Instructor' ? 'Can manage courses' : 'Standard learning access'}
                                    </p>
                                  </div>
                                  {isCurrent && (
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-in zoom-in">
                                      <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Toggle Status Button */}
                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={isLoadingStatus}
                      title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      className={`p-2.5 rounded-xl flex items-center justify-center transition-colors shadow-sm disabled:opacity-50
                        ${user.isActive
                          ? 'bg-gray-50 dark:bg-gray-800 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                          : 'bg-gray-50 dark:bg-gray-800 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                        }`}
                    >
                      {isLoadingStatus
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : user.isActive
                          ? <ShieldOff className="w-4 h-4" />
                          : <ShieldCheck className="w-4 h-4" />
                      }
                    </button>

                    {/* ✅ Delete Button */}
                    <button
                      onClick={() => setDeleteTarget(user)}
                      title="Delete User"
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:text-rose-500 flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400">
              Showing {filtered.length} of {totalCount} users — Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors
                      ${page === p
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};