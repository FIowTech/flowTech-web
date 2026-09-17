var database = require("../database/config")

function verificarCodigo(codigo) {
    var instrucaoSql = `SELECT fk_empresa FROM codigos_autenticacao WHERE codigo_autenticacao = '${codigo}';`;
    return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha, fk_empresa) {
    var instrucaoSql = `INSERT INTO usuarios VALUES (default, '${nome}', '${email}', '${senha}', '${fk_empresa}')`;
    return database.executar(instrucaoSql);
}

function login(email, senha) {
    var instrucaoSql = `SELECT * FROM usuarios WHERE email = '${email}' AND senha = '${senha}'`;
    return database.executar(instrucaoSql);
}

module.exports = {
    verificarCodigo,
    cadastrar,
    login
};