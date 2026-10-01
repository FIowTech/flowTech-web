const { isMissing } = require("../utils/validacao");
const codigoAcessoModel = require("../models/codigoAcessoModel");
const { gerarCodigoRandomico } = require("../utils/geradorCodigo");

async function gerar(req, res) {
  const { id_usuario, empresa_id, nivel_acesso } = req.usuario;
  const { qtd_usos_max, data_expiracao } = req.body;

  // dado que: 0 - desenvolvedor | 1 - administrador | 2 em diante - usuário comum
  if (nivel_acesso > 1) {
    return res
      .status(403)
      .send({ message: "Você não tem permissão para realizar esta ação." });
  }

  if (isMissing(data_expiracao)) {
    return res
      .status(400)
      .send({ message: "O campo 'data_expiracao' está faltando." });
  }

  try {
    let codigoGerado;
    let codigoUnico = false;

    // 1. Verifica se código gerado já está em uso
    while (!codigoUnico) {
      codigoGerado = gerarCodigoRandomico();
      codigoUnico = await codigoAcessoModel.isUnico(codigoGerado);
    }

    await codigoAcessoModel.gerar(
      id_usuario,
      empresa_id,
      codigoGerado,
      qtd_usos_max < 1 ? 1 : qtd_usos_max,
      data_expiracao,
    );

    res.status(201).json({ message: "Código de Acesso criado com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function buscar(req, res) {
  const { id_usuario, empresa_id } = req.usuario;

  try {
    const result = await codigoAcessoModel.buscar(id_usuario, empresa_id);
    if (result.length === 0) {
      return res.status(200).send({
        message: "Nenhum código de acesso encontrado.",
        count: 0,
      });
    }

    res.status(200).json({
      message: "Códigos de acesso encontrados.",
      count: result.length,
      result,
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).json({ message });
      return;
    }
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

async function buscarPorStatus(req, res) {
  const { status } = req.query;
  const { id_usuario, empresa_id } = req.usuario;

  try {
    const result = await codigoAcessoModel.buscarPorStatus(
      id_usuario,
      empresa_id,
      status,
    );
    if (result.length === 0) {
      return res.status(200).send({
        message: "Nenhum código de acesso encontrado.",
        count: 0,
      });
    }

    res.status(200).json({
      message: "Códigos de acesso encontrados.",
      count: result.length,
      result,
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).json({ message });
      return;
    }
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

module.exports = {
  gerar,
  buscar,
  buscarPorStatus,
};
