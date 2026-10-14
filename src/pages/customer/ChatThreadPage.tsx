import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listMessages, sendMessage } from '@/services/chat.service';
import type { ChatMessage, ChatThread } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatComposer } from '@/components/chat/ChatComposer';
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

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!loading && thread?.status !== 'closed') {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [loading, thread?.status]);

  const awaitingAdmin = thread?.status === 'awaiting_admin';
  const closed = thread?.status === 'closed';
  const canSend = !awaitingAdmin && !closed && text.trim().length > 0 && !sending;

  const submit = async () => {
    if (!id || !canSend) return;
    setSending(true);
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
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? real : m)));
      if (thread) setThread({ ...thread, status: 'awaiting_admin' });
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(body);
      toast.error((e as ApiClientError).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col lg:h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold tracking-[-0.02em] text-ink-900">
            {thread?.subject ?? 'Conversation'}
          </h1>
          <p className="mt-0.5 text-[11.5px] font-medium text-ink-400">
            {awaitingAdmin && 'Waiting for admin reply'}
            {thread?.status === 'awaiting_customer' && 'Admin is waiting for you'}
            {closed && 'This thread is closed'}
            {thread?.status === 'open' && 'Open'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-white ring-1 ring-ink-200/70">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size={22} tone="brand" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-xl">
              💬
            </span>
            <p className="mt-3 text-[13px] font-semibold text-ink-900">No messages yet</p>
            <p className="mt-1 max-w-[240px] text-[11.5px] font-medium leading-relaxed text-ink-400">
              Type below to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="mt-3">
        {closed ? (
          <div className="rounded-xl bg-ink-100/70 px-4 py-3.5 text-center text-[12.5px] font-semibold text-ink-500 ring-1 ring-inset ring-ink-200">
            This conversation is closed
          </div>
        ) : awaitingAdmin ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 px-4 py-3.5 ring-1 ring-inset ring-amber-200">
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <p className="text-[12px] font-medium text-amber-800">
              Admin is reviewing — you can reply after their response
            </p>
          </div>
        ) : (
          <ChatComposer
            ref={inputRef}
            value={text}
            onChange={setText}
            onSend={submit}
            sending={sending}
          />
        )}
      </div>
    </div>
  );
}