import { ReactNode, useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm:max-w-md',
}: Props) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-950/50 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`
          w-full ${maxWidth}
          animate-fade-up
          rounded-t-2xl bg-white ring-1 ring-ink-200
          shadow-lg shadow-ink-950/10
          sm:rounded-xl
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-ink-200" />
        </div>

        {title && (
          <div className="border-b border-ink-100 px-5 pb-4 pt-4 sm:pt-5">
            <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-ink-900">
              {title}
            </h3>
          </div>
        )}

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}