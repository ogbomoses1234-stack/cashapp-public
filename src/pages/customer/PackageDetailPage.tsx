import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addPackageItem,
  createPackage,
  getPackage,
  removePackageItem,
  submitPackage,
  updatePackage,
  updatePackageItem,
} from '@/services/package.service';
import type { PackageItem, PackageItemInput, PackageRequestInput } from '@/types/package';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PackageItemEditorModal } from '@/components/package/PackageItemEditorModal';
import { formatNaira } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

const COUNTRIES = [
  'United Kingdom', 'United States', 'Canada', 'Germany', 'Ireland',
  'Netherlands', 'France', 'Italy', 'South Africa', 'UAE', 'Other',
];

export default function PackageBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  const [form, setForm] = useState<PackageRequestInput>({
    title: '', notes: '', country: '', city: '', deliveryAddress: '', contactPhone: '',
  });
  const [items, setItems] = useState<PackageItem[]>([]);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PackageItem | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    getPackage(id)
      .then((p) => {
        if (!alive || !p) return;
        if (!p.isEditable) {
          toast.error('This list is locked. Request an edit from the detail page.');
          navigate(`/packages/${id}`, { replace: true });
          return;
        }
        setForm({
          title: p.title,
          notes: p.notes ?? '',
          country: p.country,
          city: p.city,
          deliveryAddress: p.deliveryAddress,
          contactPhone: p.contactPhone,
        });
        setItems(p.items);
      })
      .catch((e) => {
        toast.error((e as ApiClientError).message);
        navigate('/packages', { replace: true });
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, navigate]);

  const estimatedTotal = useMemo(
    () => items.reduce((sum, i) => {
      const p = parseFloat(i.estimatedPrice ?? '0');
      return sum + (isFinite(p) ? p * i.quantity : 0);
    }, 0),
    [items]
  );

  const canSubmit =
    form.title.trim().length >= 3 &&
    form.country.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.deliveryAddress.trim().length >= 10 &&
    form.contactPhone.trim().length >= 7 &&
    items.length > 0;

  const handleSaveDraft = useCallback(async (): Promise<string | null> => {
    setSaving(true);
    try {
      if (isEdit && id) {
        await updatePackage(id, form);
        toast.success('List updated');
        return id;
      }
      const created = await createPackage(form);
      if (!created) throw new Error('Could not create list');
      toast.success('List created');
      return created.id;
    } catch (e) {
      toast.error((e as ApiClientError).message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [form, id, isEdit]);

  const handleSaveItem = async (input: PackageItemInput) => {
    setSavingItem(true);
    try {
      let requestId = id;
      if (!requestId) {
        const newId = await handleSaveDraft();
        if (!newId) return;
        requestId = newId;
        navigate(`/packages/${newId}/edit`, { replace: true });
      }
      if (editingItem) {
        const updated = await updatePackageItem(requestId, editingItem.id, input);
        if (updated) setItems((prev) => prev.map((it) => (it.id === editingItem.id ? updated : it)));
      } else {
        const created = await addPackageItem(requestId, input);
        if (created) setItems((prev) => [...prev, created]);
      }
      setItemModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setSavingItem(false);
    }
  };

  const handleRemoveItem = async (item: PackageItem) => {
    if (!id) { setItems((prev) => prev.filter((i) => i.id !== item.id)); return; }
    if (!window.confirm(`Remove "${item.name}"?`)) return;
    try {
      await removePackageItem(id, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      toast.error((e as ApiClientError).message);
    }
  };

  const handleSubmit = async () => {
    const requestId = await handleSaveDraft();
    if (!requestId) return;
    if (items.length === 0) return toast.error('Add at least one item before submitting');
    setSubmitting(true);
    try {
      await submitPackage(requestId);
      toast.success('List submitted — admin will review shortly');
      navigate(`/packages/${requestId}`, { replace: true });
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={26} tone="brand" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
          {isEdit ? 'Edit list' : 'New list'}
        </p>
        <h1 className="mt-1 text-[24px] font-bold tracking-[-0.02em] text-ink-900">
          {isEdit ? 'Update your list' : 'Create your shopping list'}
        </h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-400">
          Add everything you want — we'll source, quote and ship it.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-6">
        {/* ─── LEFT: form + items ─────────────────── */}
        <div className="space-y-4">
          {/* Shipping */}
          <div className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-ink-200/70">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
              Shipping details
            </h2>

            <Input
              label="List title"
              placeholder="e.g. December food haul"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
                Country
              </span>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="h-11 w-full rounded-lg border-0 bg-white px-3.5 text-[14px] font-medium text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select country…</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <Input
              label="City"
              placeholder="e.g. London"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
                Delivery address abroad
              </span>
              <textarea
                rows={3}
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                placeholder="Street, city, postal code"
                className="w-full resize-none rounded-lg border-0 bg-white px-3.5 py-3 text-[13.5px] font-medium leading-relaxed text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors focus:ring-2 focus:ring-violet-500"
              />
            </label>

            <Input
              label="Contact phone"
              placeholder="+44 7… or local number"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            />

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
                Notes for our team — optional
              </span>
              <textarea
                rows={2}
                value={form.notes ?? ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Prefer shipped together in one box"
                className="w-full resize-none rounded-lg border-0 bg-white px-3.5 py-3 text-[13.5px] font-medium leading-relaxed text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors focus:ring-2 focus:ring-violet-500"
              />
            </label>
          </div>

          {/* Items */}
          <div className="rounded-xl bg-white p-5 ring-1 ring-ink-200/70">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Items on this list
                </h2>
                <p className="mt-0.5 text-[11px] font-medium text-ink-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                  {estimatedTotal > 0 && ` · est. ${formatNaira(estimatedTotal)}`}
                </p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setItemModalOpen(true); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-[11.5px] font-semibold text-white transition-colors hover:bg-violet-600 active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/40 p-6 text-center">
                <span className="mb-2 block text-2xl">📝</span>
                <p className="text-[12.5px] font-semibold text-ink-700">Your list is empty</p>
                <p className="mt-1 text-[11px] font-medium text-ink-400">
                  Add each product — brand, size, colour.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((it) => (
                  <div key={it.id} className="flex items-start gap-3 rounded-lg bg-ink-50/50 p-3 ring-1 ring-inset ring-ink-200/70">
                    {it.imageUrl ? (
                      <img src={it.imageUrl} alt={it.name} className="h-12 w-12 flex-shrink-0 rounded-md object-cover ring-1 ring-ink-200" />
                    ) : (
                      <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-md bg-violet-100 text-lg">📦</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink-900">{it.name}</p>
                      {it.details && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-ink-400">
                          {it.details}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10.5px] font-semibold">
                        <span className="rounded bg-white px-1.5 py-0.5 text-ink-700 ring-1 ring-inset ring-ink-200">
                          × {it.quantity}
                        </span>
                        {it.estimatedPrice && (
                          <span className="tabular-nums text-ink-400">
                            ~{formatNaira(it.estimatedPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <button
                        onClick={() => { setEditingItem(it); setItemModalOpen(true); }}
                        aria-label="Edit"
                        className="grid h-8 w-8 place-items-center rounded-md text-ink-400 transition-colors hover:bg-white hover:text-violet-600"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveItem(it)}
                        aria-label="Remove"
                        className="grid h-8 w-8 place-items-center rounded-md text-ink-400 transition-colors hover:bg-white hover:text-rose-500"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: summary sticky ──────────────── */}
        <aside className="mt-4 lg:mt-0">
          <div className="sticky top-20 space-y-3">
            <div className="rounded-xl bg-white p-5 ring-1 ring-ink-200/70">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
                Summary
              </p>
              <div className="mt-3 space-y-2 text-[12.5px]">
                <div className="flex justify-between">
                  <span className="font-medium text-ink-400">Items</span>
                  <span className="font-semibold tabular-nums text-ink-900">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-ink-400">Est. total</span>
                  <span className="font-semibold tabular-nums text-ink-900">
                    {formatNaira(estimatedTotal)}
                  </span>
                </div>
              </div>
              <p className="mt-3 border-t border-ink-100 pt-3 text-[11px] font-medium leading-relaxed text-ink-400">
                Final price will be quoted by our team after reviewing your list.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              block
              loading={submitting}
              disabled={saving || !canSubmit}
              onClick={handleSubmit}
            >
              Submit list
            </Button>
            <Button
              variant="outline"
              size="lg"
              block
              loading={saving}
              disabled={submitting}
              onClick={handleSaveDraft}
            >
              Save draft
            </Button>
          </div>
        </aside>
      </div>

      <PackageItemEditorModal
        open={itemModalOpen}
        onClose={() => { setItemModalOpen(false); setEditingItem(null); }}
        onSave={handleSaveItem}
        initial={editingItem}
        saving={savingItem}
      />
    </div>
  );
}