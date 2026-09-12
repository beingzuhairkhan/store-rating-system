import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Store, Plus, Search, Eye } from 'lucide-react';
import { storesApi, getErrorMessage } from '@/services/api';
import type { Store as StoreType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { StarRating } from '@/components/ui/StarRating';
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/ui/Feedback';
import { inputClasses } from '@/components/ui/FormField';

export function AdminStores() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-stores', page, search, sortBy, order],
    queryFn: async () => {
      const res = await storesApi.list({ page, search, sortBy, order });
      return res.data.data;
    },
  });

  const stores: StoreType[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2">
            <Store className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stores</h1>
            <p className="text-sm text-slate-500">{total} total stores</p>
          </div>
        </div>
        <Link to="/admin/stores/create">
          <Button>
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : stores.length === 0 ? (
        <EmptyState message="No stores found. Try adjusting your search." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    { key: 'name', label: 'Store Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'address', label: 'Address' },
                    { key: 'averageRating', label: 'Rating' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 cursor-pointer hover:text-slate-900"
                      onClick={() => toggleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortBy === col.key && (
                          <span className="text-blue-600">{order === 'asc' ? '↑' : '↓'}</span>
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
                  <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{store.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{store.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{store.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating value={store.averageRating} readOnly size="sm" />
                        <span className="text-sm text-slate-600">
                          {store.averageRating ? store.averageRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/stores/${store.id}`}>
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
            {stores.map((store) => (
              <div key={store.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-medium text-slate-900">{store.name}</p>
                <p className="text-sm text-slate-500 truncate">{store.email}</p>
                <p className="text-sm text-slate-500 truncate mt-1">{store.address}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={store.averageRating} readOnly size="sm" />
                  <span className="text-sm text-slate-600">
                    {store.averageRating ? store.averageRating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <Link to={`/admin/stores/${store.id}`}>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
