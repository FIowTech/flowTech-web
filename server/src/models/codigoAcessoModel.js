const database = require("../database/config");

async function gerar(
  usuario_id,
  empresa_id,
  codigo,
  qtd_usos_max,
  data_expiracao,
) {
  const conn = await database.getConnection();

  try {
    await conn.beginTransaction();

    const instrucaoSqlInsert =
      "INSERT INTO codigo_acesso(usuario_id, empresa_id, codigo, qtd_usos_max, data_expiracao) VALUES(?, ?, ?, ?, ?);";

    console.log("Executando a instrução SQL: \n" + instrucaoSqlInsert);
    const [insertResult] = await conn.execute(instrucaoSqlInsert, [
      usuario_id,
      empresa_id,
      codigo,
      qtd_usos_max,
      data_expiracao,
    ]);

    const instrucaoSqlSelect =
      "SELECT * FROM codigo_acesso WHERE id_codigo = ? AND usuario_id = ? AND empresa_id = ?";

    const [selectResult] = await conn.execute(instrucaoSqlSelect, [
      insertResult.insertId,
      usuario_id,
      empresa_id,
    ]);

    await conn.commit();
    return {
      data: {
        id_codigo: insertResult.insertId,
        codigo: selectResult[0].codigo,
      },
    };
  } catch (error) {
    await conn.rollback();

    console.error(
      "[codigoAcessoModel] Erro na transação, realizando rollback:",
      error.sqlMessage || error.message,
    );

    throw error;
  } finally {
    conn.release();
  }
}

async function buscar(usuario_id, empresa_id) {
  const instrucaoSql = `
  SELECT c.*, u.nome, u.email FROM codigo_acesso c
  JOIN usuario u ON c.usuario_id = u.id_usuario AND c.empresa_id = u.empresa_id 
  WHERE c.usuario_id = ? AND c.empresa_id = ?`;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const result = await database.executar(instrucaoSql, [
    usuario_id,
    empresa_id,
  ]);

  return { data: result };
}

async function buscarPorId(id_codigo, usuario_id, empresa_id) {
  const instrucaoSql = `
  SELECT c.*, u.nome, u.email FROM codigo_acesso c
  JOIN usuario u ON c.usuario_id = u.id_usuario AND c.empresa_id = u.empresa_id 
  WHERE c.id_codigo = ? AND c.usuario_id = ? AND c.empresa_id = ?`;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const result = await database.executar(instrucaoSql, [
    id_codigo,
    usuario_id,
    empresa_id,
  ]);

  return { data: result[0] };
}

async function buscarPorStatus(usuario_id, empresa_id, status) {
  const instrucaoSql = `
  SELECT c.*, u.nome, u.email FROM codigo_acesso c 
  JOIN usuario u ON c.usuario_id = u.id_usuario AND c.empresa_id = u.empresa_id 
  WHERE c.usuario_id = ? AND c.empresa_id = ? AND c.status = ?`;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const result = await database.executar(instrucaoSql, [
    usuario_id,
    empresa_id,
    status,
  ]);

  return { data: result };
}

async function isUnico(codigo) {
  const instrucaoSql =
    "SELECT COUNT(*) FROM codigo_acesso WHERE codigo = ? AND status = ?";

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const [result] = await database.executar(instrucaoSql, [codigo, "valido"]);

  return result["COUNT(*)"] == 0 ? true : false;
}

async function revogar(id_codigo, usuario_id, empresa_id) {
  const instrucaoSql =
    "UPDATE codigo_acesso SET status = 'revogado' WHERE id_codigo = ? AND usuario_id = ? AND empresa_id = ?";

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  await database.executar(instrucaoSql, [id_codigo, usuario_id, empresa_id]);
}

module.exports = {
  gerar,
  buscar,
  buscarPorId,
  buscarPorStatus,
  isUnico,
  revogar,
};
