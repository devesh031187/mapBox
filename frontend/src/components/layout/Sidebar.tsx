import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getNavForRole } from '@/utils/permissions';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const navItems = user ? getNavForRole(user.role) : [];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-slate-800 bg-slate-900">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
          H
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">HFIMS</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            F&amp;B Inventory
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}

        {/* Master Data sub-links always visible for stock / admin roles */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="px-3 mb-1 text-[10px] uppercase tracking-widest text-slate-500">Master Data</p>
          {[
            { path: '/categories', label: 'Categories' },
            { path: '/storage-locations', label: 'Storage Locations' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-800 px-5 py-3">
        <p className="text-[10px] text-slate-500">
          v0.2.0 &middot; Phase 2
        </p>
      </div>
    </aside>
  );
}
