import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useVisitorAuthStore } from '../../store/visitorAuthStore.js';

const schema = z.object({
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

export default function VisitorRegisterPage() {
  const { register: registerVisitor, status, error } = useVisitorAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    const success = await registerVisitor(values);
    if (success) navigate('/visitor', { replace: true });
  };

  return (
    <div className="auth-surface">
      <h2 className="auth-title">Create your account</h2>
      <p className="auth-subtitle mb-8">Pick up where you left off with our AI Sales Consultant.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="auth-error-banner">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Field label="Your name" error={errors.name?.message} {...register('name')} />
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
        <Link to="/visitor/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
