import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import EmpresaPage from "./pages/empresa-page";
import HomePage from "./pages/home-page";
import LandingPage from "./pages/landing-page";
import LoginPage from "./pages/login-page";
import { useAuth } from "./store/auth-store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

export function App() {
  const isUserLoggedIn = useAuth((state) => state.isLoggedIn);

  return (
    <Routes>
      <Route index element={isUserLoggedIn ? <HomePage /> : <LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/empresa" element={<EmpresaPage />} />
    </Routes>
  );
}
