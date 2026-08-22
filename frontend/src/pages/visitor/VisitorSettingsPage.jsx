import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { changeMyPassword } from '../../services/visitorPortalService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { toast } from '../../store/toastStore.js';
import GlassCard from '../../components/common/GlassCard.jsx';
import FormField from '../../components/common/FormField.jsx';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function VisitorSettingsPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await changeMyPassword({ currentPassword, newPassword });
      toast.success('Password updated');
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update your password'));
    }
  };

  return (
    <GlassCard className="max-w-xl">
      <p className="card-title">Change password</p>
      <p className="card-subtitle mt-1">Use a password you don&apos;t use anywhere else.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-5">
        <FormField label="Current password" error={errors.currentPassword?.message}>
          <input type="password" className="input-field" {...register('currentPassword')} />
        </FormField>

        <FormField label="New password" error={errors.newPassword?.message}>
          <input type="password" className="input-field" {...register('newPassword')} />
        </FormField>

        <FormField label="Confirm new password" error={errors.confirmPassword?.message}>
          <input type="password" className="input-field" {...register('confirmPassword')} />
        </FormField>

        <button type="submit" className="btn-primary w-fit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Update password
        </button>
      </form>
    </GlassCard>
  );
}
