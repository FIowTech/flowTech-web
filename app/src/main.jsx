import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.jsx";
import "./index.css";
import LoginPage from "./pages/loginpage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

/* Exemplo de uso React-Router
docs: https://reactrouter.com/start/declarative/routing

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
      // Rota index
        <Route index element={<App />} />

      // Layout - p/ compartilhar UI entre páginas distintas
        <Route element={<AuthLayout/>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

function AuthLayout() {
  return (
    <div>
      //... (qualquer estrutura JSX)
      <Outlet/> // Outlet - serve para renderizar a UI dinamicamente com base na ROTA
    </div>
  )
}

*/
