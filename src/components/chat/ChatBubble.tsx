import type { ChatMessage } from '@/types';
import { formatRelative } from '@/utils/format';

interface Props {
  message: ChatMessage;
  /** `true` = green brand bubbles (customer side, right) */
  isMine?: boolean;
}

export function ChatBubble({ message, isMine }: Props) {
  const own = isMine ?? message.senderRole === 'customer';

  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[82%] flex-col gap-1">
        {!own && (
          <span className="ml-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-600">
            Admin
          </span>
        )}

        <div
          className={`
            rounded-xl px-3.5 py-2 text-[13px] font-medium leading-relaxed
            ${
              own
                ? 'rounded-br-sm bg-ink-900 text-white'
                : 'rounded-bl-sm bg-ink-100 text-ink-900 ring-1 ring-inset ring-ink-200/70'
            }
          `}
        >
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        </div>

        <span
          className={`text-[10px] font-medium text-ink-400 ${
            own ? 'mr-1 text-right' : 'ml-1'
          }`}
        >
          {formatRelative(message.createdAt)}
        </span>
      </div>
    </div>
  );
}