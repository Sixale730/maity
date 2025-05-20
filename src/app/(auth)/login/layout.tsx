// src/app/(auth)/login/layout.tsx
import type { ReactNode } from 'react';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <section className="grid min-h-screen place-items-center bg-gray-50">
      {children}
    </section>
  );
}
