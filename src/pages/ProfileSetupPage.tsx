import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/brand/Logo';
import { completeProfile, getMe } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ApiClientError } from '@/services/api';
import { toast } from '@/hooks/useToast';

interface FormValues {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
}

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    const phone = values.phoneNumber.replace(/\D/g, '');
    if (phone.length !== 10) {
      setError('phoneNumber', { message: 'Enter a 10-digit Nigerian number' });
      return;
    }

    setSubmitting(true);
    try {
      await completeProfile({
        fullName: values.fullName.trim(),
        phoneNumber: `+234${phone}`,
        deliveryAddress: values.deliveryAddress.trim(),
      });
      const me = await getMe();
      setUser(me);
      toast.success('Profile complete');
      navigate(me.role === 'staff' ? '/staff/terminal' : '/home', {
        replace: true,
      });
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 pb-8">
      {/* ═══════════════════════════════════════════════════
          PROGRESS INDICATOR
      ═══════════════════════════════════════════════════ */}
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-[#0B0F14] shadow-[0_16px_32px_-12px_rgba(11,15,20,.55)]">
          <Logo size={48} />
        </div>

        <p className="mt-3 text-[10.5px] font-black uppercase tracking-[0.32em] text-brand-700">
          Vickkyaku
        </p>

        {/* Step indicator */}
        <div className="mt-4 flex items-center gap-1.5">
          <span className="h-1 w-6 rounded-full bg-brand-500" />
          <span className="h-1 w-6 rounded-full bg-ink-200" />
        </div>
        <p className="mt-2 text-[10.5px] font-black uppercase tracking-widest text-ink-400">
          Step 2 of 2
        </p>

        <h1 className="mt-3 text-[26px] font-black leading-tight tracking-[-0.03em] text-ink-900">
          Complete your profile
        </h1>
        <p className="mt-1.5 max-w-[280px] text-[12.5px] font-medium leading-relaxed text-ink-400">
          We use this to auto-fill your checkout and delivery details.
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
          label="Full name"
          placeholder="e.g. Adaeze Okafor"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName', {
            required: 'Full name is required',
            minLength: { value: 3, message: 'Too short' },
          })}
        />

        <label className="block">
          <span className="mb-2 block text-[11.5px] font-bold tracking-wide text-ink-500">
            Phone number
          </span>
          <div className="flex gap-2">
            <span className="flex flex-shrink-0 items-center gap-1.5 rounded-2xl bg-white px-3.5 text-[13px] font-bold text-ink-900 shadow-[inset_0_0_0_1.5px_rgba(11,16,28,.09)]">
              🇳🇬 +234
            </span>
            <input
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              placeholder="8035550142"
              className="w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-[13px] font-semibold text-ink-900 outline-none ring-1 ring-inset ring-ink-100/80 transition placeholder:text-ink-300 focus:ring-2 focus:ring-brand-500"
              {...register('phoneNumber', { required: 'Phone is required' })}
            />
          </div>
          {errors.phoneNumber && (
            <span className="mt-1 block text-[11.5px] font-semibold text-rose-500">
              {errors.phoneNumber.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-2 block text-[11.5px] font-bold tracking-wide text-ink-500">
            Delivery address
          </span>
          <textarea
            rows={3}
            autoComplete="street-address"
            placeholder="14B Admiralty Way, Lekki Phase 1, Lagos"
            className="w-full resize-none rounded-2xl border-0 bg-white px-4 py-3.5 text-[13px] font-semibold text-ink-900 outline-none ring-1 ring-inset ring-ink-100/80 transition placeholder:text-ink-300 focus:ring-2 focus:ring-brand-500"
            {...register('deliveryAddress', {
              required: 'Address is required',
              minLength: { value: 10, message: 'Too short' },
            })}
          />
          {errors.deliveryAddress && (
            <span className="mt-1 block text-[11.5px] font-semibold text-rose-500">
              {errors.deliveryAddress.message}
            </span>
          )}
        </label>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            loading={submitting}
          >
            Complete setup
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.32em] text-ink-300">
        vickkyaku.com
      </p>
    </div>
  );
}
