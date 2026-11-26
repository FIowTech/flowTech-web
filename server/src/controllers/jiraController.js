const empresaModel = require("../models/empresaModel");
const { buscarChamadosEquipe } = require("../service/jiraService");

async function buscarChamadosEquipeController(req, res) {
  try {
    const { empresa_id } = req.usuario || {};

    console.log("Empresa do usuário:", empresa_id);

    if (!empresa_id) {
      return res.status(400).json({
        message: "Usuário não possui empresa vinculada.",
      });
    }

    const empresaResponse = await empresaModel.buscarPorId(empresa_id);

    console.log("Retorno do banco:", empresaResponse);
    console.log("Dados da empresa:", empresaResponse.data);

    const empresa = empresaResponse.data;

    if (!empresa) {
      return res.status(404).json({
        message: "Empresa não encontrada.",
      });
    }

    console.log("Empresa encontrada:", empresa.id_empresa);

    const chamados = await buscarChamadosEquipe(empresa);

    console.log("Total de chamados encontrados:", chamados.length);

    const chamadosPorIntegrante = {};

    chamados.forEach((chamado) => {
      const responsavel =
        chamado.fields.assignee?.displayName || "Não atribuído";

      chamadosPorIntegrante[responsavel] =
        (chamadosPorIntegrante[responsavel] || 0) + 1;
    });

    const labels = Object.keys(chamadosPorIntegrante);
    const valores = Object.values(chamadosPorIntegrante);

    return res.status(200).json({
      result: {
        labels,
        valores,
        integrantes: labels.map((nome, index) => ({
          nome,
          total: valores[index],
        })),
        total: chamados.length,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar chamados da equipe:", error);

    return res.status(500).json({
      message: error.message || "Erro ao buscar chamados do Jira.",
    });
  }
}

module.exports = {
  buscarChamadosEquipeController,
};