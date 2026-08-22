import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

const schema = z.object({
  organizationName: z.string().min(2, 'Organization name is too short'),
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

export default function RegisterPage() {
  const { register: registerUser, status, error } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    const success = await registerUser(values);
    if (success) navigate('/app', { replace: true });
  };

  return (
    <div className="auth-surface">
      <h2 className="auth-title">Create your workspace</h2>
      <p className="auth-subtitle mb-8">Start turning visitor behavior into qualified conversations.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="auth-error-banner">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Field label="Organization name" error={errors.organizationName?.message} {...register('organizationName')} />
        <div className="mt-6">
          <Field label="Your name" error={errors.name?.message} {...register('name')} />
        </div>
        <div className="mt-6">
          <Field type="email" label="Email" error={errors.email?.message} {...register('email')} />
        </div>

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

        <button type="submit" className="auth-btn-primary mt-9" disabled={status === 'loading'}>
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create account
        </button>
      </form>

      <p className="mt-7 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
        Already have an account?{' '}
        <Link to="/login?role=admin" className="auth-link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
