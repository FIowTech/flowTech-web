import { buscarChamadosJira } from "./jiraService.js";

async function buscarChamadosPorResponsavel(empresa) {
  const chamados = await buscarChamadosJira(empresa);

  console.log("Quantidade de chamados recebidos:", chamados.length);
  console.log("Primeiro chamado:", chamados[0]);

  const agrupamento = {};

  chamados.forEach((chamado) => {
    const responsavel =
      chamado.fields.assignee?.displayName || "Não atribuído";

    agrupamento[responsavel] =
      (agrupamento[responsavel] || 0) + 1;
  });

  const dados = Object.entries(agrupamento)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);

  console.log("Dados agrupados:", dados);

  return {
    totalChamados: chamados.length,
    dados,
  };
}