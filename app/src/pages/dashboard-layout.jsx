import { Sidebar } from "@/components/dashboard/sidebar";
import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="w-full min-h-dvh flex flex-col sm:flex-row gap-2 bg-background-dark">
      <Sidebar />

      {/* Conteúdo Principal */}
      <main className="max-w-6xl w-full mx-auto flex flex-col p-6">
        <Outlet />
      </main>
    </div>
  );
}
