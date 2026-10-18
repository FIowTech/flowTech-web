const database = require("../database/config");

async function buscar() {
  const instrucaoSql = "SELECT * FROM componente";

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  const result = await database.executar(instrucaoSql);

  return { data: result };
}

module.exports = {
  buscar,
};
