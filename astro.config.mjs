import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Read .env here too, so PUBLIC_SITE_URL works locally as well as on Vercel.
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// Set PUBLIC_SITE_URL in your environment (see .env.example) once the live domain is known.
const site = process.env.PUBLIC_SITE_URL || env.PUBLIC_SITE_URL || 'https://www.winks-london.example';

export default defineConfig({
  site,
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [sitemap({ filter: (page) => !page.includes('/api/') })],
  devToolbar: { enabled: false },
  server: { host: true, port: 4321, allowedHosts: true },
  vite: { server: { allowedHosts: true } },
});
