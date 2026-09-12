import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Star,
  Store,
  MessageSquare,
  Users,
  Eye,
  Search,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { ownerApi, getErrorMessage } from '@/services/api';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';

import {
  LoadingSpinner,
  ErrorState,
  EmptyState,
  CardSkeleton,
} from '@/components/ui/Feedback';
import { Pagination } from '@/components/ui/Pagination';

type OwnerStore = {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number | null;
  ratingCount: number;
};

type OwnerDashboardData = {
  stores: OwnerStore[];

  summary: {
    totalStores: number;
    totalRatings: number;
    averageRating: number | null;
    ratedStores: number;
  };

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type SortField =
  | 'name'
  | 'email'
  | 'address'
  | 'averageRating';

type SortOrder = 'asc' | 'desc';

export function OwnerDashboard() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);

  const [sortBy, setSortBy] =
    useState<SortField>('name');

  const [sortOrder, setSortOrder] =
    useState<SortOrder>('asc');

  const limit = 10;

  /*
   * Debounce search
   *
   * API request is made only after
   * the user stops typing for 400ms.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /*
   * Fetch dashboard data
   */
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OwnerDashboardData>({
    queryKey: [
      'owner-dashboard',
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    ],

    queryFn: async () => {
      const res = await ownerApi.dashboard({
        search: search || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });

      return res.data.data;
    },

    placeholderData: (previousData) => previousData,
  });

  const stores = data?.stores ?? [];
  const summary = data?.summary;

  const totalPages =
    data?.pagination?.totalPages ?? 1;

  /*
   * Sorting
   */
  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((current) =>
        current === 'asc' ? 'desc' : 'asc',
      );
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }

    setPage(1);
  };

  /*
   * Clear search
   */
  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  /*
   * Loading
   */
  if (isLoading && !data) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2">
            <LayoutDashboard className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Owner Dashboard
            </h1>

            <p className="text-sm text-slate-500">
              Manage your stores and view customer ratings
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <LoadingSpinner />
      </div>
    );
  }

  /*
   * Error
   */
  if (isError && !data) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2">
            <LayoutDashboard className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Owner Dashboard
            </h1>

            <p className="text-sm text-slate-500">
              Manage your stores and view customer ratings
            </p>
          </div>
        </div>

        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-2">
          <LayoutDashboard className="h-5 w-5 text-emerald-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Owner Dashboard
          </h1>

          <p className="text-sm text-slate-500">
            Manage your stores and view customer ratings
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Stores */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Stores
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {summary?.totalStores ?? 0}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-3">
              <Store className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Total Ratings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Ratings
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {summary?.totalRatings ?? 0}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Average Rating
              </p>

              <div className="mt-2 flex items-center gap-3">
                <p className="text-3xl font-bold text-slate-900">
                  {summary?.averageRating !== null &&
                  summary?.averageRating !== undefined
                    ? summary.averageRating.toFixed(1)
                    : '0'}
                </p>

                {summary?.averageRating !== null &&
                  summary?.averageRating !== undefined && (
                    <StarRating
                      value={summary.averageRating}
                      readOnly
                      size="sm"
                    />
                  )}
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3">
              <Star className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Rated Stores */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Rated Stores
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {summary?.ratedStores ?? 0}
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stores Header */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-slate-400" />

          <h2 className="text-lg font-semibold text-slate-900">
            Your Stores
          </h2>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Search stores..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Loading */}
      {isLoading && data && (
        <div className="mb-3 text-xs text-slate-400">
          Updating...
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && stores.length === 0 && search && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />

          <p className="mt-3 font-medium text-slate-900">
            No stores found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Try searching with a different store name,
            email, or address.
          </p>

          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={clearSearch}
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      {stores.length > 0 && (
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  {
                    key: 'name' as SortField,
                    label: 'Store Name',
                  },
                  {
                    key: 'email' as SortField,
                    label: 'Email',
                  },
                  {
                    key: 'address' as SortField,
                    label: 'Address',
                  },
                  {
                    key: 'averageRating' as SortField,
                    label: 'Rating',
                  },
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
                          {sortOrder === 'asc'
                            ? '↑'
                            : '↓'}
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
              {stores.map((store) => (
                <tr
                  key={store.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  {/* Store Name */}
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {store.name}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {store.email || '—'}
                  </td>

                  {/* Address */}
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-600">
                    {store.address || '—'}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StarRating
                        value={store.averageRating ?? 0}
                        readOnly
                        size="sm"
                      />

                      <span className="text-sm text-slate-600">
                        {store.averageRating !== null
                          ? store.averageRating.toFixed(1)
                          : 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/owner/stores/${store.id}`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                      >
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
      )}

      {/* Mobile Cards */}
      {stores.length > 0 && (
        <div className="space-y-3 lg:hidden">
          {stores.map((store) => (
            <div
              key={store.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {store.name}
                  </p>

                  <p className="truncate text-sm text-slate-500">
                    {store.email || '—'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <StarRating
                    value={store.averageRating ?? 0}
                    readOnly
                    size="sm"
                  />

                  <span className="text-sm text-slate-600">
                    {store.averageRating !== null
                      ? store.averageRating.toFixed(1)
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <p className="mt-2 truncate text-sm text-slate-500">
                {store.address || '—'}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {store.ratingCount}{' '}
                {store.ratingCount === 1
                  ? 'rating'
                  : 'ratings'}
              </p>

              <Link
                to={`/owner/stores/${store.id}`}
              >
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
      )}

      {/* Pagination */}
      {stores.length > 0 && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
