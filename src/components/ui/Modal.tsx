import { ReactNode, useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: Props) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} animate-fade-up rounded-3xl bg-white p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="mb-4 text-lg font-extrabold tracking-tight text-ink-900">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
