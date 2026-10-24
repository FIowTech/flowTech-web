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
    let tentativas = 0;
    const maxTentativas = 10;

    // 1. Verifica se código gerado já está em uso
    while (!codigoUnico) {
      if (tentativas >= maxTentativas) {
        return res.status(500).send({
          message: "Não foi possível gerar um código único. Tente novamente.",
        });
      }

      codigoGerado = gerarCodigoRandomico();
      codigoUnico = await codigoAcessoModel.isUnico(codigoGerado);
      tentativas++;
    }

    const response = await codigoAcessoModel.gerar(
      id_usuario,
      empresa_id,
      codigoGerado,
      qtd_usos_max < 1 ? 1 : qtd_usos_max,
      data_expiracao,
    );

    res.status(201).json({
      message: "Código de Acesso criado com sucesso!",
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

async function buscar(req, res) {
  const { id_usuario, empresa_id } = req.usuario;

  try {
    const response = await codigoAcessoModel.buscar(id_usuario, empresa_id);
    if (response.data.length === 0) {
      return res.status(200).send({
        message: "Nenhum código de acesso encontrado.",
        count: 0,
        result: [],
      });
    }

    res.status(200).json({
      message: "Códigos de acesso encontrados.",
      count: response.data.length,
      result: response.data,
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

async function buscarPorId(req, res) {
  const { id_usuario, empresa_id } = req.usuario;
  const { id_codigo } = req.params;

  try {
    const response = await codigoAcessoModel.buscarPorId(
      id_codigo,
      id_usuario,
      empresa_id,
    );

    if (!response.data) {
      return res.status(200).send({
        message: "Nenhum código de acesso encontrado.",
      });
    }

    res.status(200).json({
      message: "Código de acesso encontrado.",
      result: response.data,
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
    const response = await codigoAcessoModel.buscarPorStatus(
      id_usuario,
      empresa_id,
      status,
    );
    if (response.data.length === 0) {
      return res.status(200).send({
        message: "Nenhum código de acesso encontrado.",
        count: 0,
        result: [],
      });
    }

    res.status(200).json({
      message: "Códigos de acesso encontrados.",
      count: response.data.length,
      result: response.data,
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

async function revogar(req, res) {
  const { id_codigo } = req.params;
  const { id_usuario, empresa_id, nivel_acesso } = req.usuario;

  // dado que: 0 - desenvolvedor | 1 - administrador | 2 em diante - usuário comum
  if (nivel_acesso > 1) {
    return res
      .status(403)
      .send({ message: "Você não tem permissão para realizar esta ação." });
  }

  if (isMissing(id_codigo)) {
    return res
      .status(400)
      .send({ message: "O parâmetro 'id_codigo' está faltando." });
  }

  try {
    await codigoAcessoModel.revogar(id_codigo, id_usuario, empresa_id);

    res.status(200).json({
      message: "Código revogado com sucesso.",
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
  buscarPorId,
  buscarPorStatus,
  revogar,
};
