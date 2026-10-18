var mysql = require("mysql2/promise");

if (
  process.env.AMBIENTE_PROCESSO !== "producao" &&
  process.env.AMBIENTE_PROCESSO !== "desenvolvimento"
) {
  console.log(
    "\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n",
  );
}

// POOL DE CONEXÕES COM O BANCO MYSQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function executar(instrucao, params = []) {
  try {
    const [resultados] = await pool.execute(instrucao, params);
    return resultados;
  } catch (erro) {
    console.error("ERRO NO MySQL SERVER: ", erro.sqlMessage || erro.message);
    throw erro;
  }
}

async function getConnection() {
  return await pool.getConnection();
}

module.exports = {
  executar,
  getConnection,
};
