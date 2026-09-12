import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Star,
  Store as StoreIcon,
  User,
  Calendar,
} from 'lucide-react';

import { storesApi, getErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { LoadingSpinner, ErrorState } from '@/components/ui/Feedback';

export function StoreDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: store,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      const res = await storesApi.getById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState message={getErrorMessage(error)} />;
  if (!store) return <ErrorState message="Store not found" />;

  const ratingCount = store._count?.ratings ?? store.ratings ?? 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Back */}
      <Link to="/admin/stores">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Stores
        </Button>
      </Link>

      {/* Store Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <StoreIcon className="h-8 w-8 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {store.name}
            </h1>

            <div className="mt-1 flex items-center gap-2">
              <StarRating
                value={store.averageRating ?? 0}
                readOnly
                size="sm"
              />

              <span className="text-sm text-slate-600">
                {store.averageRating !== null
                  ? store.averageRating.toFixed(1)
                  : 'No ratings yet'}
              </span>

              <span className="text-sm text-slate-400">
                ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Mail className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Store Email</p>
              <p className="text-sm font-medium text-slate-900">
                {store.email}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <MapPin className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Address</p>
              <p className="text-sm font-medium text-slate-900">
                {store.address || 'No address provided'}
              </p>
            </div>
          </div>

          {/* Owner */}
          {store.owner && (
            <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
              <User className="h-5 w-5 text-slate-400" />

              <div>
                <p className="text-xs text-slate-500">Store Owner</p>

                <p className="text-sm font-medium text-slate-900">
                  {store.owner.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {store.owner.email}
                </p>
              </div>
            </div>
          )}

          {/* Created */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Calendar className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(store.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Updated */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Calendar className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Last Updated</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(store.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
