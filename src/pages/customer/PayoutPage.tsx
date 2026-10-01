import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listBanks,
  verifyAccount,
  savePayout,
  AccountVerifyError,
} from '@/services/payout.service';
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
    return () => {
      alive = false;
    };
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

  useEffect(() => {
    setState({ kind: 'idle' });
  }, [bankCode, accountNumber]);

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
        if (e instanceof AccountVerifyError) {
          setState({ kind: 'error', message: e.message, code: e.code });
        } else {
          setState({
            kind: 'error',
            message: 'Could not verify this account',
            code: 'UNKNOWN',
          });
        }
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
    <div className="space-y-4">
      <div>
        <h1 className="text-[26px] font-black tracking-[-0.03em]">
          Payout Account
        </h1>
        <p className="mt-1 text-[12.5px] font-medium text-slate-500">
          Withdrawals settle directly into your Nigerian bank account.
        </p>
      </div>

      <div className="space-y-4 rounded-3xl bg-white p-5 shadow-card">
        <label className="block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Bank
          </span>
          <select
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            disabled={banksLoading}
            className="w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-sm font-semibold outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
          >
            <option value="">
              {banksLoading ? 'Loading banks…' : 'Select bank…'}
            </option>
            {uniqueBanks.map((b) => (
              <option key={`${b.code}__${b.name}`} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Account number
          </span>
          <input
            inputMode="numeric"
            maxLength={10}
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
            }
            placeholder="0123456789"
            className="w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-sm font-semibold outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-500"
          />
        </label>

        {state.kind === 'verifying' && (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            Verifying account name…
          </div>
        )}

        {state.kind === 'ok' && (
          <div className="rounded-2xl bg-brand-50 px-4 py-3 ring-1 ring-inset ring-brand-500/25">
            <p className="text-[10.5px] font-black uppercase tracking-wider text-brand-600">
              Verified
            </p>
            <p className="mt-0.5 text-[13px] font-black text-brand-800">
              ✓ {state.accountName}
            </p>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-inset ring-rose-500/25">
            <p className="text-[10.5px] font-black uppercase tracking-wider text-rose-600">
              Verification failed
            </p>
            <p className="mt-0.5 text-[12.5px] font-semibold text-rose-700">
              {state.message}
            </p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          block
          loading={saving}
          disabled={!canSave}
          onClick={handleSave}
        >
          Save as default payout account
        </Button>
      </div>
    </div>
  );
}
