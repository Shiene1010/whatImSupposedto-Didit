// src/app/layout.tsx
import { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: '작게, 해냄 — 오늘 한 번의 실행',
  description: '완벽한 계획보다 작은 시도에 집중하고, 오늘 해낸 순간을 발견해요.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
