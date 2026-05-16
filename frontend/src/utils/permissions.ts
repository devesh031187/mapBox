import type { UserRole } from '@/types/enums';

export type NavKey =
  | 'dashboard'
  | 'inventory'
  | 'vendors'
  | 'procurement'
  | 'approvals'
  | 'stock-ops'
  | 'finance'
  | 'reports'
  | 'settings';

export interface NavItemDef {
  key: NavKey;
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItemDef[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'inventory', label: 'Inventory', path: '/inventory' },
  { key: 'vendors', label: 'Vendors', path: '/vendors' },
  { key: 'procurement', label: 'Procurement', path: '/procurement' },
  { key: 'approvals', label: 'Approvals', path: '/approvals' },
  { key: 'stock-ops', label: 'Stock Ops', path: '/stock-ops' },
  { key: 'finance', label: 'Finance', path: '/finance' },
  { key: 'reports', label: 'Reports', path: '/reports' },
  { key: 'settings', label: 'Settings', path: '/settings' },
];

/**
 * Role -> allowed nav keys, derived from spec section 5 and section 22
 * consolidated permission matrix.
 * - dashboard/reports: all roles (Dashboard / export, Reports view/export).
 * - inventory: ADMIN, STORE_MANAGER (item create/edit, par levels).
 * - vendors: ADMIN, STORE_MANAGER (create/edit); GM (approve/blacklist);
 *   FINANCE (banking view).
 * - procurement: ADMIN, STORE_MANAGER, FB_MANAGER (PR/RFQ/CS/PO/GRN);
 *   FINANCE (PO approve T3); GM (PO approve T4 / cancel / CS approve).
 * - approvals: all roles can delegate own approvals and most participate in
 *   an approval tier somewhere, so the inbox is visible to all.
 * - stock-ops: ADMIN, STORE_MANAGER, FB_MANAGER (requisition/transfer/count/
 *   wastage create or approve), GM (count/wastage approve).
 * - finance: ADMIN, FINANCE (invoice/payment/debit notes); GM (high-value
 *   invoice & payment approvals).
 * - settings: ADMIN only (system configuration, users CRUD, tier config).
 */
export const ROLE_NAV_ACCESS: Record<UserRole, NavKey[]> = {
  ADMIN: [
    'dashboard',
    'inventory',
    'vendors',
    'procurement',
    'approvals',
    'stock-ops',
    'finance',
    'reports',
    'settings',
  ],
  STORE_MANAGER: [
    'dashboard',
    'inventory',
    'vendors',
    'procurement',
    'approvals',
    'stock-ops',
    'reports',
  ],
  FB_MANAGER: [
    'dashboard',
    'procurement',
    'approvals',
    'stock-ops',
    'reports',
  ],
  FINANCE: [
    'dashboard',
    'vendors',
    'procurement',
    'approvals',
    'finance',
    'reports',
  ],
  GM_DIRECTOR: [
    'dashboard',
    'vendors',
    'procurement',
    'approvals',
    'stock-ops',
    'finance',
    'reports',
  ],
};

export function getNavForRole(role: UserRole): NavItemDef[] {
  const allowed = ROLE_NAV_ACCESS[role] ?? [];
  return NAV_ITEMS.filter((item) => allowed.includes(item.key));
}

export function canAccessNav(role: UserRole, key: NavKey): boolean {
  return (ROLE_NAV_ACCESS[role] ?? []).includes(key);
}
