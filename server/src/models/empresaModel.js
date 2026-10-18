const database = require("../database/config");

async function cadastrar(cnpj, razao_social, nome_fantasia, email, senha) {
  const conn = await database.getConnection();

  try {
    await conn.beginTransaction();

    const [resultEmpresa] = await conn.execute(
      "INSERT INTO empresa(cnpj, razao_social, nome_fantasia, email) VALUES (?, ?, ?, ?)",
      [cnpj, razao_social, nome_fantasia, email],
    );

    const nomeUsuario = `Usuário de ${nome_fantasia} (ADM)`;
    await conn.execute(
      "INSERT INTO usuario(empresa_id, nome, email, senha, nivel_acesso) VALUES (?, ?, ?, SHA2(?, 256), 1)",
      [resultEmpresa.insertId, nomeUsuario, email, senha],
    );

    await conn.commit();
    return { data: resultEmpresa.insertId };
  } catch (error) {
    await conn.rollback();

    console.error(
      "[empresaModel] Erro na transação, realizando rollback:",
      error instanceof Error && error.message ? error.message : error,
    );

    throw error;
  } finally {
    conn.release();
  }
}

async function buscarPorId(id_empresa) {
  const instrucaoSql = "SELECT * FROM empresa WHERE id_empresa = ?";

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const [result] = await database.executar(instrucaoSql, [id_empresa]);

  return { data: result };
}

async function configurarJira(empresaId, campos = {}) {
  const chaves = Object.keys(campos);
  if (chaves.length === 0) {
    throw new Error("Nenhum campo foi fornecido para atualização.");
  }

  const camposTratados = chaves.map((chave) => `${chave} = ?`).join(", ");

  const instrucaoUpdateSql = `UPDATE empresa SET ${camposTratados} WHERE id_empresa = ?`;
  const valores = [...Object.values(campos), empresaId];

  await database.executar(instrucaoUpdateSql, valores);
  console.log(
    "[empresaModel] Executando a instrução SQL: \n" + instrucaoUpdateSql,
  );

  const instrucaoSelectSql = "SELECT * FROM empresa WHERE id_empresa = ?";
  const [result] = await database.executar(instrucaoSelectSql, [empresaId]);
  console.log(
    "[empresaModel] Executando a instrução SQL: \n" + instrucaoSelectSql,
  );

  return { updated: result[0] };
}

async function existePorId(id_empresa) {
  const instrucaoSql = "SELECT COUNT(*) FROM empresa WHERE id_empresa = ?";

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const [result] = await database.executar(instrucaoSql, [id_empresa]);

  return result["COUNT(*)"] !== 0 ? true : false;
}

async function existePorCnpj(cnpj) {
  const instrucaoSql = "SELECT COUNT(*) FROM empresa WHERE cnpj = ?";

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const [result] = await database.executar(instrucaoSql, [cnpj]);

  return result["COUNT(*)"] !== 0 ? true : false;
}

module.exports = {
  cadastrar,
  buscarPorId,
  configurarJira,
  existePorId,
  existePorCnpj,
};
