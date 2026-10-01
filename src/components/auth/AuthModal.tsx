import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';

export function AuthModal() {
  const { authModalOpen, authModalMessage, closeAuthModal } = useUIStore();
  const navigate = useNavigate();

  return (
    <Modal open={authModalOpen} onClose={closeAuthModal}>
      <div className="text-center">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
          🔐
        </span>
        <h3 className="text-lg font-extrabold tracking-tight text-ink-900">
          Create an account or log in
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-relaxed text-slate-500">
          {authModalMessage ??
            'Unlock instant ₦100 cashback rewards, secure delivery tracking, and fast wallet cashouts.'}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="primary" size="lg" block onClick={() => { closeAuthModal(); navigate('/signup'); }}>
            Create account
          </Button>
          <Button variant="outline" size="lg" block onClick={() => { closeAuthModal(); navigate('/login'); }}>
            Log in
          </Button>
          <button
            onClick={closeAuthModal}
            className="mt-1 text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  );
}
