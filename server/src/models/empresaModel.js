const database = require("../database/config");

async function cadastrar(cnpj, razao_social, nome_fantasia, email, senha) {
  const instrucaoSql = `
    CALL sp_cadastrar_empresa('${cnpj}', '${razao_social}', '${nome_fantasia}', '${email}', '${senha}');
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

async function buscarPorId(id_empresa) {
  const instrucaoSql = `
    SELECT * FROM empresa WHERE id_empresa = ${id_empresa}
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

async function existePorId(id_empresa) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM empresa WHERE id_empresa = ${id_empresa};
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

async function existePorCnpj(cnpj) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM empresa WHERE cnpj = '${cnpj}';
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

module.exports = {
  cadastrar,
  buscarPorId,
  existePorId,
  existePorCnpj,
};
