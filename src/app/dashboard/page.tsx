// src/app/dashboard/page.tsx

export const metadata = {
  title: 'Dashboard | Maity',
};

export default function Prueba() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <section className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-bold text-maityDark">
          ¡Autenticación exitosa! 🎉
        </h1>
        <p className="text-center text-gray-700">
          Construye aquí tu panel principal.
        </p>
      </section>
    </main>
  );
}
