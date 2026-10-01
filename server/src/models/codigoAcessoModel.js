const database = require("../database/config");

async function gerar(
  usuario_id,
  empresa_id,
  codigo,
  qtd_usos_max,
  data_expiracao,
) {
  // todo: tirar esse date_add() no futuro e substituir por uma data real e formatada do jeito que o mysql espera
  const instrucaoSql = `
    INSERT INTO codigo_acesso(usuario_id, empresa_id, codigo, qtd_usos_max, data_expiracao)
      VALUES(${usuario_id}, ${empresa_id}, '${codigo}', ${qtd_usos_max}, DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 1 DAY));
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database.executar(instrucaoSql);
}

async function buscar(usuario_id, empresa_id) {
  const instrucaoSql = `SELECT * FROM codigo_acesso 
  WHERE usuario_id = ${usuario_id} AND empresa_id = ${empresa_id}`;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database.executar(instrucaoSql);
}

async function buscarPorStatus(usuario_id, empresa_id, status) {
  const instrucaoSql = `SELECT * FROM codigo_acesso 
  WHERE usuario_id = ${usuario_id} AND empresa_id = ${empresa_id} AND status = '${status}'`;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database.executar(instrucaoSql);
}

function isUnico(codigo) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM codigo_acesso WHERE codigo = '${codigo}';
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] === 0 ? true : false));
}

module.exports = {
  gerar,
  buscar,
  buscarPorStatus,
  isUnico,
};
