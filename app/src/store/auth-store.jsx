import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Formato esperado para usuario:
// {
//   id_usuario: number,
//   empresa_id: number,
//   supervisor_id: number | null,
//   nome: string,
//   email: string,
//   nivel_acesso: 0 | 1 | 2
// }

export const useAuth = create()(
  persist(
    (set) => ({
      usuario: null,
      isLoggedIn: false,
      isPending: false,
      error: null,

      cadastrar: (credentials) => cadastrar(credentials, set),
      login: (credentials) => login(credentials, set),
      logout: () => logout(set),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

async function cadastrar(credentials, set) {
  const { codigoAcesso: codigo_acesso, nome, email, senha } = credentials;

  set({ isPending: true, error: null });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}/usuarios/cadastrar`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo_acesso, nome, email, senha }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Não foi possível realizar o cadastro.");
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Erro inesperado ao realizar o cadastro.";

    set({ error: message });

    return { success: false, error: message };
  } finally {
    set({ isPending: false });
  }
}

async function login(credentials, set) {
  set({ isPending: true, error: null });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}/usuarios/login`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...credentials }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Não foi possível realizar o login.");
    }

    // Sucesso em login:
    set({ usuario: data.usuario, isLoggedIn: true, error: null });

    return { success: true, redirectTo: data.redirectTo };
  } catch (error) {
    // Fracasso em login:
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Erro inesperado ao realizar o login.";

    set({ usuario: null, isLoggedIn: false, error: message });

    return { success: false, error: message };
  } finally {
    set({ isPending: false });
  }
}

async function logout(set) {
  set({ isPending: true, error: null });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}/usuarios/sair`,
      { method: "POST", credentials: "include" },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.message === "string" && data.message.trim()
          ? data.message
          : "Não foi possível realizar o logout.",
      );
    }

    set({
      usuario: null,
      isLoggedIn: false,
      error: null,
    });

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Erro inesperado ao realizar o logout.";

    set({ error: message });

    return { success: false, error: message };
  } finally {
    set({ isPending: false });
  }
}
