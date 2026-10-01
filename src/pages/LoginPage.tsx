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

/* ═══════════════════════════════════════════════════════════
   Where to send the user after successful login.
   Order matters — check role FIRST, then profile.
═══════════════════════════════════════════════════════════ */
function resolveRedirect(me: {
  role: string;
  email: string;
  emailVerified: boolean;
  mustChangePassword?: boolean;
  fullName: string | null;
  phoneNumber: string | null;
  deliveryAddress: string | null;
}): string {
  /* Email verification gate (any role) */
  if (!me.emailVerified) {
    return `/verify-otp?email=${encodeURIComponent(me.email)}`;
  }

  /* ─── STAFF ─── */
  if (me.role === 'staff') {
    return me.mustChangePassword
      ? '/staff/change-password'
      : '/staff/terminal';
  }

  /* ─── ADMIN (shouldn't happen on public site, but safe) ─── */
  if (me.role === 'admin') {
    return '/login'; /* admin uses a different domain */
  }

  /* ─── CUSTOMER ─── */
  const profileComplete =
    Boolean(me.fullName) && Boolean(me.phoneNumber) && Boolean(me.deliveryAddress);

  return profileComplete ? '/home' : '/profile-setup';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values);
      const me = await getMe();

      /* Normalize fields that the login endpoint may return as null */
      const user = {
        ...me,
        phoneNumber: me.phoneNumber ?? null,
        deliveryAddress: me.deliveryAddress ?? null,
      };

      setUser(user);

      const destination = resolveRedirect({
        role: user.role,
        email: user.email,
        emailVerified: user.emailVerified,
        mustChangePassword: (user as { mustChangePassword?: boolean })
          .mustChangePassword,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        deliveryAddress: user.deliveryAddress,
      });

      /* Friendly toast for staff */
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
      } else if (
        err.code === 'AUTH_DEVICE_BLOCKED' ||
        err.code === 'AUTH_ACCOUNT_DEACTIVATED'
      ) {
        toast.error('Access denied. Contact support if this is a mistake.');
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 pb-8">
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#0B0F14] shadow-[0_16px_32px_-12px_rgba(11,15,20,.55)]">
          <Logo size={48} />
        </div>
        <p className="mt-3 text-[10.5px] font-black uppercase tracking-[0.32em] text-brand-700">
          Vickkyaku
        </p>
        <h1 className="mt-3 text-[26px] font-black leading-tight tracking-[-0.03em] text-ink-900">
          Welcome back
        </h1>
        <p className="mt-1.5 max-w-[300px] text-[12.5px] font-medium leading-relaxed text-ink-400">
          Log in with your customer or seller account
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100/60"
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
            className="absolute right-3 top-[36px] grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-ink-200 accent-brand-500"
            />
            <span className="text-[11.5px] font-semibold text-ink-600">
              Remember me
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-[11.5px] font-black text-brand-700 hover:text-brand-800"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            loading={submitting}
          >
            Log in
          </Button>
        </div>

        <p className="pt-1 text-center text-[10.5px] font-semibold text-ink-400">
          Sellers log in here with the credentials sent to your email
        </p>
      </form>

      <p className="mt-6 text-center text-[12.5px] font-semibold text-ink-500">
        New to Vickkyaku?{' '}
        <Link to="/signup" className="font-black text-brand-700 hover:text-brand-800">
          Create an account
        </Link>
      </p>

      <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.32em] text-ink-300">
        vickkyaku.com
      </p>
    </div>
  );
}
