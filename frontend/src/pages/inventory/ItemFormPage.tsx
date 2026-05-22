import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { itemsService } from '../../services/items.service';
import { categoriesService } from '../../services/categories.service';
import { storageLocationsService } from '../../services/storage-locations.service';
import { UOM_LABELS, type Uom } from '../../types/enums';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

const UOMS = Object.keys(UOM_LABELS) as Uom[];

const formSchema = z.object({
  itemCode: z.string().min(1, 'Required').max(30),
  name: z.string().min(1, 'Required').max(200),
  description: z.string().optional(),
  categoryId: z.string().uuid('Required'),
  primaryUom: z.string().min(1, 'Required'),
  secondaryUom: z.string().optional(),
  conversionFactor: z.coerce.number().positive().optional(),
  storageLocationId: z.string().uuid('Required'),
  parLevelMin: z.coerce.number().min(0).optional(),
  parLevelMax: z.coerce.number().min(0).optional(),
  reorderPoint: z.coerce.number().min(0).optional(),
  reorderQty: z.coerce.number().min(0).optional(),
  isPerishable: z.boolean().optional(),
  shelfLifeDays: z.coerce.number().int().positive().optional(),
  hsnCode: z.string().max(20).optional(),
  taxRatePercent: z.coerce.number().min(0).max(100).optional(),
  status: z.string().optional(),
  trackBatches: z.boolean().optional(),
  trackExpiry: z.boolean().optional(),
  nearExpiryDays: z.coerce.number().int().positive().optional(),
  barcode: z.string().max(64).optional(),
  abcClass: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function ItemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;

  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsService.getOne(id!),
    enabled: isEdit,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'flat'],
    queryFn: () => categoriesService.flat(true),
  });

  const { data: locations } = useQuery({
    queryKey: ['storage-locations'],
    queryFn: () => storageLocationsService.list({ isActive: true }),
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: 'ACTIVE', parLevelMin: 0, parLevelMax: 0, reorderPoint: 0, reorderQty: 0, taxRatePercent: 0 },
  });

  useEffect(() => {
    if (item) {
      reset({
        itemCode: item.itemCode,
        name: item.name,
        description: item.description ?? '',
        categoryId: item.categoryId,
        primaryUom: item.primaryUom,
        secondaryUom: item.secondaryUom ?? '',
        conversionFactor: item.conversionFactor ?? undefined,
        storageLocationId: item.storageLocationId,
        parLevelMin: Number(item.parLevelMin),
        parLevelMax: Number(item.parLevelMax),
        reorderPoint: Number(item.reorderPoint),
        reorderQty: Number(item.reorderQty),
        isPerishable: item.isPerishable,
        shelfLifeDays: item.shelfLifeDays ?? undefined,
        hsnCode: item.hsnCode ?? '',
        taxRatePercent: Number(item.taxRatePercent),
        status: item.status,
        trackBatches: item.trackBatches,
        trackExpiry: item.trackExpiry,
        nearExpiryDays: item.nearExpiryDays ?? undefined,
        barcode: item.barcode ?? '',
        abcClass: item.abcClass ?? '',
      });
    }
  }, [item, reset]);

  const createMut = useMutation({
    mutationFn: itemsService.create,
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['items'] }); navigate(`/inventory/${data.id}`); },
  });
  const updateMut = useMutation({
    mutationFn: (data: Parameters<typeof itemsService.update>[1]) => itemsService.update(id!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['items'] }); qc.invalidateQueries({ queryKey: ['item', id] }); navigate(`/inventory/${id}`); },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      secondaryUom: data.secondaryUom || undefined,
      abcClass: (data.abcClass as 'A' | 'B' | 'C' | undefined) || undefined,
    };
    if (isEdit) updateMut.mutate(payload as never);
    else createMut.mutate(payload as never);
  };

  const isPending = createMut.isPending || updateMut.isPending;
  const mutError = createMut.error || updateMut.error;
  const isPerishable = watch('isPerishable');

  if (isEdit && itemLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit Item' : 'New Item'}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEdit ? item?.name : 'Add a new inventory item'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate(isEdit ? `/inventory/${id}` : '/inventory')}>Cancel</Button>
          <Button type="submit" isLoading={isPending}>{isEdit ? 'Save Changes' : 'Create Item'}</Button>
        </div>
      </div>

      {mutError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{(mutError as Error).message}</div>}

      {/* General Info */}
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">General Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Item Code *" error={errors.itemCode?.message} {...register('itemCode')} />
          <Input label="Name *" error={errors.name?.message} {...register('name')} className="col-span-1" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select {...register('categoryId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select category...</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
            {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <Input label="Barcode" {...register('barcode')} placeholder="EAN-13, QR, etc." />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ABC Class</label>
            <select {...register('abcClass')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— None —</option>
              <option value="A">A — High Value</option>
              <option value="B">B — Medium Value</option>
              <option value="C">C — Low Value</option>
            </select>
          </div>
        </div>
      </Card>

      {/* UOM */}
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Unit of Measure</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary UOM *</label>
            <select {...register('primaryUom')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select UOM...</option>
              {UOMS.map(u => <option key={u} value={u}>{UOM_LABELS[u]}</option>)}
            </select>
            {errors.primaryUom && <p className="text-xs text-red-600 mt-1">{errors.primaryUom.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary UOM</label>
            <select {...register('secondaryUom')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— None —</option>
              {UOMS.map(u => <option key={u} value={u}>{UOM_LABELS[u]}</option>)}
            </select>
          </div>
          <Input label="Conversion Factor" type="number" step="0.0001" {...register('conversionFactor')} placeholder="e.g. 12 (1 DZ = 12 PCS)" />
        </div>
      </Card>

      {/* Storage & Par */}
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Storage & Par Levels</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location *</label>
          <select {...register('storageLocationId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select location...</option>
            {locations?.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code}) — {l.zone}</option>)}
          </select>
          {errors.storageLocationId && <p className="text-xs text-red-600 mt-1">{errors.storageLocationId.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Par Level Min" type="number" step="0.001" {...register('parLevelMin')} />
          <Input label="Par Level Max" type="number" step="0.001" {...register('parLevelMax')} />
          <Input label="Reorder Point" type="number" step="0.001" {...register('reorderPoint')} />
          <Input label="Reorder Quantity" type="number" step="0.001" {...register('reorderQty')} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input type="checkbox" id="isPerishable" {...register('isPerishable')} className="h-4 w-4" />
          <label htmlFor="isPerishable" className="text-sm text-gray-700">Perishable item</label>
        </div>
        {isPerishable && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input label="Shelf Life (days)" type="number" {...register('shelfLifeDays')} />
            <Input label="Near Expiry Alert (days before)" type="number" {...register('nearExpiryDays')} />
          </div>
        )}
        <div className="mt-4 flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('trackBatches')} className="h-4 w-4" />
            <span className="text-sm text-gray-700">Track Batches</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('trackExpiry')} className="h-4 w-4" />
            <span className="text-sm text-gray-700">Track Expiry (FEFO)</span>
          </label>
        </div>
      </Card>

      {/* Tax */}
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Tax & Compliance</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="HSN Code" {...register('hsnCode')} placeholder="e.g. 09011111" />
          <Input label="GST Rate (%)" type="number" step="0.01" {...register('taxRatePercent')} />
        </div>
      </Card>
    </form>
  );
}
