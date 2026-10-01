const database = require("../database/config");

const camposPermitidos =
  "id_usuario, empresa_id, supervisor_id, nome, email, nivel_acesso, data_criacao, data_atualizacao";

async function autenticar(email, senha) {
  const instrucaoSql = `
    SELECT ${camposPermitidos} FROM usuario 
    WHERE email = '${email}' AND senha = SHA2('${senha}', 256);
    `;

  console.log(
    "[usuarioModel.js] Executando a instrução SQL: \n" + instrucaoSql,
  );
  return database.executar(instrucaoSql);
}

async function cadastrar(codigo_acesso, nome, email, senha) {
  const instrucaoSql = `
    CALL sp_cadastrar_usuario('${codigo_acesso}', '${nome}', '${email}', '${senha}');
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

async function existePorEmail(email) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM usuario WHERE email = '${email}';
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

module.exports = {
  autenticar,
  cadastrar,
  existePorId,
  existePorEmail,
};
