import { ReactNode } from 'react';

export function ScannerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-ink-900 text-white">
      {children}
    </div>
  );
}
