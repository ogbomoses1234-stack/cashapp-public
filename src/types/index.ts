/* =============================================================
   Domain types — mirrors backend API shapes
============================================================= */

export type Role = 'customer' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  fullName: string | null;
  phoneNumber: string | null;
  deliveryAddress: string | null;
  walletBalance: string;
  pendingBalance: string;
  totalEarned: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  thumbnailUrl: string | null;
  category: string | null;
  stockCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export type PaymentMethod = 'bank_transfer' | 'pod';
export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Flagged' | 'Cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  receiptObjectKey: string | null;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  flagReason?: string | null;
  flaggedAt?: string | null;

}

export type TransactionType =
  | 'cashback_credit'
  | 'withdrawal_debit'
  | 'withdrawal_reversal'
  | 'credit'
  | 'debit';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  reference: string;
  createdAt: string;
}

/**
 * Normalized wallet shape.
 * Every field is guaranteed to exist by the wallet service —
 * pages never have to worry about which name the backend used.
 */
export interface WalletSummary {
  walletBalance: string;
  pendingBalance: string;
  totalEarned: string;
  recentTransactions: Transaction[];
}

export type WithdrawalStatus = 'pending' | 'approved' | 'declined';

export interface WithdrawalRequest {
  id: string;
  amount: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  declineReason: string | null;
  createdAt: string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface SavedPayoutAccount {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface SerialStatus {
  serialNumber: string;
  productId: string;
  status: 'Created' | 'Dispatched' | 'Redeemed' | 'Disputed';
  dispatchedAt: string | null;
  redeemedAt: string | null;
}

export interface ScanRedeemResult {
  credited: string;
  newBalance: string;
  serialNumber: string;
}

export interface ScanDispatchResult {
  serialNumber: string;
  status: 'Dispatched';
  dispatchedAt: string;
}

export type ChatStatus = 'open' | 'awaiting_admin' | 'awaiting_customer' | 'closed';

export interface ChatThread {
  id: string;
  subject: string;
  status: ChatStatus;
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: 'customer' | 'admin' | 'staff';
  body: string;
  attachmentObjectKey: string | null;
  readAt: string | null;
  createdAt: string;
}

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'rejected';

export interface DisputeReport {
  id: string;
  serialNumber: string;
  description: string;
  photoObjectKey: string | null;
  status: DisputeStatus;
  createdAt: string;
}

export interface StaffStockItem {
  serialNumber: string;
  productTitle: string;
  status: 'Dispatched' | 'Redeemed';
  dispatchedAt: string;
  redeemedAt: string | null;
}

export interface StaffStockStats {
  takenToday: number;
  sold: number;
  awaitingSale: number;
  items: StaffStockItem[];
}

/* =============================================================
   API envelope
============================================================= */

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/* =============================================================
   Frontend-only
============================================================= */

export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
