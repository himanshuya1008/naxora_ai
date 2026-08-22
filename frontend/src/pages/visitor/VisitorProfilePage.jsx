import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useVisitorAuthStore } from '../../store/visitorAuthStore.js';
import { updateMyProfile } from '../../services/visitorPortalService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { toast } from '../../store/toastStore.js';
import GlassCard from '../../components/common/GlassCard.jsx';
import FormField from '../../components/common/FormField.jsx';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  email: z.string().trim().email('Enter a valid email'),
  company: z.string().trim().optional().or(z.literal('')),
  industry: z.string().trim().optional().or(z.literal('')),
});

export default function VisitorProfilePage() {
  const { visitor } = useVisitorAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: visitor?.name ?? '',
      email: visitor?.email ?? '',
      company: visitor?.company ?? '',
      industry: visitor?.industry ?? '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const { visitor: updated } = await updateMyProfile(values);
      useVisitorAuthStore.setState({ visitor: updated });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update your profile'));
    }
  };

  return (
    <GlassCard className="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField label="Full name" error={errors.name?.message}>
          <input className="input-field" {...register('name')} />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <input type="email" className="input-field" {...register('email')} />
        </FormField>

        <FormField label="Company" error={errors.company?.message}>
          <input className="input-field" placeholder="Optional" {...register('company')} />
        </FormField>

        <FormField label="Industry" error={errors.industry?.message}>
          <input className="input-field" placeholder="Optional" {...register('industry')} />
        </FormField>

        <button type="submit" className="btn-primary w-fit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save changes
        </button>
      </form>
    </GlassCard>
  );
}
