const database = require("../database/config");

function cadastrar(cnpj, razao_social, nome_fantasia, email, senha) {
  const instrucaoSql = `CALL sp_cadastrar_empresa('${cnpj}', '${razao_social}', '${nome_fantasia}', '${email}', '${senha}');`;
  return database.executar(instrucaoSql);
}

function cadastrarComEndereco(
  cnpj,
  razao_social,
  nome_fantasia,
  email,
  senha,
  endereco,
) {
  const { cep, logradouro, bairro, localidade, uf, numero, complemento } =
    endereco;

  const instrucaoSql = `CALL sp_cadastrar_empresa_com_endereco('${cep}', '${logradouro}', '${bairro}', '${numero}', '${complemento}', '${localidade}', '${uf}', '${cnpj}', '${razao_social}', '${nome_fantasia}', '${email}', '${senha}');`;
  return database.executar(instrucaoSql);
}

function existePorCnpj(cnpj) {
  const instrucaoSql = `SELECT COUNT(*) FROM empresa WHERE cnpj = '${cnpj}'`;
  return database.executar(instrucaoSql);
}

module.exports = { cadastrar, cadastrarComEndereco, existePorCnpj };
