import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { User, ShieldCheck, ArrowLeft, ArrowRight, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// `redirectTo` roles (just "visitor") skip credentials entirely — this app
// has no visitor account system, so "continuing as visitor" is just a
// route change, not a login. Every other role shares the same POST
// /auth/login call; adding a future role (Sales Manager, Support Agent,
// Super Admin) is one more object here.
const ROLE_OPTIONS = [
  {
    id: 'visitor',
    icon: User,
    title: 'Visitor',
    description: 'Talk with our AI Sales Consultant, explore our services, and request a demo.',
    cta: 'Continue as Visitor',
    redirectTo: '/',
  },
  {
    id: 'admin',
    icon: ShieldCheck,
    title: 'Admin',
    description: 'Manage customers, analytics, reports, plans, conversations, and settings.',
    cta: 'Admin Login',
    formTitle: 'Admin sign in',
    formSubtitle: 'Sign in to manage the Nexora AI platform.',
  },
];

// Cursor-tracked radial highlight on the role tile — set as CSS custom
// properties read by .auth-role-tile::before, so the glow follows the
// pointer instead of just being a flat hover state.
function handleTileMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
  e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
}

function RoleTile({ option, onSelect, index }) {
  const Icon = option.icon;
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(option)}
      onMouseMove={handleTileMouseMove}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="auth-role-tile"
    >
      <span className="auth-role-tile__icon">
        <Icon className="h-full w-full" strokeWidth={1.5} />
      </span>
      <span className="auth-role-tile__title">{option.title}</span>
      <span className="auth-role-tile__desc">{option.description}</span>
      <span className="auth-role-tile__cta">
        {option.cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </motion.button>
  );
}

function Field({ type = 'text', label, error, ...inputProps }) {
  return (
    <div className="auth-field">
      <input type={type} placeholder=" " {...inputProps} />
      <label>{label}</label>
      {error && <p className="auth-field__error">{error}</p>}
    </div>
  );
}

function PasswordField({ label, error, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-field">
      <input type={visible ? 'text' : 'password'} placeholder=" " {...inputProps} />
      <label>{label}</label>
      <button
        type="button"
        className="auth-field__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      {error && <p className="auth-field__error">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const { login, status, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleId = searchParams.get('role');
  const selectedRole = ROLE_OPTIONS.find((r) => r.id === roleId && !r.redirectTo) ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const handleSelect = (option) => {
    if (option.redirectTo) {
      navigate(option.redirectTo);
      return;
    }
    setSearchParams({ role: option.id });
  };

  const onSubmit = async (values) => {
    const success = await login(values.email, values.password);
    if (success) navigate(location.state?.from?.pathname ?? '/app', { replace: true });
  };

  return (
    <AnimatePresence mode="wait">
      {!selectedRole ? (
        <motion.div
          key="chooser"
          className="auth-chooser"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mb-8">
            <h2 className="auth-title">Welcome to Nexora AI</h2>
            <p className="auth-subtitle">Choose how you&apos;d like to continue</p>
          </div>
          <div className="auth-roles">
            {ROLE_OPTIONS.map((option, i) => (
              <RoleTile key={option.id} option={option} onSelect={handleSelect} index={i} />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="auth-surface"
        >
          <button type="button" onClick={() => setSearchParams({})} className="auth-btn-back mb-6">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <h2 className="auth-title">{selectedRole.formTitle}</h2>
          <p className="auth-subtitle mb-8">{selectedRole.formSubtitle}</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="auth-error-banner">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Field type="email" label="Email" error={errors.email?.message} {...register('email')} />
            <div className="mt-6">
              <PasswordField label="Password" error={errors.password?.message} {...register('password')} />
            </div>

            <button type="submit" className="auth-btn-primary mt-9" disabled={status === 'loading'}>
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </button>
          </form>

          <p className="mt-7 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one
            </Link>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
