const empresaModel = require("../models/empresaModel");
const usuarioModel = require("../models/usuarioModel");
const {
  isMissing,
  isEmailValid,
  isPasswordValid,
} = require("../utils/validacao");

async function cadastrar(req, res) {
  const { nivel_acesso } = req.usuario;
  const { cnpj, razao_social, nome_fantasia, email, senha } = req.body;

  // dado que: 0 - desenvolvedor | 1 - administrador | 2 em diante - usuário comum
  if (nivel_acesso !== 0) {
    return res
      .status(403)
      .send({ message: "Você não tem permissão para realizar esta ação." });
  }

  if (isMissing(cnpj)) {
    return res.status(400).send({ message: "O campo 'cnpj' está faltando." });
  }

  if (isMissing(nome_fantasia)) {
    return res
      .status(400)
      .send({ message: "O campo 'nome_fantasia' está faltando." });
  }

  if (!isEmailValid(email)) {
    return res
      .status(400)
      .send({ message: "O endereço de e-mail fornecido está inválido." });
  }

  if (!isPasswordValid(senha)) {
    return res.status(400).send({
      message: "A senha fornecida está inválida.",
    });
  }

  try {
    // 1. Verifica se CNPJ informado está em uso
    const cnpjEmUso = await empresaModel.existePorCnpj(cnpj);
    if (cnpjEmUso) {
      return res
        .status(409)
        .json({ message: "CNPJ informado já está em uso." });
    }

    // 2. Verifica se Email informado está em uso
    const emailEmUso = await usuarioModel.existePorEmail(email);
    if (emailEmUso) {
      return res
        .status(409)
        .json({ message: "Email de contato informado já está em uso." });
    }

    // 3. Inicia registro de Empresa
    await empresaModel.cadastrar(
      cnpj,
      razao_social,
      nome_fantasia,
      email,
      senha,
    );

    res.status(201).send({ message: "Empresa cadastrada com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(403).send({ message });
      return;
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function buscarPorId(req, res) {
  const { empresa_id } = req.usuario;

  if (isMissing(empresa_id)) {
    return res
      .status(400)
      .send({ message: "ID da empresa não foi passado na requisição." });
  }

  try {
    const empresaExiste = await empresaModel.existePorId(empresa_id);
    if (!empresaExiste) {
      return res
        .status(404)
        .json({ message: "Nenhuma Empresa encontrada para o ID informado." });
    }

    const empresaResult = await empresaModel.buscarPorId(empresa_id);

    res.status(200).json({
      message: "Empresa encontrada com sucesso!",
      result: empresaResult[0],
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
  cadastrar,
  buscarPorId,
};
