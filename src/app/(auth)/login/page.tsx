import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Iniciar Sesión | Maity',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
  <LoginForm />
</main>

  );
}
