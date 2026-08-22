import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Calendar, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createLead } from '../../services/leadService.js';
import { getErrorMessage } from '../../utils/errors.js';
import { toast } from '../../store/toastStore.js';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking.js';
import { SERVICES } from '../../data/services.js';
import Hero from '../../components/Hero/Hero.jsx';
import Button from '../../components/Button/Button.jsx';
import FormField from '../../components/FormField/FormField.jsx';
import { easeTransition } from '../../animations/variants.js';
import './BookDemo.css';

const TEAM_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
const BUDGETS = ['Under $1k/mo', '$1k-10k/mo', '$10k-50k/mo', '$50k+/mo', 'Not sure yet'];
const TIMELINES = ['Immediately', 'This quarter', 'Next quarter', '6-12 months', 'Just exploring'];

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  company: z.string().trim().min(1, 'Enter your company'),
  industry: z.string().trim().min(1, 'Enter your industry'),
  teamSize: z.string().min(1, 'Select a team size'),
  budget: z.string().min(1, 'Select a budget range'),
  timeline: z.string().min(1, 'Select a timeline'),
  interestedService: z.string().min(1, 'Select a service'),
  businessGoals: z.string().trim().optional(),
  currentProblems: z.string().trim().optional(),
});

export default function BookDemo() {
  const { trackEvent, getVisitorId } = useBehaviorTracking();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    trackEvent('DEMO_REQUEST', { page: '/book-demo', label: 'Book demo page viewed' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values) => {
    try {
      await createLead({ ...values, visitorId: getVisitorId() ?? undefined, source: 'BOOK_DEMO_FORM' });
      trackEvent('FORM_SUBMIT', { page: '/book-demo', label: 'Book demo form' });
      toast.success("Demo request received — we'll reach out to schedule a time.");
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit your request. Please try again.'));
    }
  };

  return (
    <div className="book-demo">
      <Hero eyebrow="Book a demo" title="See it work on" highlight="your business" showScrollIndicator={false} />

      <p className="book-demo__intro">
        Tell us about your team and we&apos;ll put together a demo tailored to your use case — or{' '}
        <Link to="/ai-consultant" className="book-demo__inline-link">
          talk to our AI Sales Consultant
        </Link>{' '}
        right now instead.
      </p>

      <motion.div
        className="book-demo__form-wrap"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={easeTransition}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="book-demo__form">
          <div className="book-demo__row book-demo__row--2">
            <FormField label="Name" error={errors.name?.message}>
              <input className="field-input" placeholder="Jordan Lee" {...register('name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input type="email" className="field-input" placeholder="you@company.com" {...register('email')} />
            </FormField>
          </div>

          <div className="book-demo__row book-demo__row--2">
            <FormField label="Company" error={errors.company?.message}>
              <input className="field-input" placeholder="Acme Inc." {...register('company')} />
            </FormField>
            <FormField label="Industry" error={errors.industry?.message}>
              <input className="field-input" placeholder="B2B SaaS, Healthcare, ..." {...register('industry')} />
            </FormField>
          </div>

          <div className="book-demo__row book-demo__row--3">
            <FormField label="Team size" error={errors.teamSize?.message}>
              <select className="field-input" defaultValue="" {...register('teamSize')}>
                <option value="" disabled>
                  Select
                </option>
                {TEAM_SIZES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Budget" error={errors.budget?.message}>
              <select className="field-input" defaultValue="" {...register('budget')}>
                <option value="" disabled>
                  Select
                </option>
                {BUDGETS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Timeline" error={errors.timeline?.message}>
              <select className="field-input" defaultValue="" {...register('timeline')}>
                <option value="" disabled>
                  Select
                </option>
                {TIMELINES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Interested service" error={errors.interestedService?.message}>
            <select className="field-input" defaultValue="" {...register('interestedService')}>
              <option value="" disabled>
                Select a service
              </option>
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Business goals (optional)">
            <textarea className="field-input" placeholder="What are you hoping to achieve?" {...register('businessGoals')} />
          </FormField>

          <FormField label="Current problems (optional)">
            <textarea className="field-input" placeholder="What's not working today?" {...register('currentProblems')} />
          </FormField>

          <Button type="submit" loading={isSubmitting} className="book-demo__submit">
            <Calendar size={16} />
            Request demo
          </Button>
        </form>
      </motion.div>

      <div className="book-demo__alt">
        <p className="book-demo__alt-label">Prefer to skip the form?</p>
        <Link to="/ai-consultant">
          <Button variant="secondary">
            <Mic size={16} />
            Talk to AI Sales Consultant instead
          </Button>
        </Link>
      </div>
    </div>
  );
}
