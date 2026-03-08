'use client';

import DynamicLayout from './DynamicLayout';

export default function ClientRouteLayout({ children }: { children: React.ReactNode }) {
  return <DynamicLayout>{children}</DynamicLayout>;
}
