import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth, getHomeRoute } from '@/hooks/useAuth';

export function Unauthorized() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          You don't have permission to access this page.
        </p>
        <Link to={user ? getHomeRoute(user.role) : '/login'}>
          <Button className="mt-6">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
