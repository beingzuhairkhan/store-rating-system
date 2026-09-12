import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Store as StoreIcon } from 'lucide-react';
import { createStoreSchema, type CreateStoreInput } from '@/lib/validations';
import { storesApi, adminUsersApi, getErrorMessage } from '@/services/api';
import type { User } from '@/types';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { FormField, inputClasses } from '@/components/ui/FormField';

export function CreateStore() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [serverError, setServerError] = useState('');

  const { data: ownersData } = useQuery({
    queryKey: ['store-owners'],
    queryFn: async () => {
      const res = await adminUsersApi.list({ role: 'STORE_OWNER', pageSize: 100 });
      return res.data.data;
    },
  });

  const owners: User[] = ownersData?.items ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
  });

  const onSubmit = async (data: CreateStoreInput) => {
    setServerError('');
    try {
      await storesApi.create(data);
      toast('Store created successfully!');
      navigate('/admin/stores');
    } catch (error) {
      const msg = getErrorMessage(error);
      setServerError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Link to="/admin/stores">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Stores
        </Button>
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-50 p-2">
          <StoreIcon className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Store</h1>
          <p className="text-sm text-slate-500">Add a new store to the platform</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Store Name" error={errors.name?.message} required hint="20–60 characters">
            <input
              type="text"
              className={inputClasses}
              placeholder="Enter store name (min 20 characters)"
              {...register('name')}
            />
          </FormField>

          <FormField label="Email" error={errors.email?.message} required>
            <input
              type="email"
              className={inputClasses}
              placeholder="store@example.com"
              {...register('email')}
            />
          </FormField>

          <FormField label="Address" error={errors.address?.message} required hint="Max 400 characters">
            <textarea
              rows={2}
              className={inputClasses}
              placeholder="Enter store address"
              {...register('address')}
            />
          </FormField>

          <FormField label="Store Owner" error={errors.ownerId?.message} required>
            <select className={inputClasses} {...register('ownerId')}>
              <option value="">Select a store owner</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            {owners.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No store owners found. Create a user with the STORE_OWNER role first.
              </p>
            )}
          </FormField>

          <div className="flex gap-3">
            <Button type="submit" loading={isSubmitting} disabled={owners.length === 0}>
              Create Store
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/stores')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
