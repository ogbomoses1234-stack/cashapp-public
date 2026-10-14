export type PackageStatus =
  | 'draft'
  | 'submitted'
  | 'quoted'
  | 'approved'
  | 'in_progress'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PackageEditRequestStatus = 'pending' | 'approved' | 'denied';

export interface PackageItem {
  id: string;
  requestId: string;
  productId: string | null;
  name: string;
  details: string | null;
  quantity: number;
  estimatedPrice: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface PackageMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderRole: 'customer' | 'admin' | 'staff';
  body: string;
  attachmentObjectKey: string | null;
  attachmentUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface PackageEditRequest {
  id: string;
  requestId: string;
  reason: string;
  status: PackageEditRequestStatus;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface PackageRequest {
  id: string;
  reference: string;
  title: string;
  status: PackageStatus;
  isEditable: boolean;
  notes: string | null;
  country: string;
  city: string;
  deliveryAddress: string;
  contactPhone: string;
  quotedTotal: string | null;
  currency: string;
  items: PackageItem[];
  pendingEditRequest: PackageEditRequest | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackageRequestInput {
  title: string;
  notes?: string;
  country: string;
  city: string;
  deliveryAddress: string;
  contactPhone: string;
}

export interface PackageItemInput {
  name: string;
  details?: string;
  quantity: number;
  estimatedPrice?: string;
  imageObjectKey?: string;
}