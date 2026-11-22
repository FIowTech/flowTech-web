const tracesService = require("../services/tracesService");
const { isMissing } = require("../utils/validacao");

async function buscar(req, res) {
  const { endereco_mac, periodo } = req.query;

  if (isMissing(endereco_mac)) {
    return res
      .status(400)
      .json({ message: "O parâmetro 'endereco_mac' é obrigatório." });
  }

  if (!isMissing(periodo) && !tracesService.PERIODOS_VALIDOS.includes(periodo)) {
    return res.status(400).json({
      message: "Período inválido. Use: 1h, 24h, 15d ou 30d.",
    });
  }

  try {
    const response = await tracesService.getTraces({
      endereco_mac,
      periodo,
    });

    return res.status(200).json({
      message: "Traces encontradas com sucesso.",
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
