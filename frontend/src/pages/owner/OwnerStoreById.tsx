import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import {
  ArrowLeft,
  Mail,
  MapPin,
  Star,
  Store as StoreIcon,
  Calendar,
} from 'lucide-react';

import {
  ownerApi,
  getErrorMessage,
} from '@/services/api';

import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';

import {
  LoadingSpinner,
  ErrorState,
  EmptyState,
} from '@/components/ui/Feedback';

interface RatingUser {
  id: string;
  name: string;
  email: string;
}

interface StoreRating {
  id: string;
  userId: string;
  storeId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: RatingUser;
}

interface OwnerStoreDetails {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
  ratingCount: number;
  ratings: StoreRating[];
}

export function OwnerStoreDetail() {
  const { id } = useParams<{
    id: string;
  }>();

  const {
    data: store,
    isLoading,
    isError,
    error,
  } = useQuery<OwnerStoreDetails>({
    queryKey: ['owner-store', id],

    queryFn: async () => {
      if (!id) {
        throw new Error('Store ID is required');
      }

      const res = await ownerApi.getById(id);

      return res.data.data;
    },

    enabled: !!id,
  });

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <LoadingSpinner />
      </div>
    );
  }

  /*
   * Error
   */
  if (isError) {
    return (
      <div className="p-6 lg:p-8">
        <ErrorState
          message={getErrorMessage(error)}
        />
      </div>
    );
  }

  /*
   * Store not found
   */
  if (!store) {
    return (
      <div className="p-6 lg:p-8">
        <ErrorState message="Store not found" />
      </div>
    );
  }

  const ratingCount =
    store.ratingCount ??
    store.ratings?.length ??
    0;

  return (
    <div className="p-6 lg:p-8">
      {/* Back Button */}
      <Link to="/owner/dashboard">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Store Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Store Header */}
        <div className="mb-6 flex items-center gap-4">
          {/* Store Icon */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
            <StoreIcon className="h-8 w-8 text-emerald-600" />
          </div>

          {/* Store Name + Rating */}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">
              {store.name}
            </h1>

            {/* Average Rating */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StarRating
                value={store.averageRating ?? 0}
                readOnly
                size="sm"
              />

              <span className="text-sm font-medium text-slate-600">
                {store.averageRating !== null &&
                store.averageRating !== undefined
                  ? store.averageRating.toFixed(1)
                  : 'No ratings yet'}
              </span>

              <span className="text-sm text-slate-400">
                ({ratingCount}{' '}
                {ratingCount === 1
                  ? 'rating'
                  : 'ratings'}
                )
              </span>
            </div>
          </div>
        </div>

        {/* Store Details */}
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Mail className="h-5 w-5 shrink-0 text-slate-400" />

            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                Store Email
              </p>

              <p className="break-all text-sm font-medium text-slate-900">
                {store.email || 'No email provided'}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                Address
              </p>

              <p className="text-sm font-medium text-slate-900">
                {store.address ||
                  'No address provided'}
              </p>
            </div>
          </div>

          {/* Created */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Calendar className="h-5 w-5 shrink-0 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">
                Created
              </p>

              <p className="text-sm font-medium text-slate-900">
                {new Date(
                  store.createdAt,
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Updated */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Calendar className="h-5 w-5 shrink-0 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">
                Last Updated
              </p>

              <p className="text-sm font-medium text-slate-900">
                {new Date(
                  store.updatedAt,
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Ratings Header */}
        <div className="mb-5 flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" />

          <h2 className="text-lg font-semibold text-slate-900">
            Ratings
          </h2>

          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {ratingCount}
          </span>
        </div>

        {/* No Ratings */}
        {!store.ratings ||
        store.ratings.length === 0 ? (
          <EmptyState
            message="No ratings have been submitted for this store yet."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {store.ratings.map((rating) => (
              <div
                key={rating.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:shadow-sm"
              >
                {/* User + Rating */}
                <div className="flex items-start justify-between gap-4">
                  {/* User */}
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
                      {rating.user.name
                        ?.charAt(0)
                        .toUpperCase() || 'U'}
                    </div>

                    {/* User Info */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {rating.user.name}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {rating.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Rating Number */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                    <span className="text-sm font-semibold text-slate-700">
                      {rating.rating}/5
                    </span>
                  </div>
                </div>

                {/* Stars */}
                <div className="mt-4 flex items-center gap-2">
                  <StarRating
                    value={rating.rating}
                    readOnly
                    size="sm"
                  />
                </div>

                {/* Date */}
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-xs text-slate-500">
                    Submitted on{' '}
                    {new Date(
                      rating.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
