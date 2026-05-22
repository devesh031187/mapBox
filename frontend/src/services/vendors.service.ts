import api from '../config/api';
import type { Vendor, VendorCategory, VendorItemMapping, PagedResponse } from '../types/models';

export const vendorCategoriesService = {
  list: (isActive?: boolean) =>
    api.get<{ success: true; data: VendorCategory[] }>('/vendor-categories', { params: { isActive } }).then(r => r.data.data),
  create: (data: Partial<VendorCategory>) =>
    api.post<{ success: true; data: VendorCategory }>('/vendor-categories', data).then(r => r.data.data),
  update: (id: string, data: Partial<VendorCategory>) =>
    api.put<{ success: true; data: VendorCategory }>(`/vendor-categories/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/vendor-categories/${id}`),
};

export interface ListVendorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
}

export const vendorsService = {
  list: (params?: ListVendorsParams) =>
    api.get<{ success: true; data: PagedResponse<Vendor> }>('/vendors', { params }).then(r => r.data.data),
  getOne: (id: string) =>
    api.get<{ success: true; data: Vendor }>(`/vendors/${id}`).then(r => r.data.data),
  create: (data: Partial<Vendor>) =>
    api.post<{ success: true; data: Vendor }>('/vendors', data).then(r => r.data.data),
  update: (id: string, data: Partial<Vendor>) =>
    api.put<{ success: true; data: Vendor }>(`/vendors/${id}`, data).then(r => r.data.data),
  setStatus: (id: string, status: string, blacklistReason?: string) =>
    api.patch<{ success: true; data: Vendor }>(`/vendors/${id}/status`, { status, blacklistReason }).then(r => r.data.data),
  performance: (id: string, page = 1, limit = 20) =>
    api.get(`/vendors/${id}/performance`, { params: { page, limit } }).then(r => r.data),
  items: (id: string) =>
    api.get<{ success: true; data: VendorItemMapping[] }>(`/vendors/${id}/items`).then(r => r.data.data),
};

export const vendorMappingsService = {
  list: (params?: { vendorId?: string; itemId?: string }) =>
    api.get<{ success: true; data: VendorItemMapping[] }>('/vendor-mappings', { params }).then(r => r.data.data),
  create: (data: Partial<VendorItemMapping>) =>
    api.post<{ success: true; data: VendorItemMapping }>('/vendor-mappings', data).then(r => r.data.data),
  update: (id: string, data: Partial<VendorItemMapping>) =>
    api.put<{ success: true; data: VendorItemMapping }>(`/vendor-mappings/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/vendor-mappings/${id}`),
};
