import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void> | void;
  saving?: boolean;
}

export function RequestEditModal({ open, onClose, onSubmit, saving }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const canSubmit = reason.trim().length >= 10;

  return (
    <Modal open={open} onClose={onClose} title="Request an edit">
      <div className="space-y-4">
        {/* Heads up banner */}
        <div className="rounded-lg bg-amber-50 p-3.5 ring-1 ring-inset ring-amber-200/70">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-amber-800">
            Heads up
          </p>
          <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-amber-900/90">
            Your list is locked. An admin will review your request and unlock it
            briefly if approved. Let us know why you need to make changes.
          </p>
        </div>

        {/* Reason */}
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
            Reason for edit
          </span>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. I need to change the quantity and swap one item"
            className="
              w-full resize-none rounded-lg border-0 bg-white px-3.5 py-3
              text-[13.5px] font-medium leading-relaxed text-ink-900
              outline-none ring-1 ring-inset ring-ink-200
              transition-colors duration-150
              placeholder:text-ink-400
              focus:ring-2 focus:ring-brand-500
            "
          />
          <span
            className={`mt-1.5 block text-[11.5px] font-medium ${
              canSubmit ? 'text-brand-600' : 'text-ink-400'
            }`}
          >
            {reason.trim().length < 10
              ? 'At least 10 characters'
              : 'Looks good — admin will respond soon'}
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="ghost" size="lg" block onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            block
            loading={saving}
            disabled={!canSubmit}
            onClick={() => onSubmit(reason.trim())}
          >
            Send request
          </Button>
        </div>
      </div>
    </Modal>
  );
}