const componenteModel = require("../models/componenteModel");

async function buscar(_, res) {
  try {
    const response = await componenteModel.buscar();

    res.status(200).json({
      message: "Componentes encontrados com sucesso!",
      count: response.data.length,
      result: response.data,
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

module.exports = {
  buscar,
};
