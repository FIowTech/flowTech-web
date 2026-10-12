import { create } from "zustand";

// Formato esperado para usuario:
// {
//   id_usuario: number,
//   empresa_id: number,
//   supervisor_id: number | null,
//   nome: string,
//   email: string,
//   nivel_acesso: 0 | 1 | 2
// }
export const useAuth = create((set) => ({
  usuario: null,
  isLoggedIn: false,
  isPending: false,
  error: null,
  login: (credentials) => login(credentials, set),
  logout: () => logout(set),
}));

async function login(credentials, set) {
  const { email, senha } = credentials;

  try {
    set(() => ({ isPending: true, error: null }));

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}/usuarios/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      },
    );

    const data = await response.json();

    // Sucesso em login:
    set(() => ({ usuario: data.usuario, isLoggedIn: true, error: null }));
    console.log(data.message);
  } catch (error) {
    // Fracasso em login:
    set(() => ({ error }));
    console.error(error);
  } finally {
    set(() => ({ isPending: false }));
  }
}

async function logout(set) {
  try {
    set(() => ({ isPending: true, error: null }));

    const response = await fetch(
      `${import.meta.env.VITE_BASE_API_URL}/usuarios/sair`,
      {
        method: "POST",
      },
    );

    const data = await response.json();

    // Sucesso em logout:

    console.log(data.message);
    set(() => ({ usuario: null, isLoggedIn: false, error: null }));
  } catch (error) {
    // Fracasso em login:
    set(() => ({ error }));
    console.error(error);
  } finally {
    set(() => ({ isPending: false }));
  }
}
