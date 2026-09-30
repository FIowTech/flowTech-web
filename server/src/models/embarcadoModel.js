const database = require("../database/config");

function buscar(empresaId) {
  const instrucaoSql = `
    SELECT * FROM servidor WHERE empresa_id = ${empresaId};
  `;

  console.log("[embarcadoModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function buscarPorId(empresaId, idEmbarcado) {
  const instrucaoSql = `
    SELECT * FROM servidor 
    WHERE empresa_id = ${empresaId} AND id_embarcado = ${idEmbarcado};
  `;

  console.log("[embarcadoModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function cadastrar(empresaId, enderecoId, endereco_mac, apelido, modelo) {
  const idEndereco = enderecoId || 1;

  const instrucaoSql = `
    INSERT INTO servidor(empresa_id, endereco_id, endereco_mac, apelido, modelo) 
    VALUES (${empresaId}, '${idEndereco}', '${endereco_mac}', '${apelido}', '${modelo}');
  `;

  console.log("[embarcadoModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function editar(empresaId, idEmbarcado, campos = {}) {
  const chaveCampos = Object.keys(campos);
  if (chaveCampos.length <= 0) return; //pois nenhum campo está sendo alterado.

  // Obs: converte campos enviados para atualização para um formato que o SQL aceita.
  // de: { campoA: "valorA", campoB: "valorB" }
  // para: campoA="valorA", campoB="valorB"
  const camposTratados = chaveCampos
    .map((chave) => [chave, `"${campos[chave]}"`].join("="))
    .join(", ");

  const instrucaoSql = `
    UPDATE servidor SET ${camposTratados} 
    WHERE empresa_id = ${empresaId} AND id_embarcado = ${idEmbarcado};
  `;

  console.log("[embarcadoModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function remover(empresaId, idEmbarcado) {
  console.log(
    "[embarcadoModel.js] function remover():",
    idEmbarcado,
    empresaId,
  );

  const instrucaoSql = `
    DELETE FROM servidor 
    WHERE empresa_id = ${empresaId} AND id_embarcado = ${idEmbarcado};
  `;

  console.log("[embarcadoModel] Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function existePorId(idEmbarcado) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM servidor WHERE id_embarcado = ${idEmbarcado};
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
}

function existePorEnderecoMac(endereco_mac) {
  const instrucaoSql = `
    SELECT COUNT(*) FROM servidor WHERE endereco_mac = '${endereco_mac}';
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database
    .executar(instrucaoSql)
    .then((result) => (result[0]["COUNT(*)"] !== 0 ? true : false));
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
