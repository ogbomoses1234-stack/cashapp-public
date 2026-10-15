import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getPackage,
  listPackageMessages,
  requestPackageEdit,
  sendPackageMessage,
} from '@/services/package.service';
import type { PackageMessage, PackageRequest, PackageStatus } from '@/types/package';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { RequestEditModal } from '@/components/package/RequestEditModal';
import { formatNaira, formatRelative, formatDate } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

const STATUS_META: Record<PackageStatus, { label: string; tone: string; hint: string }> = {
  draft:       { label: 'Draft',       tone: 'bg-ink-100    text-ink-600    ring-ink-200',      hint: 'Still editable — submit when ready.' },
  submitted:   { label: 'Submitted',   tone: 'bg-sky-50     text-sky-700    ring-sky-200',      hint: 'Our team is reviewing your list.' },
  quoted:      { label: 'Quoted',      tone: 'bg-violet-50  text-violet-700 ring-violet-200',   hint: 'We have quoted a price — check messages.' },
  approved:    { label: 'Approved',    tone: 'bg-brand-50   text-brand-700  ring-brand-200',    hint: 'Approved. Awaiting payment.' },
  in_progress: { label: 'In progress', tone: 'bg-amber-50   text-amber-700  ring-amber-200',    hint: 'We are sourcing and packing your items.' },
  shipped:     { label: 'Shipped',     tone: 'bg-sky-50     text-sky-700    ring-sky-200',      hint: 'Your package is on the way.' },
  delivered:   { label: 'Delivered',   tone: 'bg-brand-50   text-brand-700  ring-brand-200',    hint: 'Delivered — thanks for using Vickkyaku!' },
  cancelled:   { label: 'Cancelled',   tone: 'bg-rose-50    text-rose-700   ring-rose-200',     hint: 'This request was cancelled.' },
};

/* Poll interval — 15 seconds is a good balance between liveness and load */
const POLL_INTERVAL_MS = 15_000;

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<PackageRequest | null>(null);
  const [messages, setMessages] = useState<PackageMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isClosedRef = useRef(false);

  /* ─── Load package + messages ────────────────────────── */
  const load = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (!id) return;
    if (!opts.silent) setLoading(true);
    try {
      const [p, m] = await Promise.all([
        getPackage(id),
        listPackageMessages(id).catch(() => [] as PackageMessage[]),
      ]);
      setRequest(p);
      setMessages(m);
      isClosedRef.current = p
        ? p.status === 'delivered' || p.status === 'cancelled'
        : false;
    } catch (e) {
      if (!opts.silent) {
        toast.error((e as ApiClientError).message);
        setRequest(null);
      }
    } finally {
      if (!opts.silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /* ─── Polling for updates ─────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      load({ silent: true }).catch(() => {});
    };
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    /* Also refresh immediately when tab regains focus */
    const onVisible = () => {
      if (document.visibilityState === 'visible') load({ silent: true }).catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [id, load]);

  /* ─── Auto-scroll chat ───────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  /* ─── Focus input when ready ─────────────────────────── */
  useEffect(() => {
    if (!loading && request && !isClosed(request.status)) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [loading, request]);

  const canSend =
    request != null && !isClosed(request.status) && text.trim().length > 0 && !sending;

  /* ─── Send message ───────────────────────────────────── */
  const handleSend = async () => {
    if (!id || !canSend) return;
    const body = text.trim();
    setSending(true);
    const optimistic: PackageMessage = {
      id: `temp-${Date.now()}`,
      requestId: id,
      senderId: 'me',
      senderRole: 'customer',
      body,
      attachmentObjectKey: null,
      attachmentUrl: null,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');
    try {
      const real = await sendPackageMessage(id, body);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? real ?? m : m))
      );
      /* Refresh in the background so any server-side system messages appear */
      load({ silent: true }).catch(() => {});
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(body);
      toast.error((e as ApiClientError).message);
    } finally {
      setSending(false);
    }
  };

  /* ─── Request edit ───────────────────────────────────── */
  const handleRequestEdit = async (reason: string) => {
    if (!id) return;
    setSubmittingEdit(true);
    try {
      const edit = await requestPackageEdit(id, reason);
      if (edit && request) setRequest({ ...request, pendingEditRequest: edit });
      toast.success('Edit request sent');
      setEditModalOpen(false);
      load({ silent: true }).catch(() => {});
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  /* ─── Loading / not found ───────────────────────────── */
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={26} tone="brand" />
      </div>
    );
  }
  if (!request) {
    return (
      <EmptyState
        icon="📦"
        title="List not found"
        hint="It may have been removed."
        action={
          <Button variant="primary" onClick={() => navigate('/packages')}>
            Back to lists
          </Button>
        }
      />
    );
  }

  const meta = STATUS_META[request.status] ?? STATUS_META.draft;
  const pendingEdit = request.pendingEditRequest?.status === 'pending';
  const itemCount = request.items.length;
  const estimatedTotal = request.items.reduce((sum, i) => {
    const p = parseFloat(i.estimatedPrice ?? '0');
    return sum + (isFinite(p) ? p * i.quantity : 0);
  }, 0);

  return (
    <div className="pb-2">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] font-semibold tracking-wider text-ink-400">
            #{request.reference}
          </p>
          <h1 className="mt-1 truncate text-[22px] font-bold tracking-[-0.02em] text-ink-900">
            {request.title}
          </h1>
        </div>
        <span className={`flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${meta.tone}`}>
          {meta.label}
        </span>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-6">
        {/* ─── LEFT: details ─────────────────────────── */}
        <div className="space-y-4">
          {/* Status hint */}
          <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
            <p className="text-[12.5px] font-medium text-ink-600">{meta.hint}</p>
            {pendingEdit && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 ring-1 ring-inset ring-amber-200/70">
                <span className="mt-0.5 text-base">⏳</span>
                <div>
                  <p className="text-[11.5px] font-semibold text-amber-800">
                    Edit request pending
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium leading-snug text-amber-900/80">
                    Our team will review your request. You'll be notified in chat.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {request.isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/packages/${request.id}/edit`)}
              >
                ✎ Edit list
              </Button>
            )}
            {!request.isEditable && !pendingEdit && !isClosed(request.status) && (
              <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
                Request an edit
              </Button>
            )}
          </div>

          {/* Delivery details */}
          <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-500">
              Delivering to
            </h2>
            <p className="text-[13px] font-semibold text-ink-900">
              {request.deliveryAddress}
            </p>
            <p className="mt-0.5 text-[11.5px] font-medium text-ink-400">
              {[request.city, request.country].filter(Boolean).join(', ')}
            </p>
            {request.contactPhone && (
              <p className="mt-1 text-[11.5px] font-medium text-ink-400">
                📞 {request.contactPhone}
              </p>
            )}
            {request.notes && (
              <div className="mt-3 rounded-lg bg-ink-50/70 p-3">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-500">
                  Your note
                </p>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-ink-700">
                  {request.notes}
                </p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                Items ({itemCount})
              </h2>
              {estimatedTotal > 0 && (
                <span className="text-[11px] font-semibold tabular-nums text-ink-500">
                  ~{formatNaira(estimatedTotal)}
                </span>
              )}
            </div>
            {itemCount === 0 ? (
              <p className="rounded-lg bg-ink-50/70 p-3 text-center text-[12px] font-medium text-ink-400">
                No items yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {request.items.map((it) => (
                  <div key={it.id} className="flex items-start gap-3">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="h-12 w-12 flex-shrink-0 rounded-md object-cover ring-1 ring-ink-200"
                      />
                    ) : (
                      <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-md bg-violet-100 text-lg">
                        📦
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-ink-900">{it.name}</p>
                      {it.details && (
                        <p className="mt-0.5 text-[11px] font-medium leading-snug text-ink-400">
                          {it.details}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-[10.5px] font-semibold text-ink-500">
                        <span className="rounded bg-ink-100/70 px-1.5 py-0.5 tabular-nums">
                          × {it.quantity}
                        </span>
                        {it.estimatedPrice && (
                          <span className="tabular-nums text-ink-400">
                            ~{formatNaira(it.estimatedPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quote card */}
          {request.quotedTotal && (
            <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/70">
                Quote from our team
              </p>
              <p className="mt-1 text-[24px] font-bold tracking-[-0.02em] tabular-nums">
                {formatNaira(request.quotedTotal)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-white/80">
                Reply in the chat below to confirm.
              </p>
            </div>
          )}

          <p className="text-center text-[10.5px] font-medium text-ink-400">
            Created {formatDate(request.createdAt)}
          </p>
        </div>

        {/* ─── RIGHT: chat ───────────────────────────── */}
        <aside className="mt-5 lg:mt-0">
          <div className="sticky top-20">
            <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Conversation
                </h2>
                <span className="text-[10px] font-semibold text-ink-400">
                  Live · updates every 15s
                </span>
              </div>

              <div className="max-h-[420px] min-h-[200px] overflow-y-auto px-4 py-3">
                {messages.length === 0 ? (
                  <p className="py-10 text-center text-[12px] font-medium text-ink-400">
                    No messages yet — say hello 👋
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {messages.map((m) => (
                      <ChatBubble key={m.id} message={m} />
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-ink-100 p-3">
                {isClosed(request.status) ? (
                  <div className="rounded-lg bg-ink-100/70 px-3.5 py-3 text-center text-[11.5px] font-semibold text-ink-500">
                    This list is closed
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef as any}
                      rows={1}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (canSend) handleSend();
                        }
                      }}
                      placeholder="Type your message…"
                      className="max-h-32 flex-1 resize-none rounded-lg border-0 bg-ink-50 px-3.5 py-2.5 text-[12.5px] font-medium text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!canSend}
                      aria-label="Send"
                      className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-ink-900 text-white transition-colors hover:bg-ink-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400"
                    >
                      {sending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 2 11 13" />
                          <path d="M22 2 15 22l-4-9-9-4z" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <RequestEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleRequestEdit}
        saving={submittingEdit}
      />
    </div>
  );
}

/* ─── Bubble ────────────────────────────────────────────── */
function ChatBubble({ message }: { message: PackageMessage }) {
  const isMe = message.senderRole === 'customer';
  const isSystem = message.senderId === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-[90%] rounded-lg bg-amber-50 px-3.5 py-2 text-center ring-1 ring-inset ring-amber-200/70">
          <p className="text-[11.5px] font-medium leading-relaxed text-amber-900">
            {message.body}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-amber-700/70">
            {formatRelative(message.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[82%] flex-col gap-1">
        {!isMe && (
          <span className="ml-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-600">
            Admin
          </span>
        )}
        <div
          className={`rounded-xl px-3.5 py-2 text-[13px] font-medium leading-relaxed ${
            isMe
              ? 'rounded-br-sm bg-ink-900 text-white'
              : 'rounded-bl-sm bg-ink-100 text-ink-900 ring-1 ring-inset ring-ink-200/70'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        </div>
        <span
          className={`text-[10px] font-medium text-ink-400 ${
            isMe ? 'mr-1 text-right' : 'ml-1'
          }`}
        >
          {formatRelative(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

function isClosed(status: PackageStatus): boolean {
  return status === 'delivered' || status === 'cancelled';
}