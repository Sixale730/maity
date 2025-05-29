// src/app/page.tsx
export const metadata = {
  title: 'Maity | Potenciando talento humano',
  description: 'Descubre cómo Maity une IA y gamificación para desarrollar habilidades extraordinarias.',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a Maity 🚀</h1>
      <p className="text-lg text-center max-w-xl">
        Potenciamos habilidades humanas con IA y experiencias gamificadas.
      </p>
    </main>
  );
}
