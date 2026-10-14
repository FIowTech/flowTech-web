import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="w-full min-h-dvh flex flex-col sm:flex-row gap-2">
      {/* Sidebar */}
      <aside className="bg-primary/20 h-dvh py-6 sticky left-0 top-0">
        <h1 className="text-xl font-semibold px-6">[Sidebar Aqui]</h1>
      </aside>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl w-full mx-auto flex flex-col p-6">
        <Outlet />
      </main>
    </div>
  );
}
