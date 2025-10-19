// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  i18n: {
    locales: ["de", "en", "fr", "it"],
    defaultLocale: "en",
    routing: {
      // Default = false → URLs in default locale have no /en prefix.
      // /about, /fr/about, /de/about
      prefixDefaultLocale: false,
    }
  },
  site: 'https://omgawroo98.github.io',
  base: '/',
});