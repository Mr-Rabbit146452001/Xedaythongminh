import React from 'react';
import type { Metadata, Viewport } from 'next';
import CustomerDeviceShell from '@/components/customer/CustomerDeviceShell';

export const metadata: Metadata = {
  title: 'Smart Cart — Ứng Dụng Khách Hàng (PWA)',
  description: 'Trải nghiệm mua sắm tự động, đồng bộ giỏ hàng và thanh toán không tiền mặt trên xe đẩy thông minh.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerDeviceShell>{children}</CustomerDeviceShell>;
}
