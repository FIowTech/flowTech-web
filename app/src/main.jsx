import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "./components/ui/toast";
import "./index.css";
import AuthLayout from "./pages/auth-layout";
import EmpresaPage from "./pages/empresa-page";
import HomePage from "./pages/home-page";
import LandingPage from "./pages/landing-page";
import LoginPage from "./pages/login-page";
import RegisterPage from "./pages/register-page";
import { useAuth } from "./store/auth-store";

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
      <Route index element={isLoggedIn ? <HomePage /> : <LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastrar" element={<RegisterPage />} />
        <Route path="/cadastrar/empresa" element={<EmpresaPage />} />
      </Route>
    </Routes>
  );
}
