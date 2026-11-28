const alertasService = require("../services/alertasService");
const { isMissing } = require("../utils/validacao");

const SITUACOES_VALIDAS = ["alerta", "critico"];

async function buscar(req, res) {
  const { empresa_id } = req.usuario;
  const { situacao } = req.query;
  const periodo = req.query.periodo ?? "7d";
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);

  if (isMissing(empresa_id)) {
    return res
      .status(400)
      .json({ message: "A empresa do usuário não foi identificada." });
  }

  if (!alertasService.PERIODOS_VALIDOS.includes(periodo)) {
    return res.status(400).json({
      message: "Período inválido. Use: 1h, 24h, 7d, 15d ou 30d.",
    });
  }

  if (
    !isMissing(situacao) &&
    !SITUACOES_VALIDAS.includes(String(situacao).toLowerCase())
  ) {
    return res.status(400).json({
      message: "Situação inválida. Use: alerta ou critico.",
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    return res.status(400).json({
      message: "O parâmetro 'limit' deve ser um inteiro entre 1 e 500.",
    });
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return res.status(400).json({
      message: "O parâmetro 'offset' deve ser um inteiro maior ou igual a 0.",
    });
  }

  try {
    const response = await alertasService.getAlertas({
      empresa_id,
      periodo,
      situacao,
      limit,
      offset,
    });

    return res.status(200).json({
      message: "Alertas encontrados com sucesso.",
      ...response,
    });
  } catch (error) {
    const message = error.message || "Erro interno no servidor.";
    return res.status(500).json({ message });
  }
}

module.exports = {
  buscar,
};
