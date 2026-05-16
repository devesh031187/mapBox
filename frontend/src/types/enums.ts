export type UserRole =
  | 'ADMIN'
  | 'STORE_MANAGER'
  | 'FB_MANAGER'
  | 'FINANCE'
  | 'GM_DIRECTOR';

export const USER_ROLES: UserRole[] = [
  'ADMIN',
  'STORE_MANAGER',
  'FB_MANAGER',
  'FINANCE',
  'GM_DIRECTOR',
];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  STORE_MANAGER: 'Store Manager',
  FB_MANAGER: 'F&B Manager',
  FINANCE: 'Finance',
  GM_DIRECTOR: 'GM / Director',
};

export type UserStatus = 'ACTIVE' | 'INACTIVE';
