import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations';
import { authApi, getErrorMessage } from '@/services/api';
import { useAuth, getHomeRoute } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { FormField, inputClasses } from '@/components/ui/FormField';

export function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setServerError('');
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast('Password changed successfully!');
      reset();
      if (user) {
        navigate(getHomeRoute(user.role), { replace: true });
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      setServerError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2">
            <KeyRound className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Change Password</h1>
            <p className="text-sm text-slate-500">Update your account password</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField label="Current Password" error={errors.currentPassword?.message} required>
              <input
                type="password"
                className={inputClasses}
                placeholder="Enter current password"
                {...register('currentPassword')}
              />
            </FormField>

            <FormField
              label="New Password"
              error={errors.newPassword?.message}
              required
              hint="8–16 characters, 1 uppercase, 1 special character"
            >
              <input
                type="password"
                className={inputClasses}
                placeholder="Enter new password"
                {...register('newPassword')}
              />
            </FormField>

            <FormField
              label="Confirm New Password"
              error={errors.confirmPassword?.message}
              required
            >
              <input
                type="password"
                className={inputClasses}
                placeholder="Re-enter new password"
                {...register('confirmPassword')}
              />
            </FormField>

            <div className="flex gap-3">
              <Button type="submit" loading={isSubmitting}>
                Update Password
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
