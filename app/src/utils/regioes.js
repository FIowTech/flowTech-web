export const TODAS_AS_REGIOES = "Todas as regiões";

export function pegarRegiao(servidor) {
  const { localidade, uf } = servidor.endereco ?? {};

  if (!localidade) return null;

  return uf ? localidade + " - " + uf : localidade;
}

export function listarRegioes(servidores) {
  const regioes = [];

  for (const servidor of servidores) {
    const regiao = pegarRegiao(servidor);

    if (regiao && !regioes.includes(regiao)) {
      regioes.push(regiao);
    }
  }

  return regioes.sort();
}