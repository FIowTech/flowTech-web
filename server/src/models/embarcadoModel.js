const database = require("../database/config");

async function buscar(empresaId) {
  const instrucaoSql = "SELECT * FROM embarcado WHERE empresa_id = ?";

  console.log("[embarcadoModel] Executando a instrução SQL: \n" + instrucaoSql);
  const embarcadosComParametros = [];
  const resultEmbarcados = await database.executar(instrucaoSql, [empresaId]);

  for (const embarcado of resultEmbarcados) {
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

  return { data: embarcadosComParametros };
}

async function buscarPorId(empresaId, idEmbarcado) {
  const instrucaoSql =
    "SELECT * FROM embarcado WHERE empresa_id = ? AND id_embarcado = ?";

  console.log("[embarcadoModel] Executando a instrução SQL: \n" + instrucaoSql);
  const result = await database.executar(instrucaoSql, [
    empresaId,
    idEmbarcado,
  ]);

  return { data: result[0] };
}

async function cadastrar(
  empresaId,
  endereco_mac,
  apelido,
  modelo,
  endereco,
  componentes,
) {
  const conn = await database.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Cadastra endereço fornecido
    const {
      cep,
      logradouro,
      bairro,
      localidade,
      uf,
      numero,
      complemento,
      km,
      sentido,
      lat,
      lon,
    } = endereco;
    const [resultEndereco] = await conn.execute(
      "INSERT INTO endereco(cep, logradouro, bairro, localidade, uf, numero, complemento, km, sentido, lat, lon) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        cep,
        logradouro || null,
        bairro || null,
        localidade,
        uf,
        numero || "S/N",
        complemento || null,
        km,
        sentido,
        lat,
        lon,
      ],
    );

    // 2. Cadastra Embarcado
    const [resultEmbarcado] = await conn.execute(
      "INSERT INTO embarcado(empresa_id, endereco_id, endereco_mac, apelido, modelo) VALUES(?, ?, ?, ?, ?)",
      [empresaId, resultEndereco.insertId, endereco_mac, apelido, modelo],
    );
    const embarcadoId = resultEmbarcado.insertId;

    // 3. Vincula cada Componente solicitado ao Embarcado criado
    const listaComponentes = Object.values(componentes);
    if (listaComponentes.length > 0) {
      for (const valor of listaComponentes) {
        const { id_componente, limite_max, limite_min, status } = valor;

        await conn.execute(
          "INSERT INTO parametro (embarcado_id, empresa_id, status, componente_id, limite_max, limite_min) VALUES (?, ?, ?, ?, ?, ?)",
          [
            embarcadoId,
            empresaId,
            status,
            id_componente,
            limite_max,
            limite_min ?? null,
          ],
        );
      }
    }

    await conn.commit();
    return { data: embarcadoId };
  } catch (error) {
    await conn.rollback();

    console.error(
      "[embarcadoModel] Erro na transação, realizando rollback:",
      error instanceof Error && error.message ? error.message : error,
    );

    throw error;
  } finally {
    conn.release();
  }
}

async function editar(empresaId, idEmbarcado, campos = {}) {
  const conn = await database.getConnection();

  try {
    await conn.beginTransaction();

    const chaves = Object.keys(campos);
    if (chaves.length === 0) {
      throw new Error("Nenhum campo foi fornecido para atualização.");
    }

    // 1. Se requisitado, atualiza parâmetros
    if (campos.componentes) {
      const listaComponentes = Object.values(campos.componentes);

      if (listaComponentes.length > 0) {
        for (const valor of listaComponentes) {
          const { id_componente, limite_max, limite_min, status } = valor;

          const parametrosParaAtualizar = {};
          if (limite_max !== undefined)
            parametrosParaAtualizar.limite_max = limite_max;
          if (limite_min !== undefined)
            parametrosParaAtualizar.limite_min = limite_min;
          if (status !== undefined) parametrosParaAtualizar.status = status;

          const chavesParam = Object.keys(parametrosParaAtualizar);
          if (chavesParam.length === 0) continue;

          const parametrosTratados = chavesParam
            .map((chave) => `${chave} = ?`)
            .join(", ");

          const valoresParametro = Object.values(parametrosParaAtualizar);
          await conn.execute(
            `UPDATE parametro SET ${parametrosTratados} WHERE empresa_id = ? AND embarcado_id = ? AND componente_id = ?`,
            [...valoresParametro, empresaId, idEmbarcado, id_componente],
          );
        }
      }
    }

    // 2. Atualiza os campos de Embarcado
    const chavesEmbarcado = chaves.filter((chave) => chave !== "componentes");

    if (chavesEmbarcado.length > 0) {
      const camposTratados = chavesEmbarcado
        .map((chave) => `${chave} = ?`)
        .join(", ");
      const instrucaoUpdateSql = `UPDATE embarcado SET ${camposTratados} WHERE empresa_id = ? AND id_embarcado = ?`;

      const valoresEmbarcado = chavesEmbarcado.map((chave) => campos[chave]);
      const valoresTotais = [...valoresEmbarcado, empresaId, idEmbarcado];

      console.log(
        "[embarcadoModel] Executando a instrução SQL: \n" + instrucaoUpdateSql,
      );

      await conn.execute(instrucaoUpdateSql, valoresTotais);
    }

    const instrucaoSelectSql =
      "SELECT * FROM embarcado WHERE empresa_id = ? AND id_embarcado = ?";
    console.log(
      "[embarcadoModel] Executando a instrução SQL: \n" + instrucaoSelectSql,
    );

    const [resultSelect] = await conn.execute(instrucaoSelectSql, [
      empresaId,
      idEmbarcado,
    ]);

    await conn.commit();
    return { updated: resultSelect[0] };
  } catch (error) {
    await conn.rollback();

    console.error(
      "[embarcadoModel] Erro na transação, realizando rollback:",
      error.sqlMessage || error.message,
    );

    throw error;
  } finally {
    conn.release();
  }
}

async function remover(empresaId, idEmbarcado) {
  const instrucaoSql =
    "DELETE FROM embarcado WHERE empresa_id = ? AND id_embarcado = ?";

  console.log("[embarcadoModel] Executando a instrução SQL: \n" + instrucaoSql);
  await database.executar(instrucaoSql, [empresaId, idEmbarcado]);
}

async function existePorId(empresaId, id_embarcado) {
  const instrucaoSql =
    "SELECT COUNT(*) FROM embarcado WHERE empresa_id = ? AND id_embarcado = ?";

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const [result] = await database.executar(instrucaoSql, [
    empresaId,
    id_embarcado,
  ]);

  return result["COUNT(*)"] !== 0 ? true : false;
}

async function existePorEnderecoMac(endereco_mac) {
  const instrucaoSql = "SELECT COUNT(*) FROM embarcado WHERE endereco_mac = ?";

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const [result] = await database.executar(instrucaoSql, [endereco_mac]);

  return result["COUNT(*)"] !== 0 ? true : false;
}

module.exports = {
  buscar,
  buscarPorId,
  cadastrar,
  editar,
  remover,
  existePorId,
  existePorEnderecoMac,
};
