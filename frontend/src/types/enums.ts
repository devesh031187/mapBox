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

export type ItemStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'UNDER_REVIEW';
export type StorageZone = 'DRY_STORE' | 'COLD_ROOM' | 'FREEZER' | 'BAR_STORE' | 'KITCHEN' | 'HOUSEKEEPING' | 'GENERAL';
export type Uom = 'KG' | 'G' | 'LTR' | 'ML' | 'PCS' | 'DZ' | 'BOX' | 'CAN' | 'BTL' | 'PKT' | 'BG' | 'ROLL';
export type PaymentTerms = 'IMMEDIATE' | 'NET_7' | 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'COD';

export const STORAGE_ZONE_LABELS: Record<StorageZone, string> = {
  DRY_STORE: 'Dry Store',
  COLD_ROOM: 'Cold Room',
  FREEZER: 'Freezer',
  BAR_STORE: 'Bar Store',
  KITCHEN: 'Kitchen',
  HOUSEKEEPING: 'Housekeeping',
  GENERAL: 'General',
};

export const UOM_LABELS: Record<Uom, string> = {
  KG: 'Kilogram (KG)', G: 'Gram (G)', LTR: 'Litre (LTR)', ML: 'Millilitre (ML)',
  PCS: 'Piece (PCS)', DZ: 'Dozen (DZ)', BOX: 'Box', CAN: 'Can',
  BTL: 'Bottle (BTL)', PKT: 'Packet (PKT)', BG: 'Bag (BG)', ROLL: 'Roll',
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  ACTIVE: 'Active', INACTIVE: 'Inactive', BLACKLISTED: 'Blacklisted', UNDER_REVIEW: 'Under Review',
};

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  IMMEDIATE: 'Immediate', NET_7: 'Net 7 Days', NET_15: 'Net 15 Days',
  NET_30: 'Net 30 Days', NET_45: 'Net 45 Days', NET_60: 'Net 60 Days', COD: 'Cash on Delivery',
};
