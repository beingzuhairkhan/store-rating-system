import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Eye } from 'lucide-react';
import { adminUsersApi, getErrorMessage } from '@/services/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import {
  LoadingSpinner,
  ErrorState,
  EmptyState,
} from '@/components/ui/Feedback';
import { inputClasses } from '@/components/ui/FormField';

export function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'admin-users',
      page,
      debouncedSearch,
      roleFilter,
      sortBy,
      sortOrder,
    ],

    queryFn: async () => {
      const res = await adminUsersApi.list({
        page,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        sortBy,
        sortOrder,
      });

      return res.data.data;
    },

    placeholderData: (previousData) => previousData,
  });

  const users: User[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const toggleSort = (field: string) => {
    setPage(1);

    if (sortBy === field) {
      setSortOrder((current) =>
        current === 'asc' ? 'desc' : 'asc',
      );
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2">
            <Users className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Users
            </h1>

            <p className="text-sm text-slate-500">
              {total} total users
            </p>
          </div>
        </div>

        <Link to="/admin/users/create">
          <Button>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            className={`${inputClasses} pl-10`}
            placeholder="Search by name, email, or address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Role filter */}
        <select
          className={`${inputClasses} sm:w-40`}
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
          <option value="STORE_OWNER">Store Owner</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : users.length === 0 ? (
        <EmptyState message="No users found. Try adjusting your search." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'address', label: 'Address' },
                    { key: 'role', label: 'Role' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900"
                      onClick={() => toggleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}

                        {sortBy === col.key && (
                          <span className="text-blue-600">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {user.name}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-600">
                      {user.email}
                    </td>

                    <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-600">
                      {user.address}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-700'
                            : user.role === 'STORE_OWNER'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {user.name}
                    </p>

                    <p className="truncate text-sm text-slate-500">
                      {user.email}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {user.address}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-blue-100 text-blue-700'
                        : user.role === 'STORE_OWNER'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <Link to={`/admin/users/${user.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
