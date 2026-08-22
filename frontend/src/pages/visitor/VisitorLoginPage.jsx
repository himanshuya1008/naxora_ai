import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useVisitorAuthStore } from '../../store/visitorAuthStore.js';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

function Field({ type = 'text', label, error, ...inputProps }) {
  return (
    <div className="auth-field">
      <input type={type} placeholder=" " {...inputProps} />
      <label>{label}</label>
      {error && <p className="auth-field__error">{error}</p>}
    </div>
  );
}

// Visitor-side equivalent of the credential-entry branch inside
// pages/LoginPage.jsx — a separate page/route rather than folded into that
// component's role-chooser, since the two flows hit entirely different
// backend endpoints and store (visitorAuthStore, not authStore).
export default function VisitorLoginPage() {
  const { login, status, error } = useVisitorAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    const success = await login(values.email, values.password);
    if (success) navigate(location.state?.from?.pathname ?? '/visitor', { replace: true });
  };

  return (
    <div className="auth-surface">
      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-subtitle mb-8">Sign in to continue your conversation with Nexora AI.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="auth-error-banner">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Field type="email" label="Email" error={errors.email?.message} {...register('email')} />

        <div className="auth-field mt-6">
          <input type={showPassword ? 'text' : 'password'} placeholder=" " {...register('password')} />
          <label>Password</label>
          <button
            type="button"
            className="auth-field__toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.password && <p className="auth-field__error">{errors.password.message}</p>}
        </div>

        <p className="mt-3 text-right text-sm">
          <Link to="/visitor/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </p>

        <button type="submit" className="auth-btn-primary mt-6" disabled={status === 'loading'}>
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
        </button>
      </form>

      <p className="mt-7 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
        Don&apos;t have an account?{' '}
        <Link to="/visitor/register" className="auth-link">
          Create one
        </Link>
      </p>
    </div>
  );
}
