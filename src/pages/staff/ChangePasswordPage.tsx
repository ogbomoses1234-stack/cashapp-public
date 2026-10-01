import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/brand/Logo';
import { changeStaffPassword } from '@/services/staff.service';
import { getMe } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

/* ═══════════════════════════════════════════════════════════
   Password strength
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
  return { level: 3, label: 'Strong' };
}

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFirstLogin = Boolean(
    (user as unknown as { mustChangePassword?: boolean })?.mustChangePassword
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<FormValues>();

  const newPw = watch('newPassword') ?? '';
  const strength = strengthOf(newPw);

  const onSubmit = async (values: FormValues) => {
    if (values.newPassword.length < 8) {
      setError('newPassword', { message: 'Min 8 characters' });
      return;
    }
    if (values.newPassword !== values.confirm) {
      setError('confirm', { message: 'Passwords do not match' });
      return;
    }

    setSubmitting(true);
    try {
      await changeStaffPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      /* Refresh auth state so mustChangePassword flips locally */
      const me = await getMe();
      setUser(me);

      toast.success(
        isFirstLogin
          ? 'Welcome to Vickkyaku! Redirecting to your terminal…'
          : 'Password updated'
      );
      navigate('/staff/terminal', { replace: true });
    } catch (e) {
      const err = e as ApiClientError;
      if (err.code === 'AUTH_INVALID_CREDENTIALS') {
        setError('oldPassword', { message: 'Current password is incorrect' });
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-6 pt-4">
      {/* ═══════════════════════════════════════════════════
          HEADER — brand + title
      ═══════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#0B0F14] shadow-[0_12px_28px_-12px_rgba(11,15,20,.6)]">
          <Logo size={40} />
        </div>

        <p className="mt-3 text-[10.5px] font-black uppercase tracking-[0.32em] text-violet-500">
          Vickkyaku Seller
        </p>

        <h1 className="mt-3 text-[24px] font-black leading-tight tracking-[-0.03em] text-ink-900">
          {isFirstLogin ? 'Welcome!' : 'Change password'}
        </h1>
        <p className="mt-2 max-w-[300px] text-[12.5px] font-medium leading-relaxed text-ink-400">
          {isFirstLogin
            ? 'Your account uses a temporary password. Set your own to continue.'
            : 'Update the password for your seller account.'}
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════
          FIRST-LOGIN BANNER
      ═══════════════════════════════════════════════════ */}
      {isFirstLogin && (
        <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100/40 p-4 shadow-card">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-violet-500 text-white shadow-[0_6px_16px_-6px_rgba(139,92,246,.7)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15v2" />
              <path d="M12 7v6" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-black text-violet-900">
              Temporary password active
            </p>
            <p className="mt-0.5 text-[11.5px] font-medium leading-relaxed text-violet-800/80">
              Use the temporary password from your email as the &ldquo;current password&rdquo; below.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          FORM
      ═══════════════════════════════════════════════════ */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100/60"
      >
        {/* Current password */}
        <div className="relative">
          <Input
            label={isFirstLogin ? 'Current (temporary) password' : 'Current password'}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={isFirstLogin ? 'Paste temp password from email' : 'Your current password'}
            error={errors.oldPassword?.message}
            {...register('oldPassword', { required: 'Current password is required' })}
          />
          <PasswordToggle
            shown={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />
        </div>

        {/* New password */}
        <Input
          label="New password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Min 8 chars · 1 upper · 1 number · 1 symbol"
          error={errors.newPassword?.message}
          {...register('newPassword', { required: 'New password is required' })}
        />

        {/* Strength meter */}
        {newPw.length > 0 && (
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

        {/* Confirm */}
        <Input
          label="Confirm new password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat your new password"
          error={errors.confirm?.message}
          {...register('confirm', { required: 'Confirm your password' })}
        />

        {/* Show passwords toggle */}
        <label className="flex cursor-pointer items-center gap-2 pt-1">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-ink-200 accent-brand-500"
          />
          <span className="text-[11.5px] font-semibold text-ink-600">
            Show passwords
          </span>
        </label>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            loading={submitting}
          >
            {isFirstLogin ? 'Set password & continue' : 'Update password'}
          </Button>
        </div>

        {!isFirstLogin && (
          <button
            type="button"
            onClick={() => navigate('/staff/profile')}
            className="w-full pt-1 text-center text-[11.5px] font-black text-ink-400 transition hover:text-ink-700"
          >
            Cancel
          </button>
        )}
      </form>

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════ */}
      <p className="text-center text-[10px] font-black uppercase tracking-[0.32em] text-ink-300">
        vickkyaku.com
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Password visibility toggle (positions over Input)
═══════════════════════════════════════════════════════════ */
function PasswordToggle({
  shown,
  onToggle,
}: {
  shown: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-[36px] grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
      aria-label={shown ? 'Hide password' : 'Show password'}
      tabIndex={-1}
    >
      {shown ? (
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
  );
}
