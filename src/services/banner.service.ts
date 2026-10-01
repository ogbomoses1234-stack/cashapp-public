import { get } from './api';

export interface Banner {
  id: string;
  imageUrl: string;
  headline: string;
  subtext: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
}

export async function listBanners(): Promise<Banner[]> {
  const data = await get<Banner[] | null>('/api/public/banners');
  const arr = Array.isArray(data) ? data : [];
  // Filter out any half-configured banners
  return arr.filter((b) => b.imageUrl && b.headline);
}
