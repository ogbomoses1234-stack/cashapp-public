import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listBanks, verifyAccount, savePayout, AccountVerifyError } from '@/services/payout.service';
import type { Bank } from '@/types';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

type VerifyState =
  | { kind: 'idle' }
  | { kind: 'verifying' }
  | { kind: 'ok'; accountName: string }
  | { kind: 'error'; message: string; code: string };

export default function PayoutPage() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [state, setState] = useState<VerifyState>({ kind: 'idle' });
  const [saving, setSaving] = useState(false);
  const [banksLoading, setBanksLoading] = useState(true);
  const reqIdRef = useRef(0);

  useEffect(() => {
    let alive = true;
    listBanks()
      .then((list) => alive && setBanks(list))
      .catch(() => alive && setBanks([]))
      .finally(() => alive && setBanksLoading(false));
    return () => { alive = false; };
  }, []);

  const uniqueBanks = useMemo(() => {
    const seen = new Set<string>();
    return banks.filter((b) => {
      const key = `${b.code}::${b.name.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [banks]);

  useEffect(() => { setState({ kind: 'idle' }); }, [bankCode, accountNumber]);

  useEffect(() => {
    const digits = accountNumber.replace(/\D/g, '');
    if (digits.length !== 10 || !bankCode) return;
    const id = ++reqIdRef.current;
    const timer = setTimeout(async () => {
      setState({ kind: 'verifying' });
      try {
        const res = await verifyAccount({ accountNumber: digits, bankCode });
        if (reqIdRef.current !== id) return;
        setState({ kind: 'ok', accountName: res.accountName });
      } catch (e) {
        if (reqIdRef.current !== id) return;
        if (e instanceof AccountVerifyError) setState({ kind: 'error', message: e.message, code: e.code });
        else setState({ kind: 'error', message: 'Could not verify this account', code: 'UNKNOWN' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [bankCode, accountNumber]);

  const canSave = state.kind === 'ok';

  const handleSave = async () => {
    if (state.kind !== 'ok') return;
    setSaving(true);
    try {
      await savePayout({
        bankCode,
        accountNumber: accountNumber.replace(/\D/g, ''),
        accountName: state.accountName,
      });
      toast.success('Payout account saved');
      navigate(-1);
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-2">
      <div className="mb-5">
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">Payout account</h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-400">
          Withdrawals settle directly into your Nigerian bank account.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6">
        {/* Form */}
        <div className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-ink-200/70">
          {/* Bank */}
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
              Bank
            </span>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              disabled={banksLoading}
              className="h-11 w-full rounded-lg border-0 bg-white px-3.5 text-[14px] font-medium text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
            >
              <option value="">{banksLoading ? 'Loading banks…' : 'Select bank…'}</option>
              {uniqueBanks.map((b) => (
                <option key={`${b.code}__${b.name}`} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          {/* Account number */}
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
              Account number
            </span>
            <input
              inputMode="numeric"
              maxLength={10}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="0123456789"
              className="h-11 w-full rounded-lg border-0 bg-white px-3.5 text-[14px] font-semibold tabular-nums text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors placeholder:font-normal placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500"
            />
          </label>

          {/* Verify state */}
          {state.kind === 'verifying' && (
            <div className="flex items-center gap-2.5 rounded-lg bg-ink-50 px-3.5 py-3 ring-1 ring-inset ring-ink-200">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-200 border-t-ink-700" />
              <span className="text-[12px] font-medium text-ink-500">Verifying account name…</span>
            </div>
          )}

          {state.kind === 'ok' && (
            <div className="rounded-lg bg-brand-50 px-3.5 py-3 ring-1 ring-inset ring-brand-200">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">
                Verified
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-brand-800">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 5 5 9-11" />
                </svg>
                {state.accountName}
              </p>
            </div>
          )}

          {state.kind === 'error' && (
            <div className="rounded-lg bg-rose-50 px-3.5 py-3 ring-1 ring-inset ring-rose-200">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                Verification failed
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-rose-700">{state.message}</p>
            </div>
          )}

          <Button
            variant="brand"
            size="lg"
            block
            loading={saving}
            disabled={!canSave}
            onClick={handleSave}
          >
            Save as default payout account
          </Button>
        </div>

        {/* Info */}
        <aside className="mt-4 lg:mt-0">
          <div className="sticky top-20 space-y-3">
            <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                Why we ask
              </p>
              <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-ink-600">
                This is the account your cashback withdrawals land in. We verify the
                name with Paystack before saving it.
              </p>
            </div>
            <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                Accepted banks
              </p>
              <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-ink-600">
                All Nigerian commercial and fintech banks (Paystack-supported) work.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}