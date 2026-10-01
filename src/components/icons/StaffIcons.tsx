import type { SVGProps } from 'react';

/* ═══════════════════════════════════════════════════════════
   Base props for every icon — 20px, stroke 2, currentColor
═══════════════════════════════════════════════════════════ */
type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function Base({
  size = 20,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION / CORE
═══════════════════════════════════════════════════════════ */

/** Storefront / Terminal */
export function StoreIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 8h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z" />
      <path d="M4 8 7 4h10l3 4" />
      <path d="M9 12h6" />
    </Base>
  );
}

/** Clipboard / Stock list */
export function ClipboardIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </Base>
  );
}

/** QR Code / Scan */
export function ScanIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M3 12h18" />
    </Base>
  );
}

/** Package / Item */
export function PackageIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M16.5 9.4 7.5 4.2" />
      <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.3 7 12 12 20.7 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </Base>
  );
}

/** User / Profile */
export function UserIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </Base>
  );
}

/** Lock / Password */
export function LockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Base>
  );
}

/** Log out */
export function LogOutIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Base>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATUS
═══════════════════════════════════════════════════════════ */

/** Checkmark */
export function CheckIcon(props: IconProps) {
  return (
    <Base strokeWidth={2.6} {...props}>
      <polyline points="4 12 10 18 20 6" />
    </Base>
  );
}

/** Warning triangle */
export function WarningIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Base>
  );
}

/** Blocked / denied */
export function BlockedIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </Base>
  );
}

/** Clock */
export function ClockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Base>
  );
}

/** Info circle */
export function InfoIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </Base>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACTIONS
═══════════════════════════════════════════════════════════ */

/** Chevron right */
export function ChevronRightIcon(props: IconProps) {
  return (
    <Base strokeWidth={2.4} {...props}>
      <polyline points="9 6 15 12 9 18" />
    </Base>
  );
}

/** Arrow left (back) */
export function ArrowLeftIcon(props: IconProps) {
  return (
    <Base strokeWidth={2.4} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Base>
  );
}

/** Refresh */
export function RefreshIcon(props: IconProps) {
  return (
    <Base strokeWidth={2.2} {...props}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <polyline points="21 3 21 9 15 9" />
    </Base>
  );
}

/** Search */
export function SearchIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Base>
  );
}

/** Close */
export function CloseIcon(props: IconProps) {
  return (
    <Base strokeWidth={2.4} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Base>
  );
}

/** Plus */
export function PlusIcon(props: IconProps) {
  return (
    <Base strokeWidth={2.8} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Base>
  );
}

/** Flash / torch */
export function FlashIcon(props: IconProps) {
  return (
    <Base {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Base>
  );
}

/** Camera */
export function CameraIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </Base>
  );
}

/* ═══════════════════════════════════════════════════════════
   BRAND / MISC
═══════════════════════════════════════════════════════════ */

/** Bell (notifications) */
export function BellIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Base>
  );
}

/** Mail */
export function MailIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </Base>
  );
}

/** Phone */
export function PhoneIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </Base>
  );
}

/** Shield */
export function ShieldIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Base>
  );
}

/** Sparkles (success) */
export function SparklesIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </Base>
  );
}
