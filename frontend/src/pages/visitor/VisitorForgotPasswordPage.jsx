import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

// UI-only placeholder per the V2 Phase 1 spec ("Forgot Password (UI
// placeholder if backend isn't ready)") — there's no email-sending
// infrastructure anywhere in this backend yet (no SMTP/provider config), so
// this intentionally does not call an API. It always shows the same
// "check your email" success state regardless of whether the address is
// registered, matching the standard don't-leak-account-existence pattern a
// real implementation would also want — so wiring the real endpoint later
// is a drop-in swap of onSubmit, not a UX change.
export default function VisitorForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  if (submitted) {
    return (
      <div className="auth-surface text-center">
        <span
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent)' }}
        >
          <MailCheck className="h-5 w-5" />
        </span>
        <h2 className="auth-title">Check your email</h2>
        <p className="auth-subtitle mt-2">
          If an account exists for that address, we&apos;ve sent a link to reset your password.
        </p>
        <Link to="/visitor/login" className="auth-btn-back mt-8 justify-center">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-surface">
      <h2 className="auth-title">Reset your password</h2>
      <p className="auth-subtitle mb-8">Enter your email and we&apos;ll send you a reset link.</p>

      <form onSubmit={handleSubmit(() => setSubmitted(true))}>
        <div className="auth-field">
          <input type="email" placeholder=" " {...register('email')} />
          <label>Email</label>
          {errors.email && <p className="auth-field__error">{errors.email.message}</p>}
        </div>

        <button type="submit" className="auth-btn-primary mt-9">
          Send reset link
        </button>
      </form>

      <p className="mt-7 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
        <Link to="/visitor/login" className="auth-link">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
