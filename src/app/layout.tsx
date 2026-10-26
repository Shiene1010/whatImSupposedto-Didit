// src/app/layout.tsx
import { ReactNode } from 'react';

export const metadata = {
  title: 'whatImSupposedto-Didit',
  description: '완벽주의 타격을 위한 철벽 가드레일 웹서비스',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#fafafa' }}>
        {children}
      </body>
    </html>
  );
}
