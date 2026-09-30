const { isMissing } = require("../utils");
const empresaModel = require("../models/empresaModel");

async function cadastrar(req, res) {
  const { cnpj, razao_social, nome_fantasia, email, senha, endereco } =
    req.body;

  if (isMissing(cnpj)) {
    return res.status(400).send({ message: "O campo 'cnpj' está faltando." });
  }
  if (isMissing(razao_social)) {
    return res
      .status(400)
      .send({ message: "O campo 'razao_social' está faltando" });
  }
  if (isMissing(nome_fantasia)) {
    return res
      .status(400)
      .send({ message: "O campo 'nome_fantasia' está faltando" });
  }
  if (isMissing(email)) {
    return res.status(400).send({ message: "O campo 'email' esta faltando" });
  }
  if (!isEmailValid(email)) {
    return res.status(400).send({ message: "O campo 'email' esta inválido" });
  }
  if (isMissing(senha)) {
    return res.status(400).send({ message: "O campo 'senha' esta faltando" });
  }
  if (!isPasswordValid(senha)) {
    return res.status(400).send({ message: "O campo 'senha' esta inválido" });
  }

  try {
    const cnpjEmUso = await empresaModel.existePorCnpj(cnpj);
    if (cnpjEmUso) {
      return res.status(409).json({ message: "Este CNPJ já está em uso." });
    }
 
    
    if (endereco) {
      await empresaModel.cadastrarComEndereco(
        cnpj,
        razao_social,
        nome_fantasia,
        email,
        senha,
        endereco,
      );
    } else {
      await empresaModel.cadastrar(
        cnpj,
        razao_social,
        nome_fantasia,
        email,
        senha,
      );
    }

    return res.status(201).json({ message: "Empresa cadastrada com sucesso!" });
  } catch (error) {
    const message = error.message || error.sqlMessage;
    if (message) {
      res.status(400).json({ message });
      return;
    }
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

module.exports = {
  cadastrar,
};


//   const { cnpj, razao_social, nome_fantasia, email, senha, endereco } = req.body;
/*
{
  "cnpj": "00000000000000",
  "razao_social": "asdasd",
  "nome_fantasia": "asdasd",
  "email": "asdas@gmail.com",
  "senha": "Sptech#2026",
  "endereco": {
    "cep": "00000000",
    "logradouro": "asdasd",
    "bairro": "asdasd",
    "numero": "000",
    "complemento": "",
    "localidade": "asdasd",
    "uf": "as"
  }
}
*/