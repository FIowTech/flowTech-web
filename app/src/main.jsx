import { Toaster } from "@/components/ui/toast";
import "@/index.css";
import AuthLayout from "@/pages/auth-layout";
import DashboardLayout from "@/pages/dashboard-layout";
import EmbarcadosDetailsPage from "@/pages/embarcado-details-page";
import EmbarcadosPage from "@/pages/embarcados-page";
import EmpresaPage from "@/pages/empresa-page";
import HomePage from "@/pages/home-page";
import LandingPage from "@/pages/landing-page";
import LoginPage from "@/pages/login-page";
import NotFoundPage from "@/pages/not-found-page";
import RegisterPage from "@/pages/register-page";
import { useAuth } from "@/store/auth-store";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Toaster />
  </StrictMode>,
);

export function App() {
  const isLoggedIn = useAuth((state) => state.isLoggedIn);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastrar" element={<RegisterPage />} />
        <Route path="/cadastrar/empresa" element={<EmpresaPage />} />
      </Route>

      {isLoggedIn ? (
        <Route element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/embarcados" element={<EmbarcadosPage />} />
          <Route path="/embarcados/:id" element={<EmbarcadosDetailsPage />} />
          {/* <Route path="/alertas" element={<AlertasPage />} /> */}
          {/* <Route path="/equipe" element={<EquipePage />} /> */}
        </Route>
      ) : (
        <Route path="/" element={<LandingPage />} />
      )}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
