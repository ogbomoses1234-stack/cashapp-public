import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { placeOrder } from '@/services/order.service';
import { uploadFile } from '@/services/upload.service';
import { formatNaira } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';
import type { PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const [payment, setPayment] = useState<PaymentMethod>('bank_transfer');
  const [receiptKey, setReceiptKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error('File too large (max 5 MB)');
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type))
      return toast.error('Only JPG, PNG or PDF allowed');
    setUploading(true);
    try {
      const key = await uploadFile({ purpose: 'receipt', file });
      setReceiptKey(key);
      toast.success('Receipt uploaded');
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return navigate('/login');
    if (items.length === 0) return toast.error('Your cart is empty');
    if (payment === 'bank_transfer' && !receiptKey)
      return toast.error('Please upload your bank transfer receipt');

    setSubmitting(true);
    try {
      await placeOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: payment,
        deliveryAddress: user.deliveryAddress ?? '',
        receiptObjectKey: receiptKey ?? undefined,
      });
      toast.success('Order placed successfully');
      navigate('/orders');
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-4">
      <h1 className="mb-5 text-[24px] font-bold tracking-[-0.02em] text-ink-900">Checkout</h1>

      {/* 2-col on desktop */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-6">
        {/* ─── LEFT: payment methods ─────────────────── */}
        <div className="space-y-4">
          {/* Bank Transfer */}
          <PaymentCard
            selected={payment === 'bank_transfer'}
            onSelect={() => setPayment('bank_transfer')}
            title="Bank Transfer"
            sub="Transfer to our account, then upload your receipt"
          >
            <div className="mt-4 space-y-3 border-t border-dashed border-ink-200 pt-4">
              <div className="rounded-lg bg-ink-900 p-4 text-white">
                <Row label="Bank" value="GTBank" />
                <Row label="Account number" value="0123456789" />
                <Row label="Account name" value="QRCashBack Ltd" />
              </div>

              <label className="block cursor-pointer rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/50 p-5 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  disabled={uploading}
                />
                {uploading ? (
                  <p className="text-[12.5px] font-semibold text-ink-500">Uploading…</p>
                ) : receiptKey ? (
                  <p className="text-[12.5px] font-semibold text-brand-700">✓ Receipt attached</p>
                ) : (
                  <>
                    <span className="mb-2 block text-2xl">🧾</span>
                    <strong className="block text-[12.5px] font-semibold text-ink-900">
                      Upload payment receipt
                    </strong>
                    <small className="text-[11px] font-medium text-ink-400">
                      PNG, JPG or PDF · max 5 MB
                    </small>
                  </>
                )}
              </label>
            </div>
          </PaymentCard>

          {/* POD */}
          <PaymentCard
            selected={payment === 'pod'}
            onSelect={() => setPayment('pod')}
            title="Pay On Delivery"
            sub="Pay with cash or POS when your order arrives"
          >
            <div className="mt-4 rounded-lg bg-sky-50 p-3.5 text-[12.5px] font-medium leading-relaxed text-sky-800 ring-1 ring-inset ring-sky-200">
              Pay via POS or cash on arrival. No receipt upload required.
            </div>
          </PaymentCard>
        </div>

        {/* ─── RIGHT: sticky summary ──────────────────── */}
        <aside>
          <div className="sticky top-20 overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
            <div className="border-b border-ink-100 p-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                Order summary
              </p>
            </div>

            <div className="space-y-2.5 p-4">
              <Row2 label={`Items (${itemCount})`} value={formatNaira(subtotal)} />
              <Row2 label="Delivery" value="Free" muted />
              <div className="border-t border-ink-100 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-ink-900">Total</span>
                  <span className="text-[20px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
                    {formatNaira(subtotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-ink-100 bg-ink-50/40 p-4">
              <Button
                variant="brand"
                size="lg"
                block
                loading={submitting}
                disabled={uploading}
                onClick={handleSubmit}
              >
                Confirm order
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PaymentCard({
  selected, onSelect, title, sub, children,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl bg-white p-5 ring-1 transition-colors ${
        selected ? 'ring-2 ring-brand-500' : 'ring-ink-200/70 hover:ring-ink-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-5 w-5 place-items-center rounded-full ring-2 transition-colors ${
            selected ? 'ring-brand-500' : 'ring-ink-300'
          }`}
        >
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
        </span>
        <div>
          <strong className="block text-[13.5px] font-semibold text-ink-900">{title}</strong>
          <small className="text-[11.5px] font-medium text-ink-500">{sub}</small>
        </div>
      </div>
      {selected && children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] font-medium text-white/60">{label}</span>
      <strong className="text-[12.5px] font-semibold tabular-nums">{value}</strong>
    </div>
  );
}

function Row2({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] font-medium text-ink-400">{label}</span>
      <span className={`text-[12.5px] font-semibold tabular-nums ${muted ? 'text-ink-400' : 'text-ink-900'}`}>
        {value}
      </span>
    </div>
  );
}