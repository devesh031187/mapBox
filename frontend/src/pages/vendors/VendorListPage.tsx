import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { vendorsService, vendorCategoriesService } from '../../services/vendors.service';
import { VENDOR_STATUS_LABELS, type VendorStatus } from '../../types/enums';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

const STATUS_COLORS: Record<VendorStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
  BLACKLISTED: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
};

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-300 text-xs">No rating</span>;
  const stars = Math.round(Number(rating));
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
      <span className="text-gray-500 text-xs ml-1">{Number(rating).toFixed(1)}</span>
    </span>
  );
}

export default function VendorListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', { search, status, categoryId, page }],
    queryFn: () => vendorsService.list({ search: search || undefined, status: status || undefined, categoryId: categoryId || undefined, page }),
    placeholderData: prev => prev,
  });

  const { data: categories } = useQuery({
    queryKey: ['vendor-categories'],
    queryFn: () => vendorCategoriesService.list(true),
  });

  const vendors = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage supplier master data and performance</p>
        </div>
        <Button onClick={() => navigate('/vendors/new')}>+ Add Vendor</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input label="Search" placeholder="Company, code, contact..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All</option>
              {Object.entries(VENDOR_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card noPadding className="overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><Spinner /></div> : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Code', 'Company', 'Category', 'Contact', 'City', 'Payment Terms', 'Rating', 'Status', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/vendors/${v.id}`)}>
                    <td className="py-3 px-4 text-sm font-mono text-gray-600">{v.vendorCode}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-[180px] truncate">{v.companyName}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{v.vendorCategory?.name ?? '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 max-w-[120px] truncate">{v.contactPerson}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{v.city}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{v.paymentTerms.replace('_', ' ')}</td>
                    <td className="py-3 px-4"><StarRating rating={v.rating} /></td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[v.status as VendorStatus]}`}>
                        {VENDOR_STATUS_LABELS[v.status as VendorStatus]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/vendors/${v.id}/edit`); }}>Edit</Button>
                    </td>
                  </tr>
                ))}
                {!vendors.length && <tr><td colSpan={9} className="py-12 text-center text-gray-400">No vendors found.</td></tr>}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <span className="text-sm text-gray-500">Page {page} of {totalPages} · {data?.total} vendors</span>
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
