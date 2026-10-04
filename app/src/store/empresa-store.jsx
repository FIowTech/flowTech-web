import { create } from "zustand";

export const useEmpresaStore = create((set) => ({
  campos: {
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    emailEmp: "",

    nome: "",
    emailResp: "",
    senha: "",
  },
  erros: [],

  etapa: 1,
  avancar: () => set((state) => ({ etapa: Math.min(state.etapa + 1, 3) })), //máximo 3 etapas
  voltar: () => set((state) => ({ etapa: Math.max(state.etapa - 1, 1) })),

  changeCnpj: (value) => {
    if (value == null || value.length == 0) {
      set((state) => ({ erros: [...state.erros, "CNPJ está vazio."] }));
    }

    return set((state) => ({ campos: { ...state.campos, cnpj: value } }));
  },
  changeRazaoSocial: (value) =>
    set((state) => ({ campos: { ...state.campos, razaoSocial: value } })),
  changeNomeFantasia: (value) =>
    set((state) => ({ campos: { ...state.campos, nomeFantasia: value } })),
  changeEmailEmp: (value) =>
    set((state) => ({ campos: { ...state.campos, emailEmp: value } })),
  changeNome: (value) =>
    set((state) => ({ campos: { ...state.campos, nome: value } })),
  changeEmailResp: (value) =>
    set((state) => ({ campos: { ...state.campos, emailResp: value } })),
  changeSenha: (value) =>
    set((state) => ({ campos: { ...state.campos, senha: value } })),
}));
