import api from '../config/api';
import type { Item, StockLedgerEntry, PagedResponse } from '../types/models';

export interface ListItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  storageLocationId?: string;
  status?: string;
  belowReorder?: boolean;
  abcClass?: string;
}

export const itemsService = {
  list: (params?: ListItemsParams) =>
    api.get<{ success: true; data: PagedResponse<Item> }>('/items', { params }).then(r => r.data.data),
  getOne: (id: string) =>
    api.get<{ success: true; data: Item }>(`/items/${id}`).then(r => r.data.data),
  create: (data: Partial<Item>) =>
    api.post<{ success: true; data: Item }>('/items', data).then(r => r.data.data),
  update: (id: string, data: Partial<Item>) =>
    api.put<{ success: true; data: Item }>(`/items/${id}`, data).then(r => r.data.data),
  stockLedger: (id: string, page = 1, limit = 20) =>
    api.get<{ success: true; data: PagedResponse<StockLedgerEntry> }>(`/items/${id}/stock-ledger`, { params: { page, limit } }).then(r => r.data.data),
  belowReorder: () =>
    api.get<{ success: true; data: Item[] }>('/items/below-reorder').then(r => r.data.data),
};
