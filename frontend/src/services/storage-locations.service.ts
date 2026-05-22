import api from '../config/api';
import type { StorageLocation } from '../types/models';

export const storageLocationsService = {
  list: (params?: { outletId?: string; zone?: string; isActive?: boolean }) =>
    api.get<{ success: true; data: StorageLocation[] }>('/storage-locations', { params }).then(r => r.data.data),
  getOne: (id: string) =>
    api.get<{ success: true; data: StorageLocation }>(`/storage-locations/${id}`).then(r => r.data.data),
  create: (data: Partial<StorageLocation>) =>
    api.post<{ success: true; data: StorageLocation }>('/storage-locations', data).then(r => r.data.data),
  update: (id: string, data: Partial<StorageLocation>) =>
    api.put<{ success: true; data: StorageLocation }>(`/storage-locations/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/storage-locations/${id}`),
};
