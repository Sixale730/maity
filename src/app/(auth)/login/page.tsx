import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Iniciar sesión | Maity',
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50">
      <section className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <LoginForm />
      </section>
    </main>
  );
}
