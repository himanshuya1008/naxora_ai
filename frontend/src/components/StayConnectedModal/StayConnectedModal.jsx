import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CheckCircle2, Sparkles } from 'lucide-react';
import { createLead } from '../../services/leadService.js';
import { getErrorMessage } from '../../utils/errors.js';
import FormField from '../FormField/FormField.jsx';
import Button from '../Button/Button.jsx';
import './StayConnectedModal.css';

const INTERESTED_SERVICES = [
  'AI Sales Assistant',
  'Voice AI',
  'Customer DNA',
  'Lead Intelligence',
  'Dashboard & Analytics',
  'Enterprise Automation',
  'Product Demo',
  'Other',
];

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid work email'),
  company: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  interestedService: z.string().min(1, 'Choose an area of interest'),
  message: z.string().trim().optional(),
  consentGiven: z.boolean().refine((v) => v === true, { message: 'Please agree to be contacted to continue' }),
});

/**
 * Post-call lead capture (V2 Phase 3) — deliberately NOT shown during the
 * conversation (that would interrupt the natural voice flow). Only rendered
 * by AIConsultant.jsx once the AI has closed the call on its own (Smart
 * Conversation Ending), never on a manual hangup or an error.
 *
 * Reuses the existing public POST /leads endpoint (the same one Contact.jsx
 * and BookDemo.jsx already use, authenticated via the tracking API key).
 * `source: 'VOICE_CALL'` distinguishes this submission from the AI's own
 * incremental in-call capture (AI_CONVERSATION, keyed by conversationId) —
 * this is the visitor's own follow-up after the call already ended.
 *
 * Portal-rendered to document.body (not a plain fixed-position child) so it
 * can never be trapped by the ai-consultant panel's own backdrop-filter,
 * which creates a new stacking/containing context — the same class of bug
 * already fixed once this session for the dashboard's profile dropdown.
 */
export default function StayConnectedModal({ open, onClose, visitorId }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      industry: '',
      interestedService: '',
      message: '',
      consentGiven: false,
    },
  });

  const handleClose = () => {
    onClose();
    // Reset after the exit animation has time to finish, not before —
    // resetting immediately would flash the empty/initial form during close.
    setTimeout(() => {
      setSubmitted(false);
      setSubmitError(null);
      reset();
    }, 200);
  };

  const onSubmit = async (values) => {
    setSubmitError(null);
    try {
      await createLead({ ...values, visitorId: visitorId ?? undefined, source: 'VOICE_CALL' });
      setSubmitted(true);
    } catch (err) {
      // Stay on the form with their input intact rather than losing it.
      setSubmitError(getErrorMessage(err, 'Something went wrong. Please try again.'));
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="stay-connected__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <motion.div
            className="stay-connected__card"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stay-connected-title"
          >
            <button type="button" className="stay-connected__close" onClick={handleClose} aria-label="Close">
              <X size={18} />
            </button>

            {submitted ? (
              <div className="stay-connected__success">
                <span className="stay-connected__success-icon">
                  <CheckCircle2 size={28} />
                </span>
                <h3>Thank you!</h3>
                <p>Our team will contact you soon.</p>
                <Button onClick={handleClose} className="stay-connected__success-btn">
                  Close
                </Button>
              </div>
            ) : (
              <>
                <span className="stay-connected__icon">
                  <Sparkles size={20} />
                </span>
                <h3 id="stay-connected-title" className="stay-connected__title">
                  Stay Connected
                </h3>
                <p className="stay-connected__subtitle">
                  Thank you for speaking with Nexora AI.
                  <br />
                  If you&rsquo;d like our team to reach out with more information or a personalized demo, please leave your details below.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="stay-connected__form">
                  <div className="stay-connected__row">
                    <FormField label="Full Name" error={errors.name?.message}>
                      <input className="field-input" placeholder="Jordan Lee" autoComplete="name" {...register('name')} />
                    </FormField>
                    <FormField label="Work Email" error={errors.email?.message}>
                      <input type="email" className="field-input" placeholder="you@company.com" autoComplete="email" {...register('email')} />
                    </FormField>
                  </div>

                  <div className="stay-connected__row">
                    <FormField label="Company" error={errors.company?.message}>
                      <input className="field-input" placeholder="Acme Inc." autoComplete="organization" {...register('company')} />
                    </FormField>
                    <FormField label="Phone (optional)" error={errors.phone?.message}>
                      <input type="tel" className="field-input" placeholder="+1 555 000 0000" autoComplete="tel" {...register('phone')} />
                    </FormField>
                  </div>

                  <div className="stay-connected__row">
                    <FormField label="Industry" error={errors.industry?.message}>
                      <input className="field-input" placeholder="B2B SaaS, Healthcare, ..." {...register('industry')} />
                    </FormField>
                    <FormField label="Interested Service" error={errors.interestedService?.message}>
                      <select className="field-input" defaultValue="" {...register('interestedService')}>
                        <option value="" disabled>
                          Select a service
                        </option>
                        {INTERESTED_SERVICES.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Anything else you'd like to add? (optional)" error={errors.message?.message}>
                    <textarea className="field-input" rows={3} placeholder="Tell us more about what you need" {...register('message')} />
                  </FormField>

                  <label className="stay-connected__consent">
                    <input type="checkbox" {...register('consentGiven')} />
                    <span>I agree to be contacted by Nexora AI about this conversation.</span>
                  </label>
                  {errors.consentGiven && <p className="stay-connected__error">{errors.consentGiven.message}</p>}

                  {submitError && <p className="stay-connected__error">{submitError}</p>}

                  <div className="stay-connected__actions">
                    <button type="button" className="stay-connected__skip" onClick={handleClose}>
                      Skip
                    </button>
                    <Button type="submit" loading={isSubmitting} className="stay-connected__submit">
                      Submit
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
