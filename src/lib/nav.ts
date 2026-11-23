// کمک‌تابع مسیرها — پیشوند Base Path برای GitHub Pages را اضافه می‌کند.
export const BASE = import.meta.env.BASE_URL || '/';

export function href(path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const p = path.startsWith('/') ? path.slice(1) : path;
  // جلوگیری از اسلش مضاعف
  const b = BASE.endsWith('/') ? BASE : BASE + '/';
  return `${b}${p}`;
}
