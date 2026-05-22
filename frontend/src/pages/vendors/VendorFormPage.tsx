import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { vendorsService, vendorCategoriesService } from '../../services/vendors.service';
import { PAYMENT_TERMS_LABELS, VENDOR_STATUS_LABELS } from '../../types/enums';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

const formSchema = z.object({
  vendorCode: z.string().min(1, 'Required').max(30),
  companyName: z.string().min(1, 'Required').max(200),
  tradeName: z.string().optional(),
  vendorCategoryId: z.string().uuid('Required'),
  contactPerson: z.string().min(1, 'Required').max(100),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Required').max(20),
  alternatePhone: z.string().optional(),
  addressLine1: z.string().min(1, 'Required').max(200),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'Required').max(100),
  state: z.string().min(1, 'Required').max(100),
  pincode: z.string().min(4, 'Required').max(10),
  country: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.coerce.number().positive().optional(),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankBranch: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function VendorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorsService.getOne(id!),
    enabled: isEdit,
  });

  const { data: categories } = useQuery({
    queryKey: ['vendor-categories'],
    queryFn: () => vendorCategoriesService.list(true),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { country: 'India', paymentTerms: 'NET_30', status: 'ACTIVE' },
  });

  useEffect(() => {
    if (vendor) {
      reset({
        vendorCode: vendor.vendorCode,
        companyName: vendor.companyName,
        tradeName: vendor.tradeName ?? '',
        vendorCategoryId: vendor.vendorCategoryId,
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        alternatePhone: vendor.alternatePhone ?? '',
        addressLine1: vendor.addressLine1,
        addressLine2: vendor.addressLine2 ?? '',
        city: vendor.city,
        state: vendor.state,
        pincode: vendor.pincode,
        country: vendor.country,
        taxId: vendor.taxId ?? '',
        paymentTerms: vendor.paymentTerms,
        creditLimit: vendor.creditLimit ?? undefined,
        bankName: vendor.bankName ?? '',
        bankAccountNo: vendor.bankAccountNo ?? '',
        bankIfsc: vendor.bankIfsc ?? '',
        bankBranch: vendor.bankBranch ?? '',
        status: vendor.status,
        notes: vendor.notes ?? '',
      });
    }
  }, [vendor, reset]);

  const createMut = useMutation({
    mutationFn: vendorsService.create,
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ['vendors'] }); navigate(`/vendors/${data.id}`); },
  });
  const updateMut = useMutation({
    mutationFn: (data: Parameters<typeof vendorsService.update>[1]) => vendorsService.update(id!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendors'] }); qc.invalidateQueries({ queryKey: ['vendor', id] }); navigate(`/vendors/${id}`); },
  });

  const onSubmit = (data: FormData) => {
    if (isEdit) updateMut.mutate(data as never);
    else createMut.mutate(data as never);
  };

  const isPending = createMut.isPending || updateMut.isPending;
  const mutError = createMut.error || updateMut.error;

  if (isEdit && isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Edit Vendor' : 'New Vendor'}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEdit ? vendor?.companyName : 'Register a new supplier'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate(isEdit ? `/vendors/${id}` : '/vendors')}>Cancel</Button>
          <Button type="submit" isLoading={isPending}>{isEdit ? 'Save Changes' : 'Create Vendor'}</Button>
        </div>
      </div>

      {mutError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{(mutError as Error).message}</div>}

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Vendor Code *" error={errors.vendorCode?.message} {...register('vendorCode')} />
          <Input label="Company Name *" error={errors.companyName?.message} {...register('companyName')} />
          <Input label="Trade Name" {...register('tradeName')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select {...register('vendorCategoryId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select category...</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.vendorCategoryId && <p className="text-xs text-red-600 mt-1">{errors.vendorCategoryId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(VENDOR_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Contact Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Contact Person *" error={errors.contactPerson?.message} {...register('contactPerson')} />
          <Input label="Email *" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone *" error={errors.phone?.message} {...register('phone')} />
          <Input label="Alternate Phone" {...register('alternatePhone')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Address Line 1 *" error={errors.addressLine1?.message} {...register('addressLine1')} className="col-span-2" />
          <Input label="Address Line 2" {...register('addressLine2')} className="col-span-2" />
          <Input label="City *" error={errors.city?.message} {...register('city')} />
          <Input label="State *" error={errors.state?.message} {...register('state')} />
          <Input label="Pincode *" error={errors.pincode?.message} {...register('pincode')} />
          <Input label="Country" {...register('country')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Commercial</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="GSTIN / Tax ID" {...register('taxId')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <select {...register('paymentTerms')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(PAYMENT_TERMS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <Input label="Credit Limit (₹)" type="number" {...register('creditLimit')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-1">Banking Details</h2>
        <p className="text-xs text-gray-500 mb-4">Visible only to Admin and Finance roles</p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Bank Name" {...register('bankName')} />
          <Input label="Account Number" {...register('bankAccountNo')} />
          <Input label="IFSC Code" {...register('bankIfsc')} />
          <Input label="Branch" {...register('bankBranch')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Notes</h2>
        <textarea {...register('notes')} rows={4} placeholder="Internal notes about this vendor..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </Card>
    </form>
  );
}
