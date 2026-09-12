import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { createUserSchema, type CreateUserInput } from '@/lib/validations';
import { adminUsersApi, getErrorMessage } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { FormField, inputClasses } from '@/components/ui/FormField';

export function CreateUser() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'USER' },
  });

  const onSubmit = async (data: CreateUserInput) => {
    setServerError('');
    try {
      await adminUsersApi.create(data);
      toast('User created successfully!');
      navigate('/admin/users');
    } catch (error) {
      const msg = getErrorMessage(error);
      setServerError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Link to="/admin/users">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create User</h1>
          <p className="text-sm text-slate-500">Add a new user to the platform</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Full Name" error={errors.name?.message} required hint="20–60 characters">
            <input
              type="text"
              className={inputClasses}
              placeholder="Enter full name (min 20 characters)"
              {...register('name')}
            />
          </FormField>

          <FormField label="Email" error={errors.email?.message} required>
            <input
              type="email"
              className={inputClasses}
              placeholder="user@example.com"
              {...register('email')}
            />
          </FormField>

          <FormField label="Address" error={errors.address?.message} required hint="Max 400 characters">
            <textarea
              rows={2}
              className={inputClasses}
              placeholder="Enter address"
              {...register('address')}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message} required hint="8–16 characters, 1 uppercase, 1 special character">
            <input
              type="password"
              className={inputClasses}
              placeholder="Set a password"
              {...register('password')}
            />
          </FormField>

          <FormField label="Role" error={errors.role?.message} required>
            <select className={inputClasses} {...register('role')}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
          </FormField>

          <div className="flex gap-3">
            <Button type="submit" loading={isSubmitting}>
              Create User
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
