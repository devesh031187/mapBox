import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLE_LABELS } from '@/types/enums';
import { Button } from '@/components/ui/Button';

const HOTEL_NAME = 'Grand Continental Hotel';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="fixed inset-x-0 left-60 top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {HOTEL_NAME}
        </p>
        <p className="text-xs text-slate-500">
          Food &amp; Beverage Operations
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <span className="block h-5 w-5 rounded-full border-2 border-current" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-slate-800">
                {user?.name ?? 'User'}
              </span>
              <span className="block text-xs text-slate-500">
                {user ? USER_ROLE_LABELS[user.role] : ''}
              </span>
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="truncate text-sm font-medium text-slate-800">
                  {user?.email}
                </p>
              </div>
              <div className="px-2 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
