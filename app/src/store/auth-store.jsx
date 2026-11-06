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
    (set, get) => ({
      usuario: null,
      token: null,
      isLoggedIn: false,
      isPending: false,
      error: null,

      cadastrar: (credentials) => cadastrar(credentials, set),
      login: (credentials) => login(credentials, set),
      logout: () => logout(set),
      configurarJira: (jiraData) => configurarJira(jiraData, set, get),
      buscarEmpresa: () => buscarEmpresa(set, get)    }),
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
        // credentials: "include",
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
        // credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...credentials }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Não foi possível realizar o login.");
    }

    // Sucesso em login:
    set({
      usuario: data.usuario,
      token: data.token,
      isLoggedIn: true,
      error: null,
    });

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

function logout(set) {
  set({
    usuario: null,
    token: null,
    isLoggedIn: false,
    error: null,
  });
}


async function configurarJira(jiraData, set, get) {
  set({ isPending: true, error: null });

  try {
    const { token } = get();

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}/empresas/jira`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jiraData),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Não foi possível salvar as configurações do Jira.");
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Erro inesperado ao configurar o Jira.";

    set({ error: message });

    return { success: false, error: message };
  } finally {
    set({ isPending: false });
  }
}

async function buscarEmpresa(set, get) {
  try {
    const { token } = get();
    console.log("Token recuperado do state para buscar empresa:", token);

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}/empresas`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    console.log("Resposta bruta da API /empresas:", data);

    if (!response.ok) throw new Error(data.message);

    return { success: true, data: data.result };
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return { success: false, error: error.message };
  }
}
// async function logout(set) {
//   set({ isPending: true, error: null });

//   try {
//     const response = await fetch(
//       `${import.meta.env.VITE_BASE_API_URL}/usuarios/sair`,
//       { method: "POST", credentials: "include" },
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         typeof data.message === "string" && data.message.trim()
//           ? data.message
//           : "Não foi possível realizar o logout.",
//       );
//     }

//     set({
//       usuario: null,
//       token: null,
//       isLoggedIn: false,
//       error: null,
//     });

//     return { success: true };
//   } catch (error) {
//     const message =
//       error instanceof Error && error.message
//         ? error.message
//         : "Erro inesperado ao realizar o logout.";

//     set({ error: message });

//     return { success: false, error: message };
//   } finally {
//     set({ isPending: false });
//   }
// }
