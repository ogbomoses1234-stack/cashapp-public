import { useEffect, useMemo, useState } from 'react';
import { listDisputes, createDispute } from '@/services/dispute.service';
import { uploadFile } from '@/services/upload.service';
import type { DisputeReport, DisputeStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

/* ═══════════════════════════════════════════════════════════
   Status metadata
═══════════════════════════════════════════════════════════ */
const STATUS_META: Record<
  DisputeStatus,
  { label: string; tone: string }
> = {
  open: {
    label: 'Open',
    tone: 'bg-amber-500/10 text-amber-700 ring-amber-500/25',
  },
  investigating: {
    label: 'Investigating',
    tone: 'bg-sky-500/10 text-sky-700 ring-sky-500/25',
  },
  resolved: {
    label: 'Resolved',
    tone: 'bg-brand-500/10 text-brand-700 ring-brand-500/25',
  },
  rejected: {
    label: 'Rejected',
    tone: 'bg-rose-500/10 text-rose-700 ring-rose-500/25',
  },
};

/* ═══════════════════════════════════════════════════════════
   Filter tabs
═══════════════════════════════════════════════════════════ */
type Filter = 'all' | DisputeStatus;

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'resolved', label: 'Resolved' },
];

export default function DisputesPage() {
  
  /* ─── Data ────────────────────────────────────────────── */
  const [disputes, setDisputes] = useState<DisputeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  /* ─── Form state ──────────────────────────────────────── */
  const [composerOpen, setComposerOpen] = useState(true);
  const [serial, setSerial] = useState('');
  const [desc, setDesc] = useState('');
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ─── Load disputes ───────────────────────────────────── */
  const load = () => {
    setLoading(true);
    listDisputes()
      .then((list) => setDisputes(Array.isArray(list) ? list : []))
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  /* ─── Filtered list + counts ──────────────────────────── */
  const visible = useMemo(
    () =>
      filter === 'all' ? disputes : disputes.filter((d) => d.status === filter),
    [disputes, filter]
  );

  const counts = useMemo(
    () => ({
      all: disputes.length,
      open: disputes.filter((d) => d.status === 'open').length,
      investigating: disputes.filter((d) => d.status === 'investigating').length,
      resolved: disputes.filter((d) => d.status === 'resolved').length,
    }),
    [disputes]
  );

  /* ─── Photo upload ────────────────────────────────────── */
  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File too large (max 5MB)');
    }
    if (!file.type.startsWith('image/')) {
      return toast.error('Only image files allowed');
    }

    setUploading(true);
    try {
      const key = await uploadFile({ purpose: 'dispute', file });
      setPhotoKey(key);
      setPhotoPreview(URL.createObjectURL(file));
      toast.success('Photo attached');
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoKey(null);
    setPhotoPreview(null);
  };

  /* ─── Submit ──────────────────────────────────────────── */
  const submit = async () => {
    if (!serial.trim()) return toast.error('Enter the serial number');
    if (desc.trim().length < 10) {
      return toast.error('Please describe the issue (at least 10 characters)');
    }
    setSubmitting(true);
    try {
      await createDispute({
        serialNumber: serial.trim().toUpperCase(),
        description: desc.trim(),
        photoObjectKey: photoKey ?? undefined,
      });
      toast.success('Report filed — we\'ll review within 24 hours');
      /* Reset form */
      setSerial('');
      setDesc('');
      removePhoto();
      setComposerOpen(false);
      load();
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Can submit? ─────────────────────────────────────── */
  const canSubmit =
    serial.trim().length > 0 &&
    desc.trim().length >= 10 &&
    !submitting &&
    !uploading;

  return (
    <div className="space-y-5 pb-2">
      {/* ═══════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════ */}
      <div>
        <h1 className="text-[26px] font-black tracking-[-0.03em] text-ink-900">
          Support &amp; Disputes
        </h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-400">
          Report a used, damaged, or unrecognized QR seal
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════
          COMPOSER
      ═══════════════════════════════════════════════════ */}
      {composerOpen ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/60">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-ink-100/70 bg-gradient-to-br from-brand-50 to-brand-100/40 px-4 py-3">
            <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-700">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black tracking-tight text-ink-900">
                File a new report
              </p>
              <p className="text-[11px] font-semibold text-ink-400">
                Takes about a minute
              </p>
            </div>
            {disputes.length > 0 && (
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 transition hover:bg-white/60 hover:text-ink-700"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4 p-4">
            {/* Serial number */}
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-ink-500">
                Serial number
              </span>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value.toUpperCase())}
                placeholder="e.g. 64A15B"
                disabled={submitting}
                autoCapitalize="characters"
                className="w-full rounded-xl border-0 bg-ink-50/60 px-3.5 py-3 font-mono text-[13px] font-bold tracking-wider text-ink-900 outline-none ring-1 ring-inset ring-ink-100/80 transition placeholder:font-sans placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-300 focus:bg-white focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
              <p className="mt-1.5 text-[10.5px] font-medium text-ink-400">
                The code printed on the QR seal
              </p>
            </label>

            {/* Description */}
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-ink-500">
                Description
              </span>
              <textarea
                rows={4}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What happened when you scanned it?"
                disabled={submitting}
                className="w-full resize-none rounded-xl border-0 bg-ink-50/60 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-ink-900 outline-none ring-1 ring-inset ring-ink-100/80 transition placeholder:text-ink-300 focus:bg-white focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
              <p className="mt-1.5 flex items-center justify-between text-[10.5px] font-medium text-ink-400">
                <span>
                  {desc.trim().length < 10
                    ? 'At least 10 characters'
                    : 'Looks good'}
                </span>
                <span className={desc.trim().length >= 10 ? 'text-brand-600' : ''}>
                  {desc.trim().length}/500
                </span>
              </p>
            </label>

            {/* Photo upload */}
            <div>
              <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-ink-500">
                Photo of the seal
                <span className="ml-1 font-medium normal-case tracking-normal text-ink-400">
                  (optional, but speeds up review)
                </span>
              </span>

              {photoPreview ? (
                /* Preview card */
                <div className="relative overflow-hidden rounded-xl ring-1 ring-inset ring-ink-100/80">
                  <img
                    src={photoPreview}
                    alt="Attached"
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center gap-2 text-white">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500">
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5 9-11" />
                        </svg>
                      </span>
                      <span className="text-[11.5px] font-black">Photo attached</span>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      disabled={submitting}
                      className="rounded-lg bg-white/20 px-2.5 py-1.5 text-[11px] font-black text-white backdrop-blur transition hover:bg-white/30 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Dropzone */
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 px-4 py-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40">
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading || submitting}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      e.target.value = '';
                    }}
                  />
                  {uploading ? (
                    <>
                      <Spinner
                        size={22}
                        className="!border-ink-300 !border-t-brand-600"
                      />
                      <p className="text-[12px] font-black text-ink-700">
                        Uploading…
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-500">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-[12.5px] font-black text-ink-900">
                          Tap to attach a photo
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-ink-400">
                          JPG, PNG — max 5MB
                        </p>
                      </div>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* Submit */}
            <Button
              variant="primary"
              size="lg"
              block
              onClick={submit}
              loading={submitting}
              disabled={!canSubmit}
            >
              File report
            </Button>

            <p className="text-center text-[10.5px] font-medium text-ink-400">
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      ) : (
        /* Collapsed — show a CTA to reopen */
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-card ring-1 ring-ink-100/60 transition active:scale-[.99]"
        >
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-500/12 text-brand-700">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <div className="flex-1">
            <p className="text-[13px] font-black tracking-tight text-ink-900">
              File another report
            </p>
            <p className="text-[11.5px] font-medium text-ink-400">
              Something else not working?
            </p>
          </div>
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 flex-shrink-0 text-ink-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      )}

      {/* ═══════════════════════════════════════════════════
          MY REPORTS
      ═══════════════════════════════════════════════════ */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size={24} className="!border-slate-300 !border-t-brand-500" />
        </div>
      ) : disputes.length > 0 ? (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h3 className="text-[15px] font-extrabold tracking-tight text-ink-900">
              My reports
            </h3>
            <span className="text-[11px] font-bold text-ink-400">
              {disputes.length} {disputes.length === 1 ? 'report' : 'reports'}
            </span>
          </div>

          {/* Filter chips */}
          <div className="scrollbar-none -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              const n = (counts as Record<string, number>)[f.key];
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[11.5px] font-black tracking-tight transition ${
                    isActive
                      ? 'bg-ink-900 text-white shadow-[0_4px_12px_-4px_rgba(11,16,28,.4)]'
                      : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-100/70 hover:text-ink-900'
                  }`}
                >
                  {f.label}
                  {n > 0 && (
                    <span
                      className={`ml-1.5 ${
                        isActive ? 'text-brand-300' : 'text-ink-400'
                      }`}
                    >
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* List */}
          {visible.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-8 text-center shadow-card ring-1 ring-ink-100/60">
              <p className="text-[12.5px] font-bold text-ink-700">
                No {filter} reports
              </p>
              <p className="mt-1 text-[11px] font-medium text-ink-400">
                Try a different filter.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {visible.map((d) => (
                <DisputeRow key={d.id} dispute={d} />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Dispute Row
═══════════════════════════════════════════════════════════ */
function DisputeRow({ dispute }: { dispute: DisputeReport }) {
  const meta = STATUS_META[dispute.status] ?? STATUS_META.open;
  const isResolved = dispute.status === 'resolved';

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/60">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-100/70 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-500">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
            </svg>
          </span>
          <span className="truncate font-mono text-[12.5px] font-black tracking-wider text-ink-900">
            #{dispute.serialNumber}
          </span>
        </div>
        <span
          className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider ring-1 ring-inset ${meta.tone}`}
        >
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="line-clamp-3 text-[12.5px] font-medium leading-relaxed text-ink-600">
          {dispute.description}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-[10.5px] font-semibold text-ink-400">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Filed {formatDate(dispute.createdAt)}
        </p>
      </div>

      {/* Footer — only shows for resolved */}
      {isResolved && (
        <div className="border-t border-ink-100/70 bg-brand-50/50 px-4 py-2.5">
          <p className="text-[11px] font-black text-brand-800">
            ✓ Resolved — check your wallet for the credit
          </p>
        </div>
      )}
    </div>
  );
}
