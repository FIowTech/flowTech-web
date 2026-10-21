const database = require("../database/config");

async function autenticar(email, senha) {
  const instrucaoSql = `
    SELECT id_usuario, empresa_id, supervisor_id, nome, email, nivel_acesso, data_criacao, data_atualizacao 
    FROM usuario WHERE email = ? AND senha = SHA2(?, 256);
  `;

  console.log("[usuarioModel] Executando a instrução SQL: \n" + instrucaoSql);

  const [result] = await database.executar(instrucaoSql, [email, senha]);

  return { data: result };
}

async function cadastrar(codigo_acesso, nome, email, senha) {
  const conn = await database.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Procura código no Banco
    const [resultsCodigo] = await conn.execute(
      "SELECT * FROM codigo_acesso WHERE codigo = ? AND status = 'valido' LIMIT 1",
      [codigo_acesso],
    );
    if (!resultsCodigo || resultsCodigo.length === 0)
      throw new Error("Código inexistente");

    const codigoEncontrado = resultsCodigo[0];

    if (codigoEncontrado.qtd_usos + 1 > codigoEncontrado.qtd_usos_max)
      throw new Error("Código informado inválido");

    // 2. Cria usuário com o código válido encontrado
    const [resultUsuario] = await conn.execute(
      `
      INSERT INTO usuario(empresa_id, supervisor_id, nome, email, senha, nivel_acesso)
			VALUES (?, ?, ?, ?, SHA2(?, 256), 2);
      `,
      [
        codigoEncontrado.empresa_id,
        codigoEncontrado.usuario_id,
        nome,
        email,
        senha,
      ],
    );
    if (!resultUsuario || !resultUsuario.insertId)
      throw new Error("Não foi possível criar usuário com o código informado");

    // 3. Atualiza qtd. de usos e status do código utilizado
    let novaQtdUsos = Math.min(
      codigoEncontrado.qtd_usos + 1,
      codigoEncontrado.qtd_usos_max,
    );
    let novoStatus = codigoEncontrado.status;

    if (novaQtdUsos === codigoEncontrado.qtd_usos_max) {
      novoStatus = "usado";
    }

    await conn.execute(
      "UPDATE codigo_acesso SET qtd_usos = ?, status = ? WHERE codigo = ?",
      [novaQtdUsos, novoStatus, codigo_acesso],
    );

    await conn.commit();
    return { data: resultUsuario.insertId };
  } catch (error) {
    await conn.rollback();

    console.error(
      "[usuarioModel] Erro na transação, realizando rollback:",
      error instanceof Error && error.message ? error.message : error,
    );

    throw error;
  } finally {
    conn.release();
  }
}

async function existePorEmail(email) {
  const instrucaoSql = "SELECT COUNT(*) FROM usuario WHERE email = ?";

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  const [result] = await database.executar(instrucaoSql, [email]);

  return result["COUNT(*)"] !== 0 ? true : false;
}

async function buscar(empresaId) {
  const instrucaoSql = "SELECT * =FROM usuario WHERE id_usuario = ?;";
  console.log("[usuarioModel] Executando a instrução SQL: \n" + instrucaoSql);
  const [result] = await database.executar(instrucaoSql, [empresaId])
  
/* for (const embarcado of resultEmbarcados) {
    const resultParametros = await database.executar(
      `
      SELECT c.id_componente, c.nome, c.descricao, p.status, p.limite_max, p.limite_min FROM parametro p 
      JOIN componente c ON p.componente_id = c.id_componente 
      WHERE embarcado_id = ? AND empresa_id = ?
      `,
      [embarcado.id_embarcado, empresaId],
    );

    embarcadosComParametros.push({
      ...embarcado,
      parametros: resultParametros,
    });
  }
*/
  return { data: result };
}


module.exports = {
  autenticar,
  cadastrar,
  existePorEmail,
  buscar,
};
