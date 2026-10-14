import { useEffect, useMemo, useState } from 'react';
import { listDisputes, createDispute } from '@/services/dispute.service';
import { uploadFile } from '@/services/upload.service';
import type { DisputeReport, DisputeStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

const STATUS_META: Record<DisputeStatus, { label: string; tone: string }> = {
  open:          { label: 'Open',          tone: 'bg-amber-50   text-amber-700   ring-amber-200' },
  investigating: { label: 'Investigating', tone: 'bg-sky-50     text-sky-700     ring-sky-200' },
  resolved:      { label: 'Resolved',      tone: 'bg-brand-50   text-brand-700   ring-brand-200' },
  rejected:      { label: 'Rejected',      tone: 'bg-rose-50    text-rose-700    ring-rose-200' },
};

type Filter = 'all' | DisputeStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'resolved', label: 'Resolved' },
];

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  const [serial, setSerial] = useState('');
  const [desc, setDesc] = useState('');
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(true);

  const load = () => {
    setLoading(true);
    listDisputes()
      .then((list) => setDisputes(Array.isArray(list) ? list : []))
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const visible = useMemo(
    () => (filter === 'all' ? disputes : disputes.filter((d) => d.status === filter)),
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

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error('File too large (max 5MB)');
    if (!file.type.startsWith('image/')) return toast.error('Only image files allowed');
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

  const submit = async () => {
    if (!serial.trim()) return toast.error('Enter the serial number');
    if (desc.trim().length < 10) return toast.error('Describe the issue (min 10 chars)');
    setSubmitting(true);
    try {
      await createDispute({
        serialNumber: serial.trim().toUpperCase(),
        description: desc.trim(),
        photoObjectKey: photoKey ?? undefined,
      });
      toast.success('Report filed');
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

  const canSubmit = serial.trim().length > 0 && desc.trim().length >= 10 && !submitting && !uploading;

  return (
    <div className="pb-2">
      <div className="mb-5">
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">
          Support &amp; disputes
        </h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-400">
          Report a used, damaged, or unrecognized QR seal
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-6">
        {/* ─── LEFT: composer ───────────────────────── */}
        <div>
          {composerOpen ? (
            <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
              <div className="flex items-center gap-2.5 border-b border-ink-100 bg-brand-50/40 px-4 py-3">
                <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold tracking-tight text-ink-900">
                    File a new report
                  </p>
                  <p className="text-[11px] font-medium text-ink-400">Takes about a minute</p>
                </div>
                {disputes.length > 0 && (
                  <button
                    onClick={() => setComposerOpen(false)}
                    className="grid h-7 w-7 place-items-center rounded-md text-ink-400 transition-colors hover:bg-white/60 hover:text-ink-700"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="space-y-4 p-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    Serial number
                  </span>
                  <input
                    type="text"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value.toUpperCase())}
                    placeholder="e.g. 64A15B"
                    disabled={submitting}
                    autoCapitalize="characters"
                    className="h-11 w-full rounded-lg border-0 bg-ink-50/70 px-3.5 font-mono text-[13px] font-semibold tracking-wider text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                  />
                  <p className="mt-1.5 text-[10.5px] font-medium text-ink-400">
                    The code printed on the QR seal
                  </p>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    Description
                  </span>
                  <textarea
                    rows={4}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="What happened when you scanned it?"
                    disabled={submitting}
                    className="w-full resize-none rounded-lg border-0 bg-ink-50/70 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                  />
                  <p className="mt-1.5 flex items-center justify-between text-[10.5px] font-medium text-ink-400">
                    <span>{desc.trim().length < 10 ? 'At least 10 characters' : 'Looks good'}</span>
                    <span className={desc.trim().length >= 10 ? 'text-brand-600' : ''}>
                      {desc.trim().length}/500
                    </span>
                  </p>
                </label>

                {/* Photo */}
                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    Photo of the seal <span className="font-normal normal-case text-ink-400">(optional)</span>
                  </span>

                  {photoPreview ? (
                    <div className="relative overflow-hidden rounded-lg ring-1 ring-ink-200">
                      <img src={photoPreview} alt="Attached" className="aspect-[4/3] w-full object-cover" />
                      <button
                        onClick={removePhoto}
                        disabled={submitting}
                        className="absolute right-2 top-2 rounded-md bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-ink-950/85 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/40 px-4 py-6 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/40">
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
                          <Spinner size={20} tone="dark" />
                          <p className="text-[12px] font-semibold text-ink-700">Uploading…</p>
                        </>
                      ) : (
                        <>
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink-100 text-ink-500">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                              <circle cx="12" cy="13" r="3" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-[12.5px] font-semibold text-ink-900">Tap to attach a photo</p>
                            <p className="mt-0.5 text-[11px] font-medium text-ink-400">JPG, PNG · max 5MB</p>
                          </div>
                        </>
                      )}
                    </label>
                  )}
                </div>

                <Button
                  variant="brand"
                  size="lg"
                  block
                  onClick={submit}
                  loading={submitting}
                  disabled={!canSubmit}
                >
                  File report
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setComposerOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300 active:scale-[.99]"
            >
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold tracking-tight text-ink-900">File another report</p>
                <p className="text-[11.5px] font-medium text-ink-400">Something else not working?</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-ink-300" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          )}
        </div>

        {/* ─── RIGHT: history ───────────────────────── */}
        <aside className="mt-5 lg:mt-0">
          <div className="sticky top-20">
            <div className="mb-3 flex items-end justify-between">
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                My reports
              </h3>
              {disputes.length > 0 && (
                <span className="text-[11px] font-medium text-ink-400">
                  {disputes.length} total
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Spinner size={22} tone="brand" />
              </div>
            ) : disputes.length === 0 ? (
              <div className="rounded-xl bg-white p-5 text-center ring-1 ring-ink-200/70">
                <span className="mb-2 block text-xl opacity-40">⚖️</span>
                <p className="text-[12.5px] font-semibold text-ink-700">No reports yet</p>
                <p className="mt-1 text-[11px] font-medium text-ink-400">
                  Your reports will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="scrollbar-none mb-3 flex gap-2 overflow-x-auto pb-1">
                  {FILTERS.map((f) => {
                    const isActive = filter === f.key;
                    const n = (counts as Record<string, number>)[f.key];
                    return (
                      <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11.5px] font-semibold tracking-[-0.005em] transition-colors ${
                          isActive
                            ? 'bg-ink-900 text-white'
                            : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200 hover:text-ink-900'
                        }`}
                      >
                        {f.label}
                        {n > 0 && (
                          <span className={`ml-1.5 ${isActive ? 'text-brand-300' : 'text-ink-400'}`}>
                            {n}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {visible.length === 0 ? (
                  <div className="rounded-xl bg-white p-5 text-center ring-1 ring-ink-200/70">
                    <p className="text-[12.5px] font-semibold text-ink-700">
                      No {filter} reports
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {visible.map((d) => (
                      <DisputeRow key={d.id} dispute={d} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DisputeRow({ dispute }: { dispute: DisputeReport }) {
  const meta = STATUS_META[dispute.status] ?? STATUS_META.open;
  const isResolved = dispute.status === 'resolved';

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-ink-100 text-ink-500">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
            </svg>
          </span>
          <span className="truncate font-mono text-[12px] font-semibold tracking-wider text-ink-900">
            #{dispute.serialNumber}
          </span>
        </div>
        <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ring-1 ring-inset ${meta.tone}`}>
          {meta.label}
        </span>
      </div>

      <div className="p-4">
        <p className="line-clamp-3 text-[12.5px] font-medium leading-relaxed text-ink-600">
          {dispute.description}
        </p>
        <p className="mt-2 text-[10.5px] font-medium text-ink-400">
          Filed {formatDate(dispute.createdAt)}
        </p>
      </div>

      {isResolved && (
        <div className="border-t border-ink-100 bg-brand-50/50 px-4 py-2.5">
          <p className="text-[11px] font-semibold text-brand-800">
            ✓ Resolved — check your wallet for the credit
          </p>
        </div>
      )}
    </div>
  );
}