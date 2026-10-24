const {
  isMissing,
  isEmailValid,
  isPasswordValid,
} = require("../utils/validacao");
const usuarioModel = require("../models/usuarioModel");
const jwt = require("jsonwebtoken");

async function autenticar(req, res) {
  const { email, senha } = req.body;

  if (isMissing(email)) {
    return res.status(400).send({ message: "O campo 'email' está faltando." });
  }

  if (isMissing(senha)) {
    return res.status(400).send({ message: "O campo 'senha' está faltando." });
  }

  try {
    // 1. Tenta autenticar usuário
    const result = await usuarioModel.autenticar(email, senha);
    if (!result.data) {
      throw new Error("Usuário inexistente ou credenciais inválidas.");
    }

    // 2. Se conseguir, cria um token JWT
    const usuario = result.data;
    const payload = { ...usuario };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "24h",
    });

    res.status(200).send({
      message: "Usuário logado com sucesso!",
      token,
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso,
      },
      redirectTo: usuario.nivel_acesso === 0 ? "/cadastrar/empresa" : "/",
    });
  } catch (error) {
    const message =
      (error instanceof Error && error.message) || error.sqlMessage;

    if (message) {
      res.status(401).send({ message });
      return;
    }

    res.status(500).send({ message: "Erro interno no servidor" });
  }
}

async function cadastrar(req, res) {
  const { codigo_acesso, nome, email, senha } = req.body;

  if (isMissing(codigo_acesso)) {
    return res
      .status(400)
      .send({ message: "O campo 'codigo_acesso' está faltando." });
  }

  if (isMissing(nome)) {
    return res.status(400).send({ message: "O campo 'nome' está faltando." });
  }

  if (isMissing(email)) {
    return res.status(400).send({ message: "O campo 'email' está faltando." });
  }

  if (!isEmailValid(email)) {
    res
      .status(400)
      .send({ message: "O endereço de e-mail fornecido está inválido." });
    return;
  }

  if (isMissing(senha)) {
    return res.status(400).send({ message: "O campo 'senha' está faltando." });
  }

  if (!isPasswordValid(senha)) {
    return res.status(400).send({
      message: "A senha fornecida está inválida.",
    });
  }

  try {
    // 1. Verifica se Email informado está em uso
    const emailEmUso = await usuarioModel.existePorEmail(email);
    if (emailEmUso) {
      return res
        .status(409)
        .json({ message: "Email informado já está em uso." });
    }

    // 2. Inicia registro de usuário
    const response = await usuarioModel.cadastrar(
      codigo_acesso,
      nome,
      email,
      senha,
    );

    res.status(201).send({
      message: "Usuário cadastrado com sucesso!",
      result: response.data,
    });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      return res.status(500).send({ message });
    }
    res.status(500).send({ message: "Erro interno no servidor." });
  }
}

async function sair(req, res) {
  const token = req.cookies?.access_token;
  if (token) {
    res.clearCookie("access_token");
    res.clearCookie("autenticado");
  }

  return res.status(200).json({ message: "Logout realizado." });
}

async function buscar(req, res) {
  const { empresa_id } = req.usuario;

  try {
    const response = await usuarioModel.buscar(empresa_id);
    if (response.data.length === 0) {
      return res.status(200).send({
        message: "Nenhum usuario cadastrado nessa empresa",
        count: 0,
        result: [],
      });
    }

    res.status(200).json({
      message: "Usuarios encontrado(s) para a Empresa solicitada.",
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

module.exports = {
  autenticar,
  cadastrar,
  sair,
  buscar,
};
