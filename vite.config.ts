import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import cv from './content/cv.json';

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function teamText(value: string): string {
  if (value.trim() === '3') return 'ثلاثة موظفين';
  const number = Number.parseInt(value, 10) || 0;
  return value.includes('+') ? `أكثر من ${number} موظف` : `${number} موظفين`;
}

const title = 'TITAN STARK AI | مساعدك الشخصي للهندسة والأتمتة';
const description = `TITAN STARK AI مساعد شخصي لإنشاء المواقع والأوامر الصوتية والأتمتة، من TITAN Digital التي تضم ${teamText(cv.profile.employeeCount)} بقيادة المهندس ${cv.profile.owner}.`;
const ogDescription = 'مساعد شخصي بأدوات حقيقية: إنشاء ومعاينة وتنزيل المواقع، أوامر Android اختيارية، وأصوات متاحة للمعاينة. النماذج السحابية تحتاج إعدادًا ولا ندّعي عملها دون اتصال.';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'titan-canonical-metadata',
      transformIndexHtml: {
        order: 'pre',
        handler(html, context) {
          if (context.filename.endsWith('admin.html')) return html;
          return html
            .replaceAll('__TITAN_TITLE__', escapeAttribute(title))
            .replaceAll('__TITAN_DESCRIPTION__', escapeAttribute(description))
            .replaceAll('__TITAN_OG_DESCRIPTION__', escapeAttribute(ogDescription));
        },
      },
    },
  ],
  base: './',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'react-vendor';
        },
      },
    },
  },
});
