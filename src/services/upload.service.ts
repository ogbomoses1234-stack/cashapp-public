import axios from 'axios';
import { post } from './api';

export type UploadPurpose = 'receipt' | 'dispute' | 'chat' | 'avatar';

interface PresignResponse {
  uploadUrl: string;
  objectKey: string;
  bucket: string;
  expiresIn: number;
}

export interface UploadFileInput {
  purpose: UploadPurpose;
  file: File;
  scope?: Record<string, string>;
  onProgress?: (pct: number) => void;
}

export async function uploadFile({ purpose, file, scope, onProgress }: UploadFileInput): Promise<string> {
  // 1. Presign
  const presign = await post<PresignResponse>('/api/public/uploads/presign', {
    purpose,
    mimeType: file.type,
    sizeBytes: file.size,
    scope,
  });

  // 2. Direct PUT to RustFS / MinIO
  await axios.put(presign.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  // 3. Commit
  await post<{ objectKey: string; committed: true }>('/api/public/uploads/commit', {
    objectKey: presign.objectKey,
  });

  return presign.objectKey;
}

export function getSignedUrl(objectKey: string, longLived = false) {
  return post<{ url: string }>(
    `/api/public/uploads/${encodeURIComponent(objectKey)}/signed${longLived ? '?longLived=true' : ''}`
  );
}
