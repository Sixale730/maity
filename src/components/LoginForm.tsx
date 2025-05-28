'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();          
  const nextPath = search.get('next') ?? '/dashboard';

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const body = {
      email:    (form.elements.namedItem('email')    as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',              
        body: JSON.stringify(body),
      });

      setLoading(false);
      if (res.ok) router.push(nextPath);
      else        setError('Credenciales incorrectas');
    } catch {
      setLoading(false);
      setError('Error de red, intenta de nuevo');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur-md"
    >
      <h1 className="mb-6 text-center text-3xl font-extrabold text-gray-800">
        Inicia sesión
      </h1>

      {/* E-mail */}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Correo</span>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          className="peer w-full rounded-xl border border-gray-300 bg-white/60 px-3 py-2
                     text-gray-900 outline-none transition
                     focus:border-maity focus:ring-4 focus:ring-maity/30
                     invalid:border-red-400 invalid:focus:ring-red-200"
          required
        />
      </label>

      {/* Contraseña */}
      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Contraseña</span>
        <input
          type="password"
          name="password"
          className="peer w-full rounded-xl border border-gray-300 bg-white/60 px-3 py-2
                     text-gray-900 outline-none transition
                     focus:border-maity focus:ring-4 focus:ring-maity/30
                     invalid:border-red-400 invalid:focus:ring-red-200"
          required
        />
      </label>

      {/* Error */}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={loading}
        className="group relative mt-6 flex w-full items-center justify-center gap-2
                   rounded-xl bg-maity px-4 py-2 font-semibold text-gray-900
                   ring-maity transition hover:bg-maityDark
                   disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        <span>{loading ? 'Entrando…' : 'Entrar'}</span>
      </button>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <a href="/signup"
           className="font-semibold text-maityDark underline-offset-2 transition hover:underline">
          Regístrate
        </a>
      </p>
    </form>
  );
}
