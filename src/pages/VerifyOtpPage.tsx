import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OtpInput } from '@/components/auth/OtpInput';
import { Button } from '@/components/ui/Button';
import { verifyOtp, resendOtp } from '@/services/otp.service';
import { getMe } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ApiClientError } from '@/services/api';
import { toast } from '@/hooks/useToast';

const RESEND_COOLDOWN = 60;

export default function VerifyOtpPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) navigate('/signup', { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleComplete = async (code: string) => {
    if (busy || !email) return;
    setBusy(true);
    setError(null);
    try {
      await verifyOtp({ email, code });
      const me = await getMe();
      setUser(me);
      toast.success('Email verified');
      if (me.role === 'staff') navigate('/staff/terminal', { replace: true });
      else if (!me.fullName || !me.phoneNumber || !me.deliveryAddress) navigate('/profile-setup', { replace: true });
      else navigate('/home', { replace: true });
    } catch (e) {
      setError((e as ApiClientError).message);
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    try {
      await resendOtp({ email });
      toast.success('New code sent');
      setCooldown(RESEND_COOLDOWN);
    } catch (e) {
      toast.error((e as ApiClientError).message);
    }
  };

  return (
    <div>
      <div className="mb-7 flex flex-col items-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-xl bg-brand-50 text-3xl ring-1 ring-brand-100">
          ✉️
        </span>
        <h1 className="mt-4 text-[26px] font-bold tracking-[-0.025em] text-ink-900">
          Check your inbox
        </h1>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink-500">
          We sent a 6-digit code to
          <br />
          <b className="font-semibold text-ink-900">{email}</b>
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 ring-1 ring-ink-200/70">
        <OtpInput onComplete={handleComplete} disabled={busy} />

        {error && (
          <p className="mt-4 text-center text-[12px] font-semibold text-rose-500">{error}</p>
        )}
        {busy && (
          <p className="mt-4 text-center text-[12px] font-semibold text-ink-500">
            Verifying and signing you in…
          </p>
        )}

        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-[11.5px] font-medium text-ink-500">
            Didn't get the code?
          </span>
          <Button variant="ghost" size="sm" onClick={handleResend} disabled={cooldown > 0 || busy}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-[12.5px] font-medium text-ink-500">
        Wrong email?{' '}
        <button
          onClick={() => navigate('/signup')}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Go back
        </button>
      </p>
    </div>
  );
}