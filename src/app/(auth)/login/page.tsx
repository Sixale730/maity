// src/app/(auth)/login/page.tsx
import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Iniciar sesión | Maity',
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50">
      <section className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        {/* <h1 className="mb-6 text-center text-2xl font-bold text-black">Inicia sesión</h1> */}
        <LoginForm />
      </section>
    </main>
  );
}
