import { get, post } from './api';
import type { DisputeReport } from '@/types';

export function createDispute(input: {
  serialNumber: string;
  description: string;
  photoObjectKey?: string;
}) {
  return post<DisputeReport>('/api/public/disputes', input);
}

export function listDisputes() {
  return get<DisputeReport[]>('/api/public/disputes');
}
