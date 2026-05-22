import api from '../config/api';
import type { ItemCategory } from '../types/models';

export const categoriesService = {
  tree: () => api.get<{ success: true; data: ItemCategory[] }>('/categories/tree').then(r => r.data.data),
  flat: (isActive?: boolean) =>
    api.get<{ success: true; data: ItemCategory[] }>('/categories/flat', { params: { isActive } }).then(r => r.data.data),
  getOne: (id: string) =>
    api.get<{ success: true; data: ItemCategory }>(`/categories/${id}`).then(r => r.data.data),
  create: (data: Partial<ItemCategory>) =>
    api.post<{ success: true; data: ItemCategory }>('/categories', data).then(r => r.data.data),
  update: (id: string, data: Partial<ItemCategory>) =>
    api.put<{ success: true; data: ItemCategory }>(`/categories/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
