import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// نام مخزن GitHub Pages — برای محاسبه Base Path
const REPO_NAME = 'homix-astro-showcase';

// در GitHub Pages پروژه‌ای، base باید برابر /repo-name/ باشد.
// برای انتشار روی دامنه اختصاصی، متغیر BASE_PATH=/ تنظیم می‌شود.
const isCustomDomain = process.env.BASE_PATH === '/';
const base = isCustomDomain ? '/' : `/${REPO_NAME}/`;

export default defineConfig({
  site: 'https://rasoolbahadran-stack.github.io',
  base,
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'fa',
        locales: { fa: 'fa-IR' },
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
