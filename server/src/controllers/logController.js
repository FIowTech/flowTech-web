const logsService = require("../services/logsService");
const { isMissing } = require("../utils/validacao");

async function buscar(req, res) {
  const { endereco_mac, periodo } = req.query;
  const limit = Number(req.query.limit ?? 50);
  const offset = Number(req.query.offset ?? 0);

  if (isMissing(endereco_mac)) {
    return res
      .status(400)
      .json({ message: "O parâmetro 'endereco_mac' é obrigatório." });
  }

  if (!isMissing(periodo) && !logsService.PERIODOS_VALIDOS.includes(periodo)) {
    return res.status(400).json({
      message: "Período inválido. Use: 1h, 24h, 15d ou 30d.",
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
    const response = await logsService.getLogs({
      endereco_mac,
      periodo,
      limit,
      offset,
    });

    return res.status(200).json({
      message: "Logs encontrados com sucesso.",
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
