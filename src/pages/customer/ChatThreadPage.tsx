import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listMessages, sendMessage } from '@/services/chat.service';
import type { ChatMessage, ChatThread } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { formatRelative } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ─── Load messages ────────────────────────────────────── */
  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await listMessages(id);
      setMessages(Array.isArray(res?.messages) ? res.messages : []);
      setThread(res?.thread ?? null);
    } catch (e) {
      toast.error((e as ApiClientError).message);
      setMessages([]);
      setThread(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ─── Auto-scroll to newest message ────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  /* ─── Focus input on load ──────────────────────────────── */
  useEffect(() => {
    if (!loading && thread?.status !== 'closed') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [loading, thread?.status]);

  /* ─── Status flags ─────────────────────────────────────── */
  const awaitingAdmin = thread?.status === 'awaiting_admin';
  const closed = thread?.status === 'closed';
  const canSend = !awaitingAdmin && !closed && text.trim().length > 0 && !sending;

  /* ─── Send message ─────────────────────────────────────── */
  const submit = async () => {
    if (!id || !canSend) return;
    setSending(true);

    /* Optimistic append */
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      threadId: id,
      senderId: 'me',
      senderRole: 'customer',
      body: text.trim(),
      attachmentObjectKey: null,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    const body = text.trim();
    setMessages((prev) => [...prev, optimistic]);
    setText('');

    try {
      const real = await sendMessage(id, { body });
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? real : m))
      );
      if (thread) setThread({ ...thread, status: 'awaiting_admin' });
    } catch (e) {
      /* Rollback */
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(body);
      toast.error((e as ApiClientError).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      {/* ═══════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════ */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-black tracking-[-0.02em] text-ink-900">
            {thread?.subject ?? 'Conversation'}
          </h1>
          <p className="mt-0.5 text-[11.5px] font-semibold text-ink-400">
            {awaitingAdmin && 'Waiting for admin reply'}
            {thread?.status === 'awaiting_customer' && 'Admin is waiting for you'}
            {closed && 'This thread is closed'}
            {thread?.status === 'open' && 'Open'}
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MESSAGES
      ═══════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto rounded-3xl bg-white shadow-card ring-1 ring-ink-100/60">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size={24} className="!border-slate-300 !border-t-brand-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-2xl">
              💬
            </span>
            <p className="mt-3 text-[13px] font-bold text-ink-900">
              No messages yet
            </p>
            <p className="mt-1 max-w-[240px] text-[11.5px] font-medium leading-relaxed text-ink-400">
              Type below to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          COMPOSER
      ═══════════════════════════════════════════════════ */}
      <div className="mt-3">
        {closed ? (
          <div className="rounded-2xl bg-ink-100/70 px-4 py-3.5 text-center text-[12.5px] font-bold text-ink-500 ring-1 ring-inset ring-ink-200">
            This conversation is closed
          </div>
        ) : awaitingAdmin ? (
          <div className="flex items-center gap-2.5 rounded-2xl bg-amber-50 px-4 py-3.5 ring-1 ring-inset ring-amber-200/60">
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <p className="text-[12px] font-bold text-amber-800">
              Admin is reviewing — you can reply after their response
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Type your message…"
              disabled={sending}
              className="min-w-0 flex-1 rounded-2xl border-0 bg-white px-4 py-3.5 text-[13.5px] font-semibold text-ink-900 shadow-card outline-none ring-1 ring-inset ring-ink-100/60 transition placeholder:text-ink-300 focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send message"
              className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,.85)] transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
            >
              {sending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22l-4-9-9-4z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Message Bubble
═══════════════════════════════════════════════════════════ */
function Bubble({ message }: { message: ChatMessage }) {
  const isMe = message.senderRole === 'customer';

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[82%] flex-col gap-1">
        {/* Sender label — small, only for admin */}
        {!isMe && (
          <span className="ml-1 text-[10px] font-black uppercase tracking-wider text-brand-700">
            Admin
          </span>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-[13px] font-medium leading-relaxed ${
            isMe
              ? 'rounded-br-sm bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,.5)]'
              : 'rounded-bl-sm bg-ink-100/80 text-ink-900 ring-1 ring-inset ring-ink-200/60'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        </div>

        {/* Timestamp */}
        <span
          className={`text-[10px] font-bold ${
            isMe ? 'mr-1 text-right text-ink-400' : 'ml-1 text-ink-400'
          }`}
        >
          {formatRelative(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
