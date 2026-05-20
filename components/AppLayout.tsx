'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isLoginPage && <Sidebar />}
      <main
        style={{
          flex: 1,
          marginLeft: isLoginPage ? 0 : 240,
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          transition: 'margin-left 0.2s ease',
        }}
      >
        {children}
      </main>
    </div>
  );
}
