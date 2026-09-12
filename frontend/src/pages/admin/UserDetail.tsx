import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Shield,
  Store,
  Star,
} from 'lucide-react';
import { adminUsersApi, getErrorMessage } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, ErrorState } from '@/components/ui/Feedback';
import { StarRating } from '@/components/ui/StarRating';

interface StoreDetails {
  id: string;
  name: string;
  email?: string;
  address?: string;
  averageRating: number;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  address?: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
  createdAt: string;
  updatedAt: string;
  stores?: StoreDetails[];
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<UserDetails>({
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
      {/* Back Button */}
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
          {/* Email */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Mail className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900">
                {user.email}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <MapPin className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Address</p>
              <p className="text-sm font-medium text-slate-900">
                {user.address || 'No address provided'}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <Shield className="h-5 w-5 text-slate-400" />

            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm font-medium text-slate-900">
                {user.role}
              </p>
            </div>
          </div>

          {/* Joined */}
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
          {/* Header */}
          <div className="mb-5 flex items-center gap-2">
            <Store className="h-5 w-5 text-slate-500" />

            <h2 className="text-lg font-semibold text-slate-900">
              Stores
            </h2>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {user.stores.length}
            </span>
          </div>

          {/* 2 Stores Per Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {user.stores.map((store) => (
              <div
                key={store.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:shadow-sm"
              >
                {/* Store Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-900">
                      {store.name}
                    </h3>

                    {store.email && (
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {store.email}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                    <span className="text-sm font-semibold text-slate-700">
                      {store.averageRating > 0
                        ? store.averageRating.toFixed(1)
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-3 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                  <p className="text-sm text-slate-600">
                    {store.address || 'No address provided'}
                  </p>
                </div>

                {/* Rating Stars */}
                <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3">
                  <StarRating
                    value={store.averageRating}
                    readOnly
                    size="sm"
                  />

                  <span className="text-xs text-slate-500">
                    Average Rating
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Stores */}
      {(!user.stores || user.stores.length === 0) && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Store className="mx-auto h-10 w-10 text-slate-300" />

          <h2 className="mt-3 text-sm font-semibold text-slate-900">
            No Stores
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            This user does not have any stores.
          </p>
        </div>
      )}
    </div>
  );
}
