import Sidebar from "@/components/Sidebar";

export default function UsuariosLayout({ children,}: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
        <Sidebar/>
      <section className="flex-1 overflow-y-auto">{children}</section>
    </div>
  );
}
