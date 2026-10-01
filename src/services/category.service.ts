import { get } from './api';

export interface Category {
  name: string;
  slug: string;
  count: number;
  imageUrl: string | null;
}

export async function listCategories(): Promise<Category[]> {
  const data = await get<Category[] | null>('/api/public/categories');
  const arr = Array.isArray(data) ? data : [];
  return arr.filter((c) => c.name && c.slug);
}
