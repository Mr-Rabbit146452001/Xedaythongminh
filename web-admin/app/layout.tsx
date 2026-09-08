import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export const metadata: Metadata = {
  title: 'SMART CART — Retail Intelligence Admin',
  description: 'Hệ thống Quản trị Bán lẻ Thông minh & Giám sát IoT Smart Cart',
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
      <body suppressHydrationWarning className="bg-background text-on-surface antialiased min-h-screen">
        <div className="flex">
          {/* Fixed Left Navigation */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="ml-sidebar-width flex-1 flex flex-col min-w-0 min-h-screen">
            <Topbar />
            <main className="mt-topbar-height p-gutter-md flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
