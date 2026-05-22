import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsService } from '../../services/vendors.service';
import { VENDOR_STATUS_LABELS, PAYMENT_TERMS_LABELS, type VendorStatus } from '../../types/enums';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

type Tab = 'general' | 'banking' | 'items' | 'performance';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

const STATUS_COLORS: Record<VendorStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700', INACTIVE: 'bg-gray-100 text-gray-500',
  BLACKLISTED: 'bg-red-100 text-red-700', UNDER_REVIEW: 'bg-amber-100 text-amber-700',
};

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('general');
  const [perfPage] = useState(1);

  const canViewBanking = user?.role === 'ADMIN' || user?.role === 'FINANCE';
  const isAdmin = user?.role === 'ADMIN';

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorsService.getOne(id!),
    enabled: !!id,
  });

  const { data: items } = useQuery({
    queryKey: ['vendor-items', id],
    queryFn: () => vendorsService.items(id!),
    enabled: tab === 'items' && !!id,
  });

  const { data: perf } = useQuery({
    queryKey: ['vendor-perf', id, perfPage],
    queryFn: () => vendorsService.performance(id!, perfPage),
    enabled: tab === 'performance' && !!id,
  });

  const statusMut = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string }) =>
      vendorsService.setStatus(id!, status, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor', id] }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!vendor) return <div className="text-center py-20 text-gray-400">Vendor not found</div>;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'banking', label: canViewBanking ? 'Banking Details' : '🔒 Banking' },
    { id: 'items', label: 'Linked Items' },
    { id: 'performance', label: 'Performance' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/vendors')} className="text-sm text-blue-600 hover:underline mb-2 block">← Back to Vendors</button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{vendor.companyName}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[vendor.status as VendorStatus]}`}>
              {VENDOR_STATUS_LABELS[vendor.status as VendorStatus]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 font-mono">{vendor.vendorCode}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && vendor.status !== 'BLACKLISTED' && (
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => {
              const reason = window.prompt('Blacklist reason:');
              if (reason) statusMut.mutate({ status: 'BLACKLISTED', reason });
            }}>Blacklist</Button>
          )}
          <Button onClick={() => navigate(`/vendors/${id}/edit`)}>Edit</Button>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Overall Rating', value: vendor.rating ? `${Number(vendor.rating).toFixed(1)} / 5` : null },
          { label: 'On-Time Delivery', value: vendor.onTimeDeliveryRate ? `${Number(vendor.onTimeDeliveryRate).toFixed(1)}%` : null },
          { label: 'Quality Score', value: vendor.qualityScore ? `${Number(vendor.qualityScore).toFixed(1)}%` : null },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.value ?? '—'}</p>
          </Card>
        ))}
      </div>

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

      {tab === 'general' && (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold mb-4">Contact & Address</h3>
            <dl className="space-y-3">
              <Field label="Contact Person" value={vendor.contactPerson} />
              <Field label="Email" value={<a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">{vendor.email}</a>} />
              <Field label="Phone" value={vendor.phone} />
              <Field label="Alternate Phone" value={vendor.alternatePhone} />
              <Field label="Address" value={[vendor.addressLine1, vendor.addressLine2, `${vendor.city}, ${vendor.state} ${vendor.pincode}`, vendor.country].filter(Boolean).join(', ')} />
            </dl>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold mb-4">Commercial</h3>
            <dl className="space-y-3">
              <Field label="Category" value={vendor.vendorCategory?.name} />
              <Field label="GSTIN / Tax ID" value={vendor.taxId} />
              <Field label="Payment Terms" value={PAYMENT_TERMS_LABELS[vendor.paymentTerms as keyof typeof PAYMENT_TERMS_LABELS]} />
              <Field label="Credit Limit" value={vendor.creditLimit ? `₹${Number(vendor.creditLimit).toLocaleString('en-IN')}` : null} />
              <Field label="Notes" value={vendor.notes} />
            </dl>
          </Card>
        </div>
      )}

      {tab === 'banking' && (
        <Card>
          {!canViewBanking ? (
            <div className="py-12 text-center">
              <p className="text-4xl mb-3">🔒</p>
              <p className="text-gray-500 text-sm">Banking details are restricted to Finance and Admin roles.</p>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Bank Name" value={vendor.bankName} />
              <Field label="Account Number" value={vendor.bankAccountNo} />
              <Field label="IFSC Code" value={vendor.bankIfsc} />
              <Field label="Branch" value={vendor.bankBranch} />
            </dl>
          )}
        </Card>
      )}

      {tab === 'items' && (
        <Card noPadding className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Item Code', 'Item Name', 'UOM', 'Vendor Item Code', 'Lead Time', 'Min Order Qty', 'Preferred'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items?.map(m => (
                <tr key={m.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/inventory/${m.itemId}`)}>
                  <td className="py-3 px-4 font-mono text-gray-500">{m.item?.itemCode}</td>
                  <td className="py-3 px-4 font-medium">{m.item?.name}</td>
                  <td className="py-3 px-4 text-gray-500">{m.item?.primaryUom}</td>
                  <td className="py-3 px-4 text-gray-500">{m.vendorItemCode ?? '—'}</td>
                  <td className="py-3 px-4">{m.leadTimeDays} days</td>
                  <td className="py-3 px-4">{m.minimumOrderQty ?? '—'}</td>
                  <td className="py-3 px-4">{m.isPreferred ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Preferred</span> : '—'}</td>
                </tr>
              ))}
              {!items?.length && <tr><td colSpan={7} className="py-12 text-center text-gray-400">No items linked to this vendor.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'performance' && (
        <Card noPadding className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Date', 'Promised', 'Actual', 'On Time', 'Delay', 'Ordered', 'Received', 'Rejected', 'Quality %'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(perf as { data: { items: Record<string, unknown>[] } })?.data?.items?.map((r: Record<string, unknown>, i: number) => (
                <tr key={i as number} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{new Date(r.recordedAt as string).toLocaleDateString('en-IN')}</td>
                  <td className="py-2 px-3">{new Date(r.promisedDeliveryDate as string).toLocaleDateString('en-IN')}</td>
                  <td className="py-2 px-3">{r.actualDeliveryDate ? new Date(r.actualDeliveryDate as string).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="py-2 px-3">{r.onTime === null ? '—' : r.onTime ? '✓' : '✗'}</td>
                  <td className="py-2 px-3">{r.delayDays != null ? `${r.delayDays}d` : '—'}</td>
                  <td className="py-2 px-3 tabular-nums">{Number(r.orderedQty).toFixed(3)}</td>
                  <td className="py-2 px-3 tabular-nums">{r.receivedQty != null ? Number(r.receivedQty).toFixed(3) : '—'}</td>
                  <td className="py-2 px-3 tabular-nums text-red-600">{Number(r.rejectedQty).toFixed(3)}</td>
                  <td className="py-2 px-3">{r.qualityPassRate != null ? `${Number(r.qualityPassRate).toFixed(1)}%` : '—'}</td>
                </tr>
              ))}
              {!(perf as { data: { items: unknown[] } })?.data?.items?.length && (
                <tr><td colSpan={9} className="py-12 text-center text-gray-400">No performance records yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
