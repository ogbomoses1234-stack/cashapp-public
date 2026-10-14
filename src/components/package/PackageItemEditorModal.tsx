import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { uploadFile } from '@/services/upload.service';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';
import type { PackageItem, PackageItemInput } from '@/types/package';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (input: PackageItemInput) => Promise<void> | void;
  initial?: PackageItem | null;
  saving?: boolean;
}

export function PackageItemEditorModal({
  open,
  onClose,
  onSave,
  initial,
  saving,
}: Props) {
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [imageObjectKey, setImageObjectKey] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? '');
    setDetails(initial?.details ?? '');
    setQuantity(initial?.quantity ?? 1);
    setEstimatedPrice(initial?.estimatedPrice ?? '');
    setImageObjectKey(null);
    setImagePreview(initial?.imageUrl ?? null);
  }, [open, initial]);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5 MB');
    if (!file.type.startsWith('image/')) return toast.error('Only images allowed');
    setUploading(true);
    try {
      const key = await uploadFile({ purpose: 'package', file });
      setImageObjectKey(key);
      setImagePreview(URL.createObjectURL(file));
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageObjectKey(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Give this item a name');
    if (quantity < 1) return toast.error('Quantity must be at least 1');
    await onSave({
      name: name.trim(),
      details: details.trim() || undefined,
      quantity,
      estimatedPrice: estimatedPrice.trim() || undefined,
      imageObjectKey: imageObjectKey ?? undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit item' : 'Add an item'}
    >
      <div className="space-y-4">
        <Input
          label="What do you want?"
          placeholder="e.g. Nivea body lotion"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
            Details (brand, size, colour)
          </span>
          <textarea
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. 500ml green bottle, made in Germany"
            className="
              w-full resize-none rounded-lg border-0 bg-white px-3.5 py-3
              text-[13.5px] font-medium leading-relaxed text-ink-900
              outline-none ring-1 ring-inset ring-ink-200
              transition-colors duration-150
              placeholder:text-ink-400
              focus:ring-2 focus:ring-brand-500
            "
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
              Quantity
            </span>
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="
                h-11 w-full rounded-lg border-0 bg-white px-3.5
                text-[14px] font-semibold tabular-nums text-ink-900
                outline-none ring-1 ring-inset ring-ink-200
                transition-colors duration-150
                focus:ring-2 focus:ring-brand-500
              "
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
              Est. price (₦)
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="Optional"
              className="
                h-11 w-full rounded-lg border-0 bg-white px-3.5
                text-[14px] font-semibold tabular-nums text-ink-900
                outline-none ring-1 ring-inset ring-ink-200
                transition-colors duration-150
                placeholder:font-normal placeholder:text-ink-400
                focus:ring-2 focus:ring-brand-500
              "
            />
          </label>
        </div>

        {/* Image */}
        <div>
          <span className="mb-1.5 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
            Reference photo — optional
          </span>
          {imagePreview ? (
            <div className="relative overflow-hidden rounded-lg ring-1 ring-ink-200">
              <img
                src={imagePreview}
                alt="Reference"
                className="aspect-[4/3] w-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-2 top-2 rounded-md bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-ink-950/85"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="
                flex w-full items-center justify-center gap-2 rounded-lg
                border-2 border-dashed border-ink-200 bg-ink-50/50 px-4 py-5
                text-center transition-colors duration-150
                hover:border-brand-300 hover:bg-brand-50/40
                disabled:opacity-60
              "
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = '';
                }}
              />
              {uploading ? (
                <>
                  <Spinner size={16} tone="dark" />
                  <span className="text-[12.5px] font-semibold text-ink-700">
                    Uploading…
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base">🖼️</span>
                  <span className="text-[12.5px] font-semibold text-ink-700">
                    Attach a photo
                  </span>
                </>
              )}
            </button>
          )}
        </div>

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
            disabled={uploading}
            onClick={handleSave}
          >
            {initial ? 'Save changes' : 'Add item'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}