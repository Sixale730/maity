'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get('next') ?? '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function validateEmail(value: string) {
    if (!value) return 'El correo es obligatorio.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'El formato del correo no es válido.';
    return '';
  }

  function validatePassword(value: string) {
    if (!value) return 'La contraseña es obligatoria.';
    if (value.length < 6) return 'Debe tener al menos 6 caracteres.';
    return '';
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passErr);

    if (emailErr || passErr) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      setLoading(false);
      if (res.ok) router.push(nextPath);
      else setError('Credenciales incorrectas');
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
 <h1 className="mb-6 text-center text-3xl font-extrabold text-maity tracking-widest leading-none">
  Maity
</h1>




      {/* Email */}
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Correo</span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(validateEmail(e.target.value));
          }}
          onBlur={() => setEmailError(validateEmail(email))}
          placeholder="you@example.com"
          className={`peer w-full rounded-xl border px-3 py-2 bg-white/70 text-gray-900 outline-none transition
            ${emailError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-maity focus:ring-maity/50 focus:ring-2'}
          `}
        />
        {emailError && (
          <p className="mt-1 text-sm text-red-600">{emailError}</p>
        )}
      </label>

      {/* Password */}
      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium text-gray-700">Contraseña</span>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(validatePassword(e.target.value));
            }}
            onBlur={() => setPasswordError(validatePassword(password))}
            placeholder="••••••••"
            className={`peer w-full rounded-xl border pr-10 px-3 py-2 bg-white/70 text-gray-900 outline-none transition
              ${passwordError ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-maity focus:ring-maity/50 focus:ring-2'}
            `}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-maity"
            aria-label="Mostrar u ocultar contraseña"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {passwordError && (
          <p className="mt-1 text-sm text-red-600">{passwordError}</p>
        )}
      </label>

      {/* Error general */}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group relative mt-6 flex w-full items-center justify-center gap-2
                   rounded-xl bg-maity px-4 py-2 font-semibold text-white
                   ring-maity transition hover:bg-maityDark
                   disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        <span>{loading ? 'Entrando…' : 'Entrar'}</span>
      </button>

      {/* Sign up */}
      <p className="mt-8 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <a
          href="/signup"
          className="font-semibold text-maityDark underline-offset-2 transition hover:underline"
        >
          Regístrate
        </a>
      </p>
    </form>
  );
}