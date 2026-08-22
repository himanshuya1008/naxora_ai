import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { createLead } from '../../services/leadService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { toast } from '../../store/toastStore.js';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking.js';
import Hero from '../../components/Hero/Hero.jsx';
import Button from '../../components/Button/Button.jsx';
import FormField from '../../components/FormField/FormField.jsx';
import { easeTransition } from '../../animations/variants.js';
import './Contact.css';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  company: z.string().trim().optional(),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)'),
});

export default function Contact() {
  const { trackEvent, getVisitorId } = useBehaviorTracking();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    trackEvent('PAGE_VIEW', { page: '/contact' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    try {
      await createLead({
        name: values.name,
        email: values.email,
        company: values.company || undefined,
        businessGoals: values.message,
        visitorId: getVisitorId() ?? undefined,
        source: 'CONTACT_FORM',
      });
      trackEvent('FORM_SUBMIT', { page: '/contact', label: 'Contact form' });
      toast.success("Thanks — we'll be in touch shortly.");
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send your message. Please try again.'));
    }
  };

  return (
    <div className="contact">
      <Hero
        eyebrow="Get in touch"
        title="Let's talk about"
        highlight="your business"
        subtitle="Questions about a service, pricing, or a custom project? We'd love to hear from you."
        showScrollIndicator={false}
      />

      <motion.div
        className="contact__form-wrap"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={easeTransition}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="contact__form">
          <div className="contact__row">
            <FormField label="Name" error={errors.name?.message}>
              <input className="field-input" placeholder="Jordan Lee" {...register('name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input type="email" className="field-input" placeholder="you@company.com" {...register('email')} />
            </FormField>
          </div>

          <FormField label="Company (optional)">
            <input className="field-input" placeholder="Acme Inc." {...register('company')} />
          </FormField>

          <FormField label="Message" error={errors.message?.message}>
            <textarea className="field-input" placeholder="What can we help with?" {...register('message')} />
          </FormField>

          <Button type="submit" loading={isSubmitting} className="contact__submit">
            <Mail size={16} />
            Send message
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
