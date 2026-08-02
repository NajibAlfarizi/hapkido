import type { Metadata, Viewport } from 'next';
import './globals.css';
import LayoutShell from '@/components/layout/LayoutShell';

export const metadata: Metadata = {
  title: 'Sistem Informasi Dojang Hapkido',
  description: 'Aplikasi Manajemen, Presensi QR Code, Iuran & Operasional Dojang Beladiri Hapkido',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#E63946',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased selection:bg-hapkido-red selection:text-white">
        <LayoutShell>{children}</LayoutShell>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
