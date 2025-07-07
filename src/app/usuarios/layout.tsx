import Sidebar from "@/components/Sidebar";

export default function UsuariosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Contenido desplazable, con margen a la izquierda para el sidebar */}
      <section className="ml-64 flex-1 overflow-y-auto p-6">
        {children}
      </section>
    </div>
  );
}
