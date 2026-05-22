import type { UserRole, UserStatus, ItemStatus, VendorStatus, StorageZone, Uom, PaymentTerms } from './enums';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ItemCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  parentId: string | null;
  children?: ItemCategory[];
  parent?: ItemCategory | null;
}

export interface StorageLocation {
  id: string;
  name: string;
  code: string;
  zone: StorageZone;
  outletId: string | null;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  capacityDescription: string | null;
  isActive: boolean;
  outlet?: { id: string; name: string; code: string } | null;
}

export interface Item {
  id: string;
  itemCode: string;
  name: string;
  description: string | null;
  categoryId: string;
  primaryUom: Uom;
  secondaryUom: Uom | null;
  conversionFactor: number | null;
  storageLocationId: string;
  parLevelMin: number;
  parLevelMax: number;
  reorderPoint: number;
  reorderQty: number;
  currentStock: number;
  averageCost: number;
  lastPurchasePrice: number | null;
  isPerishable: boolean;
  shelfLifeDays: number | null;
  hsnCode: string | null;
  taxRatePercent: number;
  status: ItemStatus;
  imageUrl: string | null;
  trackBatches: boolean;
  trackExpiry: boolean;
  nearExpiryDays: number | null;
  barcode: string | null;
  abcClass: 'A' | 'B' | 'C' | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string; code: string };
  storageLocation?: { id: string; name: string; code: string; zone: StorageZone };
}

export interface StockLedgerEntry {
  id: string;
  itemId: string;
  movementType: string;
  referenceCode: string | null;
  qtyIn: number;
  qtyOut: number;
  unitCost: number;
  balanceQty: number;
  balanceValue: number;
  remarks: string | null;
  createdAt: string;
}

export interface VendorCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  companyName: string;
  tradeName: string | null;
  vendorCategoryId: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  taxId: string | null;
  paymentTerms: PaymentTerms;
  creditLimit: number | null;
  bankName: string | null;
  bankAccountNo: string | null;
  bankIfsc: string | null;
  bankBranch: string | null;
  status: VendorStatus;
  blacklistReason: string | null;
  rating: number | null;
  onTimeDeliveryRate: number | null;
  qualityScore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vendorCategory?: { id: string; name: string; code: string };
}

export interface VendorItemMapping {
  id: string;
  vendorId: string;
  itemId: string;
  vendorItemCode: string | null;
  vendorItemDescription: string | null;
  leadTimeDays: number;
  minimumOrderQty: number | null;
  isPreferred: boolean;
  isActive: boolean;
  vendor?: { id: string; vendorCode: string; companyName: string };
  item?: { id: string; itemCode: string; name: string; primaryUom: Uom };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponseData extends AuthTokens {
  user: User;
}
