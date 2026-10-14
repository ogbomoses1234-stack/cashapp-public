import { del, get, patch, post } from './api';
import type {
  PackageEditRequest,
  PackageEditRequestStatus,
  PackageItem,
  PackageItemInput,
  PackageMessage,
  PackageRequest,
  PackageRequestInput,
  PackageStatus,
} from '@/types/package';

type Loose = Record<string, unknown>;

/* ─── Coercion helpers ──────────────────────────────────── */
function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return fallback;
}
function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    if (isFinite(n)) return n;
  }
  return fallback;
}
function bool(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return fallback;
}

/* ─── Normalizers ───────────────────────────────────────── */
function normalizeItem(raw: Loose, index = 0): PackageItem {
  return {
    id: str(raw.id ?? raw._id ?? `item-${index}`),
    requestId: str(raw.requestId ?? raw.request_id ?? raw.packageRequestId ?? ''),
    productId: (raw.productId ?? raw.product_id ?? null) as string | null,
    name: str(raw.name ?? raw.title ?? 'Item'),
    details: (raw.details ?? raw.notes ?? raw.note ?? null) as string | null,
    quantity: num(raw.quantity, 1),
    estimatedPrice: (raw.estimatedPrice ?? raw.estimated_price ?? null) as string | null,
    imageUrl: (raw.imageUrl ?? raw.image_url ?? raw.imageObjectKey ?? null) as string | null,
    createdAt: str(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

function normalizeMessage(raw: Loose, index = 0): PackageMessage {
  return {
    id: str(raw.id ?? raw._id ?? `msg-${index}`),
    requestId: str(raw.requestId ?? raw.request_id ?? ''),
    senderId: str(raw.senderId ?? raw.sender_id ?? ''),
    senderRole:
      ((raw.senderRole ?? raw.sender_role ?? 'customer') as PackageMessage['senderRole']),
    body: str(raw.body ?? raw.message ?? raw.text ?? ''),
    attachmentObjectKey:
      (raw.attachmentObjectKey ?? raw.attachment_object_key ?? null) as string | null,
    attachmentUrl:
      (raw.attachmentUrl ?? raw.attachment_url ?? null) as string | null,
    readAt: (raw.readAt ?? raw.read_at ?? null) as string | null,
    createdAt: str(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

function normalizeEditRequest(raw: Loose): PackageEditRequest {
  return {
    id: str(raw.id ?? ''),
    requestId: str(raw.requestId ?? raw.request_id ?? ''),
    reason: str(raw.reason ?? ''),
    status: ((raw.status as PackageEditRequestStatus) ?? 'pending'),
    adminNote: (raw.adminNote ?? raw.admin_note ?? null) as string | null,
    createdAt: str(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    resolvedAt: (raw.resolvedAt ?? raw.resolved_at ?? null) as string | null,
  };
}

function normalizePackage(raw: Loose): PackageRequest {
  const rawItems = (raw.items ?? raw.packageItems ?? raw.package_items ?? []) as unknown;
  const items = Array.isArray(rawItems)
    ? (rawItems as Loose[]).map((r, i) => normalizeItem(r, i))
    : [];

  const rawEdit = (raw.pendingEditRequest ?? raw.pending_edit_request ?? null) as
    | Loose
    | null;
  const pendingEditRequest = rawEdit ? normalizeEditRequest(rawEdit) : null;

  return {
    id: str(raw.id ?? raw._id ?? ''),
    reference: str(raw.reference ?? raw.code ?? raw.requestNumber ?? '—'),
    title: str(raw.title ?? raw.subject ?? 'Untitled list'),
    status: ((raw.status as PackageStatus) ?? 'draft'),
    isEditable: bool(raw.isEditable ?? raw.is_editable, false),
    notes: (raw.notes ?? raw.note ?? null) as string | null,
    country: str(raw.country ?? ''),
    city: str(raw.city ?? ''),
    deliveryAddress: str(raw.deliveryAddress ?? raw.delivery_address ?? ''),
    contactPhone: str(raw.contactPhone ?? raw.contact_phone ?? ''),
    quotedTotal: (raw.quotedTotal ?? raw.quoted_total ?? null) as string | null,
    currency: str(raw.currency ?? 'NGN'),
    items,
    pendingEditRequest,
    lastMessageAt: (raw.lastMessageAt ?? raw.last_message_at ?? null) as string | null,
    createdAt: str(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    updatedAt: str(raw.updatedAt ?? raw.updated_at ?? new Date().toISOString()),
  };
}

function extractArray(data: unknown): Loose[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Loose[];
  const obj = data as Loose;
  for (const k of ['packages', 'items', 'requests', 'messages', 'data']) {
    const v = obj[k];
    if (Array.isArray(v)) return v as Loose[];
  }
  return [];
}

function unwrapPackage(data: unknown): PackageRequest | null {
  if (!data) return null;
  const obj = (data as Loose).package ?? data;
  return normalizePackage(obj as Loose);
}

function unwrapItem(data: unknown): PackageItem | null {
  if (!data) return null;
  const obj = (data as Loose).item ?? data;
  return normalizeItem(obj as Loose);
}

function unwrapMessage(data: unknown): PackageMessage | null {
  if (!data) return null;
  const obj = (data as Loose).message ?? data;
  return normalizeMessage(obj as Loose);
}

/* ═══════════════════════════════════════════════════════════
   Package requests
═══════════════════════════════════════════════════════════ */
export async function listMyPackages(): Promise<PackageRequest[]> {
  const data = await get<unknown>('/api/public/packages');
  return extractArray(data).map((r) => normalizePackage(r));
}

export async function getPackage(id: string): Promise<PackageRequest | null> {
  const data = await get<unknown>(`/api/public/packages/${id}`);
  return unwrapPackage(data);
}

export async function createPackage(
  input: PackageRequestInput
): Promise<PackageRequest | null> {
  const data = await post<unknown>('/api/public/packages', input);
  return unwrapPackage(data);
}

export async function updatePackage(
  id: string,
  input: Partial<PackageRequestInput>
): Promise<PackageRequest | null> {
  const data = await patch<unknown>(`/api/public/packages/${id}`, input);
  return unwrapPackage(data);
}

export async function deletePackage(id: string): Promise<void> {
  await del<unknown>(`/api/public/packages/${id}`);
}

export async function submitPackage(id: string): Promise<PackageRequest | null> {
  const data = await post<unknown>(`/api/public/packages/${id}/submit`);
  return unwrapPackage(data);
}

export async function requestPackageEdit(
  id: string,
  reason: string
): Promise<PackageEditRequest | null> {
  const data = await post<unknown>(`/api/public/packages/${id}/request-edit`, {
    reason,
  });
  if (!data) return null;
  const obj =
    (data as Loose).editRequest ?? (data as Loose).edit_request ?? data;
  return normalizeEditRequest(obj as Loose);
}

/* ═══════════════════════════════════════════════════════════
   Items
═══════════════════════════════════════════════════════════ */
export async function addPackageItem(
  requestId: string,
  input: PackageItemInput
): Promise<PackageItem | null> {
  const data = await post<unknown>(
    `/api/public/packages/${requestId}/items`,
    input
  );
  return unwrapItem(data);
}

export async function updatePackageItem(
  requestId: string,
  itemId: string,
  input: Partial<PackageItemInput>
): Promise<PackageItem | null> {
  const data = await patch<unknown>(
    `/api/public/packages/${requestId}/items/${itemId}`,
    input
  );
  return unwrapItem(data);
}

export async function removePackageItem(
  requestId: string,
  itemId: string
): Promise<void> {
  await del<unknown>(`/api/public/packages/${requestId}/items/${itemId}`);
}

/* ═══════════════════════════════════════════════════════════
   Messages
═══════════════════════════════════════════════════════════ */
export async function listPackageMessages(
  requestId: string
): Promise<PackageMessage[]> {
  const data = await get<unknown>(
    `/api/public/packages/${requestId}/messages`
  );
  return extractArray(data).map((r, i) => normalizeMessage(r, i));
}

export async function sendPackageMessage(
  requestId: string,
  body: string,
  attachmentKey?: string
): Promise<PackageMessage | null> {
  const data = await post<unknown>(
    `/api/public/packages/${requestId}/messages`,
    { body, attachmentKey }
  );
  return unwrapMessage(data);
}