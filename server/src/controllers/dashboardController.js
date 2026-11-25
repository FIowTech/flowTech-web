const empresaModel = require("../models/empresaModel");

const {
  buscarChamadosPorResponsavel,
} = require("../service/dashboardService");

async function getChamadosPorResponsavel(req, res) {
  try {
    const { empresa_id } = req.usuario;

    if (!empresa_id) {
      return res.status(400).json({
        message: "Empresa do usuário não identificada.",
      });
    }

    // Busca os dados da empresa e suas credenciais Jira
    const empresaResponse = await empresaModel.buscarPorId(empresa_id);

    const empresa = empresaResponse.data?.[0];

    if (!empresa) {
      return res.status(404).json({
        message: "Empresa não encontrada.",
      });
    }

    // Verifica se a empresa possui configuração Jira
    const {
      jira_email,
      jira_api_key,
      jira_base_url,
      jira_project_key,
    } = empresa;

    if (
      !jira_email ||
      !jira_api_key ||
      !jira_base_url ||
      !jira_project_key
    ) {
      return res.status(400).json({
        message: "A integração com o Jira não está configurada.",
      });
    }

    // Consulta os chamados e agrupa por responsável
    const resultado = await buscarChamadosPorResponsavel(empresa);

    return res.status(200).json({
      result: resultado,
    });

  } catch (error) {
    console.error(
      "[dashboardController] Erro ao buscar chamados Jira:",
      error
    );

    return res.status(500).json({
      message: "Erro interno ao buscar chamados do Jira.",
    });
  }
}

module.exports = {
  getChamadosPorResponsavel,
};