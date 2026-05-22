import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { storageLocationsService } from '../../services/storage-locations.service';
import type { StorageLocation } from '../../types/models';
import { STORAGE_ZONE_LABELS, type StorageZone } from '../../types/enums';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

const ZONES = Object.keys(STORAGE_ZONE_LABELS) as StorageZone[];

const formSchema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required').max(20),
  zone: z.string().min(1, 'Required'),
  temperatureMinC: z.coerce.number().nullable().optional(),
  temperatureMaxC: z.coerce.number().nullable().optional(),
  capacityDescription: z.string().optional(),
  isActive: z.boolean().optional(),
});
type FormData = z.infer<typeof formSchema>;

const ZONE_COLORS: Record<StorageZone, string> = {
  DRY_STORE: 'bg-amber-100 text-amber-700',
  COLD_ROOM: 'bg-blue-100 text-blue-700',
  FREEZER: 'bg-cyan-100 text-cyan-700',
  BAR_STORE: 'bg-purple-100 text-purple-700',
  KITCHEN: 'bg-orange-100 text-orange-700',
  HOUSEKEEPING: 'bg-green-100 text-green-700',
  GENERAL: 'bg-gray-100 text-gray-700',
};

export default function StorageLocationListPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<StorageLocation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [zoneFilter, setZoneFilter] = useState('');

  const { data: locations, isLoading } = useQuery({
    queryKey: ['storage-locations', zoneFilter],
    queryFn: () => storageLocationsService.list(zoneFilter ? { zone: zoneFilter } : undefined),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', code: '', zone: '', isActive: true },
  });

  const createMut = useMutation({
    mutationFn: storageLocationsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['storage-locations'] }); closeForm(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StorageLocation> }) => storageLocationsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['storage-locations'] }); closeForm(); },
  });

  const openCreate = () => { setEditing(null); reset({ name: '', code: '', zone: '', isActive: true }); setShowForm(true); };
  const openEdit = (l: StorageLocation) => {
    setEditing(l);
    reset({ name: l.name, code: l.code, zone: l.zone, temperatureMinC: l.temperatureMinC ?? undefined, temperatureMaxC: l.temperatureMaxC ?? undefined, capacityDescription: l.capacityDescription ?? '', isActive: l.isActive });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const onSubmit = (data: FormData) => {
    if (editing) updateMut.mutate({ id: editing.id, data: data as Partial<StorageLocation> });
    else createMut.mutate(data as Partial<StorageLocation>);
  };

  const isPending = createMut.isPending || updateMut.isPending;
  const mutError = createMut.error || updateMut.error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Storage Locations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage stores, cold rooms, and kitchen storage areas</p>
        </div>
        <Button onClick={openCreate}>+ Add Location</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setZoneFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!zoneFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>All</button>
        {ZONES.map(z => (
          <button key={z} onClick={() => setZoneFilter(z)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${zoneFilter === z ? 'bg-blue-600 text-white border-blue-600' : `${ZONE_COLORS[z]} border-transparent hover:opacity-80`}`}>
            {STORAGE_ZONE_LABELS[z]}
          </button>
        ))}
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-lg font-medium">{editing ? 'Edit Location' : 'New Storage Location'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" error={errors.name?.message} {...register('name')} />
              <Input label="Code" error={errors.code?.message} {...register('code')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
              <select {...register('zone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select zone...</option>
                {ZONES.map(z => <option key={z} value={z}>{STORAGE_ZONE_LABELS[z]}</option>)}
              </select>
              {errors.zone && <p className="text-xs text-red-600 mt-1">{errors.zone.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Temp (°C)" type="number" step="0.1" {...register('temperatureMinC')} />
              <Input label="Max Temp (°C)" type="number" step="0.1" {...register('temperatureMaxC')} />
            </div>
            <Input label="Capacity Description" {...register('capacityDescription')} placeholder="e.g. 50 pallets, 2 tonne cold room" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4" />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>
            {mutError && <p className="text-sm text-red-600">{(mutError as Error).message}</p>}
            <div className="flex gap-3">
              <Button type="submit" isLoading={isPending}>{editing ? 'Save Changes' : 'Create'}</Button>
              <Button variant="ghost" type="button" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card noPadding className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Name', 'Code', 'Zone', 'Temperature', 'Capacity', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {locations?.map(loc => (
                <tr key={loc.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{loc.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 font-mono">{loc.code}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ZONE_COLORS[loc.zone as StorageZone]}`}>
                      {STORAGE_ZONE_LABELS[loc.zone as StorageZone]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {loc.temperatureMinC != null && loc.temperatureMaxC != null
                      ? `${loc.temperatureMinC}°C – ${loc.temperatureMaxC}°C`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{loc.capacityDescription ?? '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${loc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {loc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(loc)}>Edit</Button>
                  </td>
                </tr>
              ))}
              {!locations?.length && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No storage locations yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
