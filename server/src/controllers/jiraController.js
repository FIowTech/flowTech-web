import empresaModel from "../models/empresaModel.js";
import { buscarChamadosEquipe } from "../service/jiraService.js";

export async function buscarChamadosEquipeController(req, res) {
  try {
    // Obtém o ID da empresa do usuário autenticado
    const { empresa_id } = req.usuario;

    if (!empresa_id) {
      return res.status(400).json({
        message: "Usuário não possui empresa vinculada.",
      });
    }

    // Busca a empresa no banco de dados
    const empresaResponse = await empresaModel.buscarPorId(empresa_id);

    const empresa = empresaResponse.data?.[0];

    if (!empresa) {
      return res.status(404).json({
        message: "Empresa não encontrada.",
      });
    }

    // Busca os chamados utilizando as credenciais da empresa
    const chamados = await buscarChamadosEquipe(empresa);

    // Agrupa os chamados por responsável
    const chamadosPorIntegrante = {};

    chamados.forEach((chamado) => {
      const responsavel =
        chamado.fields.assignee?.displayName ?? "Não atribuído";

      chamadosPorIntegrante[responsavel] =
        (chamadosPorIntegrante[responsavel] ?? 0) + 1;
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
      message: "Erro ao buscar chamados do Jira.",
      error: error.message,
    });
  }
}