'use client';

import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useTranslation } from '@/hooks/useTranslation';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  UserMinusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface User {
  Id: number;
  Username: string;
  Email: string;
  FullName: string;
  Role: number;
  IsActive: boolean;
  EmailVerified: boolean;
  AuthProvider: string;
  CreatedAt: string;
  LastLogin?: string;
  LastActiveAt?: string;
}

interface UserFilters {
  role?: number;
  isActive?: boolean;
  search?: string;
  authProvider?: string;
  page: number;
  pageSize: number;
}

export default function UsersManagementPage() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    pageSize: 20
  });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.role !== undefined) queryParams.append('role', filters.role.toString());
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.authProvider) queryParams.append('authProvider', filters.authProvider);
      queryParams.append('page', filters.page.toString());
      queryParams.append('pageSize', filters.pageSize.toString());

      const resp = await authenticatedFetch(`/api/admin/users?${queryParams}`);
      const data = await resp.json();
      
      if (resp.ok) {
        const result = data?.Result || data;
        setUsers(result?.Items || result?.items || []);
        setTotalCount(result?.Total || result?.totalCount || 0);
      } else {
        setError(data?.Message || t.error.loadingData);
      }
    } catch (err) {
      setError(t.error.somethingWrong);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  }, 500); // 500ms delay

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters(prev => {
      // If changing non-search filters, keep current search value
      if (key !== 'search') {
        setSearchValue(prev.search || '');
      }
      
      return {
        ...prev,
        [key]: value,
        page: 1 // Reset to first page when filters change
      };
    });
  };

  const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
    try {
      const resp = await authenticatedFetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (resp.ok) {
        await loadUsers(); // Reload data
        alert(t.common.success);
      } else {
        const data = await resp.json();
        alert(data?.Message || t.error.somethingWrong);
      }
    } catch (err) {
      alert(t.error.somethingWrong);
    }
  };

  const toggleUserStatus = (userId: number, currentStatus: boolean) => {
    handleUpdateUser(userId, { IsActive: !currentStatus });
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 0: return t.users.student;
      case 1: return t.users.instructor;
      case 2: return t.users.admin;
      default: return t.common.noData;
    }
  };

  const getRoleBadgeColor = (role: number) => {
    switch (role) {
      case 0: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const totalPages = Math.ceil(totalCount / filters.pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t.users.title}</h1>
          <p className="text-sm text-gray-600">{t.users.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {t.common.total}: {totalCount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.common.search}
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t.users.searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.users.role}
            </label>
            <select
              value={filters.role || ''}
              onChange={(e) => handleFilterChange('role', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.common.filter} - {t.users.role}</option>
              <option value="0">{t.users.student}</option>
              <option value="1">{t.users.instructor}</option>
              <option value="2">{t.users.admin}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.users.status}
            </label>
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => handleFilterChange('isActive', e.target.value ? e.target.value === 'true' : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.common.filter} - {t.users.status}</option>
              <option value="true">{t.users.active}</option>
              <option value="false">{t.users.inactive}</option>
            </select>
          </div>

          {/* Auth Provider Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.userAnalytics.authProviders}
            </label>
            <select
              value={filters.authProvider || ''}
              onChange={(e) => handleFilterChange('authProvider', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.common.filter}</option>
              <option value="local">Local</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">{t.common.loading}</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={loadUsers}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t.error.tryAgain}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.users.name}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.users.role}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.users.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.users.lastLogin}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.users.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.Id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserGroupIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.FullName || user.Username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.Email}
                          </div>
                          <div className="text-xs text-gray-400">
                            @{user.Username}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.AuthProvider} • {user.EmailVerified ? t.userAnalytics.verified : t.userAnalytics.unverified}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.Role)}`}>
                        {getRoleName(user.Role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.IsActive)}`}>
                        {user.IsActive ? t.users.active : t.users.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {user.LastLogin ? new Date(user.LastLogin).toLocaleDateString() : '-'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {t.users.createdAt}: {new Date(user.CreatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.Id, user.IsActive)}
                          className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                            user.IsActive 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.IsActive ? t.users.inactive : t.users.active}
                        >
                          {user.IsActive ? (
                            <UserMinusIcon className="h-4 w-4" />
                          ) : (
                            <UserPlusIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {/* TODO: Edit user modal */}}
                          className="text-blue-600 hover:text-blue-800"
                          title={t.common.edit}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* TODO: View user details */}}
                          className="text-gray-600 hover:text-gray-800"
                          title={t.common.view}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t.common.previous}
              </button>
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t.common.next}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t.common.page} <span className="font-medium">{(filters.page - 1) * filters.pageSize + 1}</span> - <span className="font-medium">{Math.min(filters.page * filters.pageSize, totalCount)}</span> {t.common.of} <span className="font-medium">{totalCount}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t.common.previous}
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange('page', pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === filters.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                    disabled={filters.page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t.common.next}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}