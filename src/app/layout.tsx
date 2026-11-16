import type { Metadata, Viewport } from 'next';
import { StoreProvider } from '@/lib/store';
import RegistrarSW from '@/components/RegistrarSW';
import './globals.css';

export const metadata: Metadata = {
  title: 'Posgrado FISI · Admisión',
  description: 'Solicita información de las maestrías y doctorados de la Unidad de Posgrado FISI y sigue tu proceso de admisión.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B2A41',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>{children}</StoreProvider>
        <RegistrarSW />
      </body>
    </html>
  );
}
