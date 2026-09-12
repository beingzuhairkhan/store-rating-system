import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Search, MapPin } from 'lucide-react';
import { storesApi, ratingsApi, getErrorMessage } from '@/services/api';
import type { Store as StoreType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { StarRating } from '@/components/ui/StarRating';
import { LoadingSpinner, ErrorState, EmptyState, TableSkeleton } from '@/components/ui/Feedback';
import { inputClasses } from '@/components/ui/FormField';
import { useToast } from '@/hooks/useToast';

export function UserStores() {
  const [page, setPage] = useState(1);
  const [nameSearch, setNameSearch] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState({ name: '', address: '' });
  const [ratingStore, setRatingStore] = useState<StoreType | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['user-stores', page, activeSearch],
    queryFn: async () => {
      const res = await storesApi.list({
        page,
        name: activeSearch.name || undefined,
        address: activeSearch.address || undefined,
      });
      return res.data.data;
    },
  });


  const stores: StoreType[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const ratingMutation = useMutation({
    mutationFn: async ({ storeId, rating, hasExisting }: { storeId: string; rating: number; hasExisting: boolean }) => {
      if (hasExisting) {
        return ratingsApi.update(storeId, rating);
      }
      return ratingsApi.submit(storeId, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stores'] });
      toast('Rating saved successfully!');
      setRatingStore(null);
      setSelectedRating(0);
    },
    onError: (error) => {
      toast(getErrorMessage(error), 'error');
    },
  });

  const handleSearch = () => {
    setActiveSearch({ name: nameSearch, address: addressSearch });
    setPage(1);
  };

  const openRating = (store: StoreType) => {
    setRatingStore(store);
    setSelectedRating(store.userRating ?? 0);
  };

  const submitRating = () => {
    if (!ratingStore || selectedRating < 1 || selectedRating > 5) {
      toast('Please select a rating between 1 and 5', 'error');
      return;
    }
    ratingMutation.mutate({
      storeId: ratingStore.id,
      rating: selectedRating,
      hasExisting: !!ratingStore.userRating,
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2">
          <ShoppingBag className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Stores</h1>
          <p className="text-sm text-slate-500">Search and rate stores in your area</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className={`${inputClasses} pl-10`}
            placeholder="Search by store name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className={`${inputClasses} pl-10`}
            placeholder="Search by address..."
            value={addressSearch}
            onChange={(e) => setAddressSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Store Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Overall Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Your Rating</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{store.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{store.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating value={store.averageRating} readOnly size="sm" />
                        <span className="text-sm text-slate-600">
                          {store.averageRating ? store.averageRating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {store.userRating ? (
                        <div className="flex items-center gap-2">
                          <StarRating value={store.userRating} readOnly size="sm" />
                          <span className="text-sm text-slate-600">{store.userRating}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Not rated</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => openRating(store)}>
                        {store.userRating ? 'Edit Rating' : 'Rate'}
                      </Button>
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
                <p className="text-sm text-slate-500 mt-1">{store.address}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Overall</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarRating value={store.averageRating} readOnly size="sm" />
                      <span className="text-xs text-slate-600">
                        {store.averageRating ? store.averageRating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Your Rating</p>
                    <div className="mt-0.5">
                      {store.userRating ? (
                        <StarRating value={store.userRating} readOnly size="sm" />
                      ) : (
                        <span className="text-xs text-slate-400">Not rated</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => openRating(store)}
                >
                  {store.userRating ? 'Edit Rating' : 'Rate This Store'}
                </Button>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Rating modal */}
      {ratingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => {
              setRatingStore(null);
              setSelectedRating(0);
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {ratingStore.userRating ? 'Edit Your Rating' : 'Rate This Store'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{ratingStore.name}</p>
            <div className="mt-6 flex flex-col items-center gap-4">
              <StarRating
                value={selectedRating}
                onChange={setSelectedRating}
                size="lg"
              />
              <p className="text-sm text-slate-600">
                {selectedRating > 0 ? `${selectedRating} / 5` : 'Select a rating'}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRatingStore(null);
                  setSelectedRating(0);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submitRating}
                loading={ratingMutation.isPending}
                disabled={selectedRating < 1}
              >
                {ratingStore.userRating ? 'Update Rating' : 'Submit Rating'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
