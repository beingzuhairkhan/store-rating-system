import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { Button } from './Button';

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <AlertCircle className="h-10 w-10 text-red-500" />
      <p className="text-sm text-red-600 max-w-md text-center">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Inbox className="h-10 w-10 text-slate-300" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-10 flex-1 rounded-lg bg-slate-100 animate-pulse"
              style={{ animationDelay: `${j * 100}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse mb-4" />
      <div className="h-8 w-24 rounded-lg bg-slate-100 animate-pulse mb-2" />
      <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
    </div>
  );
}
