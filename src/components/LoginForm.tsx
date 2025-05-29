'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Shield, Mail } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get('next') ?? '/dashboard';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const body = {
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push(nextPath);
      } else {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      }
    } catch {
      setError('Error de red o del servidor. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm mb-12 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/10 backdrop-blur-lg"
    >
      {/* Logo */}
      <div className="mb-8 text-center">
        <a href="/" className="inline-block text-4xl font-extrabold text-gray-300">
          Maity
        </a>
      </div>

      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">Inicia sesión</h1>

      {/* Email */}
      <label htmlFor="email" className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-700">Correo Electrónico</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="email"
            type="email"
            name="email"
            placeholder="tu@correo.com"
            className="peer w-full rounded-xl border border-gray-300 bg-white/70 px-3.5 py-2.5 pl-10 text-gray-900 outline-none transition focus:border-maity focus:ring-4 focus:ring-maity/30 invalid:border-red-400 invalid:text-red-600 invalid:focus:ring-red-200"
            required
          />
        </div>
      </label>

      {/* Password */}
      <label htmlFor="password" className="mt-5 block">
        <span className="mb-1.5 block text-sm font-medium text-gray-700">Contraseña</span>
        <div className="relative">
          <Shield className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            className="peer w-full rounded-xl border border-gray-300 bg-white/70 px-3.5 py-2.5 pl-10 text-gray-900 outline-none transition focus:border-maity focus:ring-4 focus:ring-maity/30 invalid:border-red-400 invalid:text-red-600 invalid:focus:ring-red-200"
            required
          />
        </div>
      </label>

      {/* Extra options */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 text-sm">
        <label htmlFor="remember-me" className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            id="remember-me"
            name="remember-me"
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-maity focus:ring-maity/50"
          />
          <span className="text-gray-700">Recuérdame</span>
        </label>
        <a
          href="#"
          className="text-gray-500 hover:text-maityDark transition underline underline-offset-2"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-5 rounded-lg bg-red-100 px-3.5 py-2.5 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
  type="submit"
  disabled={loading}
  className="group relative mt-8 flex w-full items-center justify-center gap-2.5 rounded-full bg-maity px-6 py-3 font-semibold text-white transition hover:bg-maityDark focus:outline-none focus:ring-4 focus:ring-maity/40 disabled:cursor-not-allowed disabled:opacity-70"
>
  {loading && <Loader2 className="h-5 w-5 animate-spin" />}
  <span>{loading ? 'Entrando…' : 'Entrar'}</span>
</button>

      {/* Sign up */}
      <p className="mt-8 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <a
          href="/signup"
          className="font-semibold text-maityDark underline-offset-2 transition hover:underline focus:outline-none focus:ring-1 focus:ring-maity focus:ring-offset-1"
        >
          Regístrate
        </a>
      </p>
    </form>
  );
}
