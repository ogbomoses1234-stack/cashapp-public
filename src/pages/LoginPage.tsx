import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/brand/Logo';
import { login, getMe } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ApiClientError } from '@/services/api';
import { toast } from '@/hooks/useToast';

interface FormValues {
  email: string;
  password: string;
}

function resolveRedirect(me: {
  role: string;
  email: string;
  emailVerified: boolean;
  mustChangePassword?: boolean;
  fullName: string | null;
  phoneNumber: string | null;
  deliveryAddress: string | null;
}): string {
  if (!me.emailVerified) return `/verify-otp?email=${encodeURIComponent(me.email)}`;
  if (me.role === 'staff') return me.mustChangePassword ? '/staff/change-password' : '/staff/terminal';
  if (me.role === 'admin') return '/login';
  const complete = Boolean(me.fullName) && Boolean(me.phoneNumber) && Boolean(me.deliveryAddress);
  return complete ? '/home' : '/profile-setup';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values);
      const me = await getMe();
      const user = { ...me, phoneNumber: me.phoneNumber ?? null, deliveryAddress: me.deliveryAddress ?? null };
      setUser(user);

      const destination = resolveRedirect({
        role: user.role,
        email: user.email,
        emailVerified: user.emailVerified,
        mustChangePassword: (user as { mustChangePassword?: boolean }).mustChangePassword,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        deliveryAddress: user.deliveryAddress,
      });

      if (user.role === 'staff') {
        if ((user as { mustChangePassword?: boolean }).mustChangePassword) {
          toast.info('Please set a new password to continue');
        } else {
          toast.success(`Welcome back, ${user.fullName ?? 'seller'}`);
        }
      }
      navigate(destination, { replace: true });
    } catch (e) {
      const err = e as ApiClientError;
      if (err.code === 'AUTH_INVALID_CREDENTIALS') {
        setError('email', { message: 'Invalid email or password' });
      } else if (err.code === 'AUTH_DEVICE_BLOCKED' || err.code === 'AUTH_ACCOUNT_DEACTIVATED') {
        toast.error('Access denied. Contact support if this is a mistake.');
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Brand header */}
      <div className="mb-7 flex flex-col items-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-xl bg-ink-900 p-2.5">
          <Logo size={36} alt="" />
        </span>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-600">
          Vickkyaku
        </p>
        <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-[-0.025em] text-ink-900">
          Welcome back
        </h1>
        <p className="mt-1.5 max-w-[300px] text-[13px] font-medium text-ink-400">
          Log in with your email and password
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-ink-200/70"
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-[34px] grid h-8 w-8 place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="h-3.5 w-3.5 rounded border-ink-300 accent-brand-500" />
            <span className="text-[11.5px] font-medium text-ink-600">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-[11.5px] font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" size="lg" block loading={submitting}>
            Log in
          </Button>
        </div>

        <p className="pt-1 text-center text-[10.5px] font-medium text-ink-400">
          Sellers log in here with credentials sent to your email
        </p>
      </form>

      <p className="mt-6 text-center text-[12.5px] font-medium text-ink-500">
        New to Vickkyaku?{' '}
        <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>

      <p className="mt-8 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-300">
        vickkyaku.store
      </p>
    </div>
  );
}

function Eye() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}