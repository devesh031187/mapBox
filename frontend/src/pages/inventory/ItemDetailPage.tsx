import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { itemsService } from '../../services/items.service';
import { vendorMappingsService } from '../../services/vendors.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { UOM_LABELS, type Uom } from '../../types/enums';

type Tab = 'overview' | 'stock-ledger' | 'vendors';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [ledgerPage, setLedgerPage] = useState(1);

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsService.getOne(id!),
    enabled: !!id,
  });

  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ['item-ledger', id, ledgerPage],
    queryFn: () => itemsService.stockLedger(id!, ledgerPage),
    enabled: tab === 'stock-ledger' && !!id,
  });

  const { data: vendorMappings } = useQuery({
    queryKey: ['vendor-mappings', 'item', id],
    queryFn: () => vendorMappingsService.list({ itemId: id }),
    enabled: tab === 'vendors' && !!id,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!item) return <div className="text-center py-20 text-gray-400">Item not found</div>;

  const stock = Number(item.currentStock);
  const reorder = Number(item.reorderPoint);
  const min = Number(item.parLevelMin);
  const max = Number(item.parLevelMax);

  const stockPct = max > 0 ? Math.min((stock / max) * 100, 100) : 0;
  const barColor = stock < reorder ? 'bg-red-500' : stock < min ? 'bg-amber-500' : 'bg-green-500';

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stock-ledger', label: 'Stock Ledger' },
    { id: 'vendors', label: 'Vendors' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/inventory')} className="text-sm text-blue-600 hover:underline mb-2 block">← Back to Items</button>
          <h1 className="text-2xl font-semibold text-gray-900">{item.name}</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">{item.itemCode}</p>
        </div>
        <Button onClick={() => navigate(`/inventory/${id}/edit`)}>Edit Item</Button>
      </div>

      {/* Stock bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Stock</span>
          <span className="text-2xl font-bold text-gray-900 tabular-nums">
            {stock.toFixed(3)} <span className="text-sm font-normal text-gray-500">{item.primaryUom}</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className={`${barColor} h-3 rounded-full transition-all`} style={{ width: `${stockPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>Min: {min.toFixed(3)}</span>
          <span>Reorder: {reorder.toFixed(3)}</span>
          <span>Max: {max.toFixed(3)}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
          <div><p className="text-xs text-gray-500">Avg Cost</p><p className="font-semibold">₹{Number(item.averageCost).toFixed(2)}</p></div>
          <div><p className="text-xs text-gray-500">Stock Value</p><p className="font-semibold">₹{(stock * Number(item.averageCost)).toFixed(2)}</p></div>
          <div><p className="text-xs text-gray-500">Last Purchase</p><p className="font-semibold">{item.lastPurchasePrice ? `₹${Number(item.lastPurchasePrice).toFixed(2)}` : '—'}</p></div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`pb-3 text-sm font-medium transition-colors ${tab === t.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">General</h3>
            <dl className="grid grid-cols-2 gap-3">
              <Field label="Category" value={item.category?.name} />
              <Field label="Status" value={<span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{item.status}</span>} />
              <Field label="Primary UOM" value={UOM_LABELS[item.primaryUom as Uom]} />
              <Field label="Secondary UOM" value={item.secondaryUom ? UOM_LABELS[item.secondaryUom as Uom] : null} />
              <Field label="Conversion Factor" value={item.conversionFactor} />
              <Field label="ABC Class" value={item.abcClass} />
              <Field label="Barcode" value={item.barcode} />
              <Field label="HSN Code" value={item.hsnCode} />
              <Field label="GST Rate" value={item.taxRatePercent ? `${item.taxRatePercent}%` : null} />
            </dl>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Storage & Tracking</h3>
            <dl className="grid grid-cols-2 gap-3">
              <Field label="Storage Location" value={item.storageLocation?.name} />
              <Field label="Zone" value={item.storageLocation?.zone} />
              <Field label="Perishable" value={item.isPerishable ? 'Yes' : 'No'} />
              <Field label="Shelf Life" value={item.shelfLifeDays ? `${item.shelfLifeDays} days` : null} />
              <Field label="Track Batches" value={item.trackBatches ? 'Yes' : 'No'} />
              <Field label="Track Expiry" value={item.trackExpiry ? 'Yes' : 'No'} />
              <Field label="Near Expiry Alert" value={item.nearExpiryDays ? `${item.nearExpiryDays} days before` : null} />
            </dl>
          </Card>
        </div>
      )}

      {tab === 'stock-ledger' && (
        <Card noPadding className="overflow-hidden">
          {ledgerLoading ? <div className="flex justify-center py-12"><Spinner /></div> : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Date', 'Movement', 'Reference', 'Qty In', 'Qty Out', 'Balance', 'Unit Cost', 'Value', 'Remarks'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ledger?.items.map(e => (
                    <tr key={e.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="py-2 px-3 font-mono text-xs">{e.movementType}</td>
                      <td className="py-2 px-3 text-gray-500">{e.referenceCode ?? '—'}</td>
                      <td className="py-2 px-3 text-green-700 tabular-nums">{Number(e.qtyIn) > 0 ? `+${Number(e.qtyIn).toFixed(3)}` : ''}</td>
                      <td className="py-2 px-3 text-red-700 tabular-nums">{Number(e.qtyOut) > 0 ? `-${Number(e.qtyOut).toFixed(3)}` : ''}</td>
                      <td className="py-2 px-3 font-medium tabular-nums">{Number(e.balanceQty).toFixed(3)}</td>
                      <td className="py-2 px-3 tabular-nums">₹{Number(e.unitCost).toFixed(2)}</td>
                      <td className="py-2 px-3 tabular-nums">₹{Number(e.balanceValue).toFixed(2)}</td>
                      <td className="py-2 px-3 text-gray-400 truncate max-w-[150px]">{e.remarks ?? '—'}</td>
                    </tr>
                  ))}
                  {!ledger?.items.length && <tr><td colSpan={9} className="py-12 text-center text-gray-400">No stock movements recorded yet.</td></tr>}
                </tbody>
              </table>
              {(ledger?.totalPages ?? 0) > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <span className="text-sm text-gray-500">Page {ledgerPage} of {ledger?.totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" disabled={ledgerPage <= 1} onClick={() => setLedgerPage(p => p - 1)}>← Prev</Button>
                    <Button variant="ghost" size="sm" disabled={ledgerPage >= (ledger?.totalPages ?? 1)} onClick={() => setLedgerPage(p => p + 1)}>Next →</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {tab === 'vendors' && (
        <Card noPadding className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Vendor', 'Vendor Code', 'Vendor Item Code', 'Lead Time', 'Min Order Qty', 'Preferred', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendorMappings?.map(m => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{m.vendor?.companyName}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">{m.vendor?.vendorCode}</td>
                  <td className="py-3 px-4 text-gray-500">{m.vendorItemCode ?? '—'}</td>
                  <td className="py-3 px-4">{m.leadTimeDays} day{m.leadTimeDays !== 1 ? 's' : ''}</td>
                  <td className="py-3 px-4">{m.minimumOrderQty ?? '—'}</td>
                  <td className="py-3 px-4">{m.isPreferred ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Preferred</span> : '—'}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{m.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
              {!vendorMappings?.length && <tr><td colSpan={7} className="py-12 text-center text-gray-400">No vendors linked to this item.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
