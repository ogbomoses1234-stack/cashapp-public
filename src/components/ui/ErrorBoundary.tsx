import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
    this.props.onError?.(error, info);
  }

  handleReload = () => window.location.reload();
  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-rose-100 text-3xl">
          💥
        </div>
        <h1 className="mb-2 text-[22px] font-black tracking-[-0.03em] text-ink-900">
          Something went wrong
        </h1>
        <p className="mb-6 max-w-sm text-[13px] font-medium leading-relaxed text-ink-500">
          An unexpected error occurred. Try reloading — if the problem persists, contact support.
        </p>
        {import.meta.env.DEV && this.state.error && (
          <details className="mb-6 w-full max-w-md rounded-xl bg-ink-900 p-4 text-left">
            <summary className="cursor-pointer text-[11.5px] font-black uppercase tracking-wider text-rose-300">
              Error details
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-white/70">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </details>
        )}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 px-5 py-3 text-[13px] font-black text-[#04140d] shadow-[0_8px_20px_-8px_rgba(16,185,129,.85)] transition active:scale-95"
          >
            Reload page
          </button>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-2xl bg-white px-5 py-3 text-[13px] font-black text-ink-900 shadow-[inset_0_0_0_1.5px_rgba(11,16,28,.12)] transition active:scale-95"
          >
            Try again
          </button>
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.28em] text-ink-300">
          vickkyaku.com
        </p>
      </div>
    );
  }
}
