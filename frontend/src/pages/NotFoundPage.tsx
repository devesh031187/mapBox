import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you are looking for does not exist or you do not have
        access to it.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
