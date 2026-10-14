import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listThreads, createThread } from '@/services/chat.service';
import type { ChatThread } from '@/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatRelative } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

const STATUS_META: Record<ChatThread['status'], { label: string; tone: string }> = {
  open: { label: 'Open', tone: 'bg-sky-50 text-sky-700 ring-sky-200' },
  awaiting_admin: { label: 'Awaiting reply', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  awaiting_customer: { label: 'Needs reply', tone: 'bg-brand-50 text-brand-700 ring-brand-200' },
  closed: { label: 'Closed', tone: 'bg-ink-100 text-ink-500 ring-ink-200' },
};

export default function ChatPage() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    listThreads()
      .then((list) => setThreads(Array.isArray(list) ? list : []))
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!subject.trim() || body.trim().length < 5) {
      toast.error('Enter a subject and a message');
      return;
    }
    setSubmitting(true);
    try {
      const t = await createThread({ subject: subject.trim(), body: body.trim() });
      setSubject('');
      setBody('');
      setComposerOpen(false);
      if (t?.id) navigate(`/chat/${t.id}`);
      else load();
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-2">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">
            Chat with admin
          </h1>
          <p className="mt-1 text-[12.5px] font-medium text-ink-400">
            Get help with orders, payments, or anything else
          </p>
        </div>
        {threads.length > 0 && !composerOpen && (
          <button
            onClick={() => setComposerOpen(true)}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-ink-800 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </button>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-6">
        {/* ─── LEFT: thread list ────────────────────── */}
        <div>
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size={24} tone="brand" />
            </div>
          ) : threads.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center ring-1 ring-ink-200/70">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-xl">
                💬
              </span>
              <p className="text-[13px] font-semibold text-ink-900">No conversations yet</p>
              <p className="mt-1 text-[11.5px] font-medium text-ink-400">
                Start a new one to chat with our team
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {threads.map((t) => (
                <ThreadRow key={t.id} thread={t} />
              ))}
            </div>
          )}
        </div>

        {/* ─── RIGHT: new thread composer ───────────── */}
        <aside className="mt-5 lg:mt-0">
          <div className="sticky top-20">
            {(composerOpen || threads.length === 0) && !loading && (
              <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
                <div className="flex items-center gap-2.5 border-b border-ink-100 bg-brand-50/40 px-4 py-3">
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold tracking-tight text-ink-900">
                      {threads.length === 0 ? 'Start a conversation' : 'New conversation'}
                    </p>
                    <p className="text-[11px] font-medium text-ink-400">
                      Typically replies in a few hours
                    </p>
                  </div>
                  {threads.length > 0 && (
                    <button
                      onClick={() => { setComposerOpen(false); setSubject(''); setBody(''); }}
                      className="ml-auto grid h-7 w-7 place-items-center rounded-md text-ink-400 transition-colors hover:bg-white/60 hover:text-ink-700"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                      Subject
                    </span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Order #QR-2175624909 was flagged"
                      disabled={submitting}
                      className="h-11 w-full rounded-lg border-0 bg-ink-50/70 px-3.5 text-[13px] font-medium text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                      Message
                    </span>
                    <textarea
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Describe the issue…"
                      disabled={submitting}
                      className="w-full resize-none rounded-lg border-0 bg-ink-50/70 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                    />
                  </label>

                  <Button
                    variant="brand"
                    size="lg"
                    block
                    onClick={submit}
                    loading={submitting}
                    disabled={!subject.trim() || body.trim().length < 5}
                  >
                    Start conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ThreadRow({ thread }: { thread: ChatThread }) {
  const meta = STATUS_META[thread.status] ?? STATUS_META.open;
  const isAwaitingCustomer = thread.status === 'awaiting_customer';

  return (
    <Link
      to={`/chat/${thread.id}`}
      className="group block overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300 active:scale-[.99]"
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg ring-1 ring-inset ${
            isAwaitingCustomer
              ? 'bg-brand-50 text-brand-600 ring-brand-200'
              : 'bg-ink-100/70 text-ink-500 ring-ink-200/70'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-[13px] font-semibold tracking-[-0.005em] text-ink-900">
              {thread.subject}
            </p>
            <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ring-1 ring-inset ${meta.tone}`}>
              {meta.label}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-[11.5px] font-medium text-ink-400">
            {isAwaitingCustomer ? 'Reply needed from you' : 'Waiting for admin reply'}
          </p>
          <p className="mt-1.5 text-[10.5px] font-medium text-ink-400">
            {formatRelative(thread.lastMessageAt)}
          </p>
        </div>

        <svg viewBox="0 0 24 24" className="mt-1 h-4 w-4 flex-shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}