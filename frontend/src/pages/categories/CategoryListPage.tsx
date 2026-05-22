import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoriesService } from '../../services/categories.service';
import type { ItemCategory } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

const formSchema = z.object({
  name: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required').max(20),
  parentId: z.string().nullable().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
type FormData = z.infer<typeof formSchema>;

function CategoryRow({ cat, depth = 0, onEdit }: { cat: ItemCategory; depth?: number; onEdit: (c: ItemCategory) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="py-2 px-4" style={{ paddingLeft: `${16 + depth * 24}px` }}>
          <div className="flex items-center gap-2">
            {cat.children && cat.children.length > 0 && (
              <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-600 text-xs">
                {open ? '▼' : '▶'}
              </button>
            )}
            {(!cat.children || !cat.children.length) && <span className="w-4 inline-block" />}
            <span className="font-medium text-gray-900">{cat.name}</span>
          </div>
        </td>
        <td className="py-2 px-4 text-sm text-gray-500 font-mono">{cat.code}</td>
        <td className="py-2 px-4 text-sm text-gray-500">{cat.description ?? '—'}</td>
        <td className="py-2 px-4">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {cat.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="py-2 px-4">
          <Button variant="ghost" size="sm" onClick={() => onEdit(cat)}>Edit</Button>
        </td>
      </tr>
      {open && cat.children?.map(child => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} onEdit={onEdit} />
      ))}
    </>
  );
}

export default function CategoryListPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ItemCategory | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: tree, isLoading } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoriesService.tree(),
  });
  const { data: flat } = useQuery({
    queryKey: ['categories', 'flat'],
    queryFn: () => categoriesService.flat(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', code: '', parentId: null, description: '', isActive: true },
  });

  const createMut = useMutation({
    mutationFn: categoriesService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); closeForm(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ItemCategory> }) => categoriesService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); closeForm(); },
  });

  const openCreate = () => { setEditing(null); reset({ name: '', code: '', parentId: null, description: '', isActive: true }); setShowForm(true); };
  const openEdit = (c: ItemCategory) => { setEditing(c); reset({ name: c.name, code: c.code, parentId: c.parentId, description: c.description ?? '', isActive: c.isActive }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const onSubmit = (data: FormData) => {
    const payload = { ...data, parentId: data.parentId || null };
    if (editing) updateMut.mutate({ id: editing.id, data: payload });
    else createMut.mutate(payload);
  };

  const isPending = createMut.isPending || updateMut.isPending;
  const error = createMut.error || updateMut.error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Item Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hierarchical categories for inventory items (max 3 levels)</p>
        </div>
        <Button onClick={openCreate}>+ Add Category</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-lg font-medium">{editing ? 'Edit Category' : 'New Category'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" error={errors.name?.message} {...register('name')} />
              <Input label="Code" error={errors.code?.message} {...register('code')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <select {...register('parentId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— None (Top Level) —</option>
                {flat?.filter(c => c.id !== editing?.id && !c.parentId).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
                {flat?.filter(c => c.parentId && c.id !== editing?.id).map(c => (
                  <option key={c.id} value={c.id}>  └ {c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <Input label="Description" {...register('description')} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" {...register('isActive')} className="h-4 w-4" />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>
            {error && <p className="text-sm text-red-600">{(error as Error).message}</p>}
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Code</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {tree?.map(cat => <CategoryRow key={cat.id} cat={cat} onEdit={openEdit} />)}
              {!tree?.length && (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">No categories yet. Click "+ Add Category" to get started.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
