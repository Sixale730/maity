import type { ReactNode } from 'react';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    // 'main' es semánticamente mejor aquí. 'min-h-screen' asegura que ocupe toda la altura.
    // 'p-4' añade un poco de padding para que la tarjeta no toque los bordes en pantallas muy pequeñas.
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
      {children}
    </main>
  );
}