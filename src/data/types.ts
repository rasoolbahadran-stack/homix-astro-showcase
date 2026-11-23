// انواع داده‌ای مشترک فروشگاه هومیکس

export interface Brand {
  id: string;
  slug: string;
  name: string;
  monogram: string; // حروف اختصاری برای لوگوی متنی
  color: string; // رنگ لهجه برند
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  icon: string; // نام آیکون SVG
  image: string;
  blurb: string;
  order: number;
}

export interface Spec {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  categorySlug: string;
  price: number; // تومان
  oldPrice?: number;
  images: string[];
  rating: number; // 0-5
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  badge?: 'new' | 'bestseller' | 'special';
  colors?: string[];
  warranty: string;
  shortDesc: string;
  description: string;
  features: string[];
  specs: Spec[];
  tags: string[];
  createdAt: string; // ISO برای مرتب‌سازی جدیدترین
  soldCount: number; // برای پرفروش
}

export interface CartLine {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  qty: number;
  maxQty: number;
}
