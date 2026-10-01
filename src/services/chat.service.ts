import { get, post } from './api';
import type { ChatMessage, ChatThread } from '@/types';

type Loose = Record<string, unknown>;

/* ─── Coercion helpers ───────────────────────────────────── */
function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return fallback;
}

/* ─── Normalize a single message ─────────────────────────── */
function normalizeMessage(raw: Loose, index = 0): ChatMessage {
  return {
    id: str(raw.id ?? raw._id ?? `msg-${index}`),
    threadId: str(raw.threadId ?? raw.thread_id ?? raw.chatThreadId ?? ''),
    senderId: str(raw.senderId ?? raw.sender_id ?? raw.userId ?? ''),
    senderRole:
      ((raw.senderRole ?? raw.sender_role ?? raw.role) as ChatMessage['senderRole']) ??
      'customer',
    body: str(raw.body ?? raw.message ?? raw.text ?? raw.content ?? ''),
    attachmentObjectKey:
      (raw.attachmentObjectKey ??
        raw.attachment_object_key ??
        raw.attachmentKey ??
        null) as string | null,
    readAt: (raw.readAt ?? raw.read_at ?? null) as string | null,
    createdAt: str(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

/* ─── Normalize a single thread ──────────────────────────── */
function normalizeThread(raw: Loose): ChatThread {
  return {
    id: str(raw.id ?? raw._id ?? ''),
    subject: str(raw.subject ?? raw.title ?? 'Conversation'),
    status:
      ((raw.status as ChatThread['status']) ??
        'open'),
    lastMessageAt: str(
      raw.lastMessageAt ?? raw.last_message_at ?? raw.updatedAt ?? raw.createdAt ?? new Date().toISOString()
    ),
    createdAt: str(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

/* ─── Extract array from various response shapes ─────────── */
function extractArray(data: unknown, keys: string[]): Loose[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Loose[];
  const obj = data as Loose;
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) return v as Loose[];
  }
  return [];
}

/* ─── Public API ─────────────────────────────────────────── */
export async function listThreads(): Promise<ChatThread[]> {
  const data = await get<unknown>('/api/public/chat/threads');
  return extractArray(data, ['threads', 'items', 'data']).map(normalizeThread);
}

export async function createThread(input: {
  subject: string;
  body: string;
  attachmentKey?: string;
}): Promise<ChatThread> {
  const data = await post<unknown>('/api/public/chat/threads', input);
  const obj = (data ?? {}) as Loose;
  // Sometimes the backend returns { thread: {...} }, sometimes the thread directly
  const raw = (obj.thread ?? obj) as Loose;
  return normalizeThread(raw);
}

export async function listMessages(
  threadId: string
): Promise<{ thread: ChatThread | null; messages: ChatMessage[] }> {
  const data = await get<unknown>(`/api/public/chat/threads/${threadId}/messages`);
  const obj = (data ?? {}) as Loose;

  // Try all the shapes the backend might return
  const rawThread = (obj.thread ?? obj.threadInfo ?? null) as Loose | null;
  const messagesRaw = extractArray(data, ['messages', 'items', 'data']);

  return {
    thread: rawThread ? normalizeThread(rawThread) : null,
    messages: messagesRaw.map(normalizeMessage),
  };
}

export async function sendMessage(
  threadId: string,
  input: { body: string; attachmentKey?: string }
): Promise<ChatMessage> {
  const data = await post<unknown>(
    `/api/public/chat/threads/${threadId}/messages`,
    input
  );
  const obj = (data ?? {}) as Loose;
  const raw = (obj.message ?? obj) as Loose;
  return normalizeMessage(raw);
}
