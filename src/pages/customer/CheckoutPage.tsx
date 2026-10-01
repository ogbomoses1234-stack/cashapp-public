import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (items.length === 0) {
      // (cart items are kept in sync by the global store)
    }
  }, [items.length]);

  const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error('File too large (max 5 MB)');
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      return toast.error('Only JPG, PNG or PDF allowed');
    }
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
    if (payment === 'bank_transfer' && !receiptKey) {
      return toast.error('Please upload your bank transfer receipt');
    }

    setSubmitting(true);
    try {
      await placeOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: payment,
        deliveryAddress: user.deliveryAddress ?? '',
        receiptObjectKey: receiptKey ?? undefined,
      });
      navigate('/orders');
      toast.success('Order placed successfully');
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black tracking-tight">Checkout</h1>

      <div className="rounded-3xl bg-white p-5 shadow-card">
        <p className="text-xs font-bold text-slate-500">
          {items.length} item(s) · Total <b className="text-ink-900">{formatNaira(subtotal)}</b>
        </p>
      </div>

      {/* Bank Transfer */}
      <div
        onClick={() => setPayment('bank_transfer')}
        className={`cursor-pointer rounded-3xl bg-white p-5 shadow-card transition ${
          payment === 'bank_transfer' ? 'ring-2 ring-brand-500' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`grid h-5 w-5 place-items-center rounded-full ring-2 ${
              payment === 'bank_transfer' ? 'ring-brand-500' : 'ring-slate-300'
            }`}
          >
            {payment === 'bank_transfer' && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
          </span>
          <div>
            <strong className="block text-sm font-black">Bank Transfer</strong>
            <small className="text-[11.5px] font-semibold text-slate-500">
              Transfer to our business account, then upload your receipt
            </small>
          </div>
        </div>

        {payment === 'bank_transfer' && (
          <div className="mt-4 space-y-3 border-t border-dashed border-slate-200 pt-4">
            <div className="rounded-2xl bg-ink-900 p-4 text-white">
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] font-semibold text-slate-400">Bank</span>
                <strong className="text-[13px] font-bold">GTBank</strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] font-semibold text-slate-400">Account Number</span>
                <strong className="text-[13px] font-bold">0123456789</strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] font-semibold text-slate-400">Account Name</span>
                <strong className="text-[13px] font-bold">QRCashBack Ltd</strong>
              </div>
            </div>

            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-brand-500 hover:bg-brand-50">
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                disabled={uploading}
              />
              {uploading ? (
                <p className="text-xs font-bold text-slate-500">Uploading…</p>
              ) : receiptKey ? (
                <p className="text-xs font-black text-brand-700">✓ Receipt attached</p>
              ) : (
                <>
                  <span className="mb-2 block text-2xl">🧾</span>
                  <strong className="block text-[13px] font-bold">Upload Transfer Payment Receipt</strong>
                  <small className="text-[11px] font-semibold text-slate-400">PNG, JPG or PDF · max 5MB</small>
                </>
              )}
            </label>
          </div>
        )}
      </div>

      {/* POD */}
      <div
        onClick={() => setPayment('pod')}
        className={`cursor-pointer rounded-3xl bg-white p-5 shadow-card transition ${
          payment === 'pod' ? 'ring-2 ring-brand-500' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`grid h-5 w-5 place-items-center rounded-full ring-2 ${
              payment === 'pod' ? 'ring-brand-500' : 'ring-slate-300'
            }`}
          >
            {payment === 'pod' && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
          </span>
          <div>
            <strong className="block text-sm font-black">Pay On Delivery</strong>
            <small className="text-[11.5px] font-semibold text-slate-500">
              Pay with cash or POS when your order arrives
            </small>
          </div>
        </div>
        {payment === 'pod' && (
          <div className="mt-4 rounded-2xl bg-sky-500/10 p-4 text-[12.5px] font-semibold leading-relaxed text-sky-700 ring-1 ring-inset ring-sky-500/25">
            Pay via POS or cash on arrival. No receipt upload required.
          </div>
        )}
      </div>

      <Button
        variant="primary"
        size="lg"
        block
        loading={submitting}
        disabled={uploading}
        onClick={handleSubmit}
      >
        Confirm Order
      </Button>
    </div>
  );
}
