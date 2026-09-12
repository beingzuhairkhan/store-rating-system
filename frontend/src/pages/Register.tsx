import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { authApi, getErrorMessage } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { FormField, inputClasses } from '@/components/ui/FormField';

export function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError('');
    try {
      await authApi.register(data);
      toast('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error) {
      const msg = getErrorMessage(error);
      setServerError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <Star className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-sm text-slate-500 mt-1">Register as a user to rate stores</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
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
                placeholder="Enter your full name (min 20 characters)"
                {...register('name')}
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message} required>
              <input
                type="email"
                className={inputClasses}
                placeholder="you@example.com"
                {...register('email')}
              />
            </FormField>

            <FormField label="Address" error={errors.address?.message} required hint="Max 400 characters">
              <textarea
                rows={2}
                className={inputClasses}
                placeholder="Enter your address"
                {...register('address')}
              />
            </FormField>

            <FormField
              label="Password"
              error={errors.password?.message}
              required
              hint="8–16 characters, 1 uppercase, 1 special character"
            >
              <input
                type="password"
                className={inputClasses}
                placeholder="Create a password"
                {...register('password')}
              />
            </FormField>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
