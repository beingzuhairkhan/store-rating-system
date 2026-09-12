import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Star, Users, MessageSquare } from 'lucide-react';
import { ownerApi, getErrorMessage } from '@/services/api';
import type { Rating } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import {
  LoadingSpinner,
  ErrorState,
  EmptyState,
  CardSkeleton,
} from '@/components/ui/Feedback';

export function OwnerDashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: async () => {
      const res = await ownerApi.dashboard();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const ratings = data?.ratings ?? [];
  const storeName = data?.storeName ?? 'Your Store';
  const averageRating = data?.averageRating ?? null;
  const totalRatings = data?._count?.ratings ?? 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-2">
          <LayoutDashboard className="h-5 w-5 text-emerald-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {storeName}
          </h1>

          <p className="text-sm text-slate-500">
            Your store dashboard
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Average Rating */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Average Rating
              </p>

              <div className="mt-2 flex items-center gap-3">
                <p className="text-3xl font-bold text-slate-900">
                  {averageRating !== null
                    ? averageRating.toFixed(1)
                    : 'N/A'}
                </p>

                <StarRating
                  value={averageRating}
                  readOnly
                  size="sm"
                />
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3">
              <Star className="h-6 w-6 text-amber-600" />
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
                {totalRatings}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-slate-400" />

        <h2 className="text-lg font-semibold text-slate-900">
          User Ratings
        </h2>
      </div>

      {ratings.length === 0 ? (
        <EmptyState message="No users have rated your store yet." />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    User Name
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Rating
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {ratings.map((rating: any) => (
                  <tr
                    key={rating.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {rating.user?.name ?? 'Unknown User'}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-600">
                      {rating.user?.email ?? '—'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating
                          value={rating.rating}
                          readOnly
                          size="sm"
                        />

                        <span className="text-sm text-slate-600">
                          {rating.rating}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-600">
                      {rating.updatedAt
                        ? new Date(
                            rating.updatedAt,
                          ).toLocaleDateString()
                        : rating.createdAt
                        ? new Date(
                            rating.createdAt,
                          ).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="space-y-3 lg:hidden">
            {ratings.map((rating: any) => (
              <div
                key={rating.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {rating.user?.name ?? 'Unknown User'}
                    </p>

                    <p className="truncate text-sm text-slate-500">
                      {rating.user?.email ?? '—'}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <StarRating
                      value={rating.rating}
                      readOnly
                      size="sm"
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {rating.updatedAt
                    ? `Updated: ${new Date(
                        rating.updatedAt,
                      ).toLocaleDateString()}`
                    : rating.createdAt
                    ? `Submitted: ${new Date(
                        rating.createdAt,
                      ).toLocaleDateString()}`
                    : ''}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
