import { useEffect, useState } from 'react';
import { getFingerprint } from '@/utils/fingerprint';

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    getFingerprint().then(setFingerprint).catch(() => {});
  }, []);

  return fingerprint;
}
