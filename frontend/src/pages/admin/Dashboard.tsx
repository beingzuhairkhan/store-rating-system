import { useQuery } from '@tanstack/react-query';
import { Users, Store, Star, TrendingUp } from 'lucide-react';
import { adminApi, getErrorMessage } from '@/services/api';
import { CardSkeleton, ErrorState } from '@/components/ui/Feedback';

export function AdminDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminApi.stats();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: data?.totalUsers ?? 0, icon: Users, color: 'blue' },
    { label: 'Total Stores', value: data?.totalStores ?? 0, icon: Store, color: 'emerald' },
    { label: 'Total Ratings', value: data?.totalRatings ?? 0, icon: Star, color: 'amber' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${colorMap[stat.color]}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
