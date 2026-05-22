import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { itemsService } from '../../services/items.service';
import { categoriesService } from '../../services/categories.service';
import type { Item } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

function stockStatusBadge(item: Item) {
  const stock = Number(item.currentStock);
  const reorder = Number(item.reorderPoint);
  const min = Number(item.parLevelMin);
  if (stock === 0) return <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">Out of Stock</span>;
  if (stock < reorder) return <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">Below Reorder</span>;
  if (stock < min) return <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">Below Min</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">OK</span>;
}

function stockRowClass(item: Item) {
  const stock = Number(item.currentStock);
  const reorder = Number(item.reorderPoint);
  const min = Number(item.parLevelMin);
  if (stock < reorder) return 'bg-red-50';
  if (stock < min) return 'bg-amber-50';
  return '';
}

export default function InventoryListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [belowReorder, setBelowReorder] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['items', { search, categoryId, status, belowReorder, page }],
    queryFn: () => itemsService.list({ search: search || undefined, categoryId: categoryId || undefined, status: status || undefined, belowReorder: belowReorder || undefined, page }),
    placeholderData: prev => prev,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'flat'],
    queryFn: () => categoriesService.flat(true),
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Item Master</h1>
          <p className="text-sm text-gray-500 mt-1">All inventory items with stock levels and par alerts</p>
        </div>
        <Button onClick={() => navigate('/inventory/new')}>+ Add Item</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              placeholder="Name, code or barcode..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input type="checkbox" checked={belowReorder} onChange={e => { setBelowReorder(e.target.checked); setPage(1); }} className="h-4 w-4 accent-red-600" />
            <span className="text-sm font-medium text-red-700">Below Reorder Only</span>
          </label>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-200 inline-block" />Below reorder point</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-200 inline-block" />Below par min</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-200 inline-block" />Adequate stock</span>
      </div>

      <Card noPadding className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Code', 'Name', 'Category', 'UOM', 'Current Stock', 'Reorder Pt', 'Par Min', 'Avg Cost', 'Status', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={`border-b hover:opacity-90 cursor-pointer ${stockRowClass(item)}`} onClick={() => navigate(`/inventory/${item.id}`)}>
                    <td className="py-3 px-4 text-sm font-mono text-gray-600">{item.itemCode}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.category?.name ?? '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.primaryUom}</td>
                    <td className="py-3 px-4 text-sm font-medium">
                      <span className="tabular-nums">{Number(item.currentStock).toFixed(3)}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 tabular-nums">{Number(item.reorderPoint).toFixed(3)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 tabular-nums">{Number(item.parLevelMin).toFixed(3)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 tabular-nums">₹{Number(item.averageCost).toFixed(2)}</td>
                    <td className="py-3 px-4">{stockStatusBadge(item)}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/inventory/${item.id}/edit`); }}>Edit</Button>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td colSpan={10} className="py-12 text-center text-gray-400">No items found. Try adjusting filters or add a new item.</td></tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <span className="text-sm text-gray-500">Page {page} of {totalPages} · {data?.total} items total</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                  <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
