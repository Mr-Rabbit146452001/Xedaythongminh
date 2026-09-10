import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'SMART CART — Retail Intelligence & Customer App',
  description: 'Hệ thống Quản trị Bán lẻ Thông minh & Trải nghiệm Mua sắm Khách hàng Smart Cart',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
