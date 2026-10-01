import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/brand/Logo';
import { signup } from '@/services/auth.service';
import { ApiClientError } from '@/services/api';
import { toast } from '@/hooks/useToast';

const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[0-9]/, 'Include a number')
      .regex(/[^A-Za-z0-9]/, 'Include a symbol'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

/* ═══════════════════════════════════════════════════════════
   Password strength meter
═══════════════════════════════════════════════════════════ */
function strengthOf(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { level: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: 'Weak' };
  if (score === 2) return { level: 2, label: 'Fair' };
  if (score === 3) return { level: 3, label: 'Good' };
  return { level: 3, label: 'Strong' };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<FormValues>();

  const watchedPassword = watch('password') ?? '';
  const strength = strengthOf(watchedPassword);

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((i) => {
        setError(i.path[0] as keyof FormValues, { message: i.message });
      });
      return;
    }

    setSubmitting(true);
    try {
      await signup({ email: values.email, password: values.password });

      toast.success('Check your email for the verification code');
      navigate(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (e) {
      const err = e as ApiClientError;
      if (err.code === 'AUTH_EMAIL_TAKEN') {
        setError('email', { message: 'This email is already registered' });
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 pb-8">
      {/* ═══════════════════════════════════════════════════
          BRAND HEADER
      ═══════════════════════════════════════════════════ */}
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#0B0F14] shadow-[0_16px_32px_-12px_rgba(11,15,20,.55)]">
          <Logo size={48} />
        </div>

        <p className="mt-3 text-[10.5px] font-black uppercase tracking-[0.32em] text-brand-700">
          Vickkyaku
        </p>

        <h1 className="mt-3 text-[26px] font-black leading-tight tracking-[-0.03em] text-ink-900">
          Create your account
        </h1>
        <p className="mt-1.5 max-w-[280px] text-[12.5px] font-medium leading-relaxed text-ink-400">
          Two quick steps. Then start earning ₦100 cashback per scan.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════
          FORM
      ═══════════════════════════════════════════════════ */}
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
          {...register('email')}
        />

        {/* Password with visibility toggle */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register('password')}
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

        {/* Password strength meter */}
        {watchedPassword.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition ${
                    i <= strength.level
                      ? strength.level === 1
                        ? 'bg-rose-400'
                        : strength.level === 2
                          ? 'bg-amber-400'
                          : 'bg-brand-500'
                      : 'bg-ink-100'
                  }`}
                />
              ))}
            </div>
            <span
              className={`text-[10.5px] font-black uppercase tracking-wider ${
                strength.level === 1
                  ? 'text-rose-500'
                  : strength.level === 2
                    ? 'text-amber-600'
                    : 'text-brand-700'
              }`}
            >
              {strength.label}
            </span>
          </div>
        )}

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            loading={submitting}
          >
            Create account
          </Button>
        </div>

        <p className="pt-1 text-center text-[10.5px] font-medium leading-relaxed text-ink-400">
          By creating an account you agree to our{' '}
          <Link
            to="#"
            className="font-black text-ink-700 underline-offset-2 hover:underline"
          >
            Terms
          </Link>{' '}
          and{' '}
          <Link
            to="#"
            className="font-black text-ink-700 underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      {/* ═══════════════════════════════════════════════════
          TRUST STRIP
      ═══════════════════════════════════════════════════ */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <TrustBadge
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          }
          label="Verified"
        />
        <TrustBadge
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
            </svg>
          }
          label="₦100 cashback"
        />
        <TrustBadge
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          }
          label="Encrypted"
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════ */}
      <p className="mt-6 text-center text-[12.5px] font-semibold text-ink-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-black text-brand-700 hover:text-brand-800"
        >
          Log in
        </Link>
      </p>

      <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.32em] text-ink-300">
        vickkyaku.com
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Trust badge
═══════════════════════════════════════════════════════════ */
function TrustBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white/60 px-2 py-2.5 ring-1 ring-inset ring-ink-100/70">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500/10 text-brand-700">
        {icon}
      </span>
      <span className="text-center text-[10px] font-black uppercase tracking-wider text-ink-500">
        {label}
      </span>
    </div>
  );
}
