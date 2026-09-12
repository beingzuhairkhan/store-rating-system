import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Shield,
  Star,
  Store,
} from 'lucide-react';
import { adminUsersApi, getErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, ErrorState } from '@/components/ui/Feedback';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await adminUsersApi.getById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} />;
  }

  if (!user) {
    return <ErrorState message="User not found" />;
  }

  return (
    <div className="p-6 lg:p-8">
      <Link to="/admin/users">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </Link>

      {/* User Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {user.name}
            </h1>

            <span
              className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Mail className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <MapPin className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Address</p>
              <p className="text-sm font-medium text-slate-900">
                {user.address || 'No address provided'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Shield className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm font-medium text-slate-900">
                {user.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="h-5 w-5" />

            <div>
              <p className="text-xs text-slate-500">Joined</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stores */}
      {user.stores && user.stores.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Store className="h-5 w-5 text-slate-500" />

            <h2 className="text-lg font-semibold text-slate-900">
              Stores
            </h2>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {user.stores.length}
            </span>
          </div>

          <div className="space-y-3">
            {user.stores.map((store: any) => (
              <div
                key={store.id}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {store.name}
                    </h3>

                    {store.email && (
                      <p className="mt-1 text-sm text-slate-500">
                        {store.email}
                      </p>
                    )}

                    <div className="mt-2 flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                      <p className="text-sm text-slate-600">
                        {store.address || 'No address provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ratings */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />

          <h2 className="text-lg font-semibold text-slate-900">
            Store Ratings
          </h2>

          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {user.ratings?.length ?? 0}
          </span>
        </div>

        {user.ratings && user.ratings.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {user.ratings.map((rating: any) => (
              <div
                key={rating.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Store
                    </p>

                    <h3 className="mt-1 truncate font-semibold text-slate-900">
                      {rating.store?.name || 'Unknown Store'}
                    </h3>
                  </div>

                  <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {rating.rating}/5
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${
                        index < rating.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Rated on{' '}
                  {new Date(rating.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 py-8 text-center">
            <Star className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-2 text-sm text-slate-500">
              This user has not submitted any ratings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
