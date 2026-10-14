import { forwardRef } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatComposer = forwardRef<HTMLInputElement, Props>(
  function ChatComposer(
    {
      value,
      onChange,
      onSend,
      sending = false,
      disabled = false,
      placeholder = 'Type your message…',
    },
    ref
  ) {
    const canSend = !disabled && !sending && value.trim().length > 0;

    return (
      <div className="flex items-end gap-2">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder={placeholder}
          disabled={sending || disabled}
          className="
            h-11 min-w-0 flex-1 rounded-lg border-0 bg-ink-50 px-3.5
            text-[13.5px] font-medium text-ink-900
            outline-none ring-1 ring-inset ring-ink-200
            transition-colors duration-150
            placeholder:text-ink-400
            focus:bg-white focus:ring-2 focus:ring-brand-500
            disabled:opacity-60
          "
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send message"
          className="
            grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg
            bg-ink-900 text-white
            transition-colors duration-150
            hover:bg-ink-800 active:scale-95
            disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40
          "
        >
          {sending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22l-4-9-9-4z" />
            </svg>
          )}
        </button>
      </div>
    );
  }
);