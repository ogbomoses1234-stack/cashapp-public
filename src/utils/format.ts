import { format, formatDistanceToNow } from 'date-fns';

export function formatNaira(amount: string | number): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!isFinite(n)) return '₦0.00';
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatNairaShort(amount: string | number): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!isFinite(n)) return '₦0';
  return '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'dd MMM yyyy');
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'dd MMM yyyy · HH:mm');
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function maskAccountNumber(acct: string): string {
  if (acct.length < 4) return acct;
  return '••••' + acct.slice(-4);
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}
