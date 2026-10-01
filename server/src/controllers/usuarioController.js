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
    res.status(400).send({ message: "O campo 'email' está faltando." });
    return;
  }

  if (isMissing(senha)) {
    res.status(400).send({ message: "O campo 'senha' está faltando." });
    return;
  }

  try {
    // 1. Tenta autenticar usuário
    const result = await usuarioModel.autenticar(email, senha);
    if (!result || result.length != 1) {
      throw new Error("Usuário inexistente ou credenciais inválidas.");
    }

    // 2. Se conseguir, cria um token JWT com o objeto do usuário logado e
    // anexa o token à resposta
    const usuario = result[0];
    const payload = {
      ...usuario,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "24h",
    });

    // Cookie HttpOnly: inacessível via frontend e contém informações sensíveis
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.AMBIENTE_PROCESSO !== "desenvolvimento",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Cookie Autenticado: acessível via frontend, contém apenas um boolean.
    res.cookie("autenticado", true, {
      httpOnly: false,
      secure: process.env.AMBIENTE_PROCESSO !== "desenvolvimento",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).send({
      message: "Usuário logado com sucesso!",
      redirectTo:
        usuario.nivel_acesso === 0 ? "/empresas/cadastrar" : "/dashboard",
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
      },
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

    // 3. Inicia registro de usuário
    await usuarioModel.cadastrar(codigo_acesso, nome, email, senha);

    res.status(201).send({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      return res.status(403).send({ message });
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

async function autenticarPagina(req, res) {
  if (req.status == 401) {
    return res.status(403);
  }
  return res.status(200);
}

module.exports = {
  autenticar,
  cadastrar,
  sair,
  autenticarPagina,
};
