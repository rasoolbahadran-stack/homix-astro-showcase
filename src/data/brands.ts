import type { Brand } from './types';

export const brands: Brand[] = [
  { id: 'samsung', slug: 'samsung', name: 'سامسونگ', monogram: 'SA', color: '#1428a0' },
  { id: 'lg', slug: 'lg', name: 'ال‌جی', monogram: 'LG', color: '#a50034' },
  { id: 'bosch', slug: 'bosch', name: 'بوش', monogram: 'BO', color: '#ed000c' },
  { id: 'siemens', slug: 'siemens', name: 'زیمنس', monogram: 'SI', color: '#009999' },
  { id: 'beko', slug: 'beko', name: 'بکو', monogram: 'BE', color: '#e01a2b' },
  { id: 'snowa', slug: 'snowa', name: 'اسنوا', monogram: 'SN', color: '#0a6cff' },
  { id: 'panasonic', slug: 'panasonic', name: 'پاناسونیک', monogram: 'PA', color: '#0055a5' },
  { id: 'electrolux', slug: 'electrolux', name: 'الکترولوکس', monogram: 'EL', color: '#1a1a1a' },
  { id: 'gorenje', slug: 'gorenje', name: 'گورنژه', monogram: 'GO', color: '#d12c2c' },
  { id: 'hitachi', slug: 'hitachi', name: 'هیتاچی', monogram: 'HI', color: '#e60012' },
  { id: 'philips', slug: 'philips', name: 'فیلیپس', monogram: 'PH', color: '#0e8a3e' },
  { id: 'delonghi', slug: 'delonghi', name: 'دلونگی', monogram: 'DE', color: '#b91d1d' },
];

export const brandById = (id: string): Brand | undefined =>
  brands.find((b) => b.id === id);
