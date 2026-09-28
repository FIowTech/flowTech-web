var database = require("../database/config");

function cadastrarEmpresa(cnpj, razao_social, nome_fantasia, cep, logradouro, bairro, localidade, uf, numero, complemento, codigo_autenticacao) {
  var instrucaoSql = `CALL cadastrarEmpresa('${cnpj}', '${razao_social}', '${nome_fantasia}', '${cep}', '${logradouro}', '${bairro}', '${localidade}', '${uf}', '${numero}', '${complemento}', '${codigo_autenticacao}');`;
  return database.executar(instrucaoSql);
}
module.exports = { cadastrarEmpresa };
