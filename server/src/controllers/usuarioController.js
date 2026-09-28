var usuarioModel = require("../models/usuarioModel");

function cadastrar(req, res) {
    var nome = req.body.nome;
    var email = req.body.email;
    var senha = req.body.senha;
    var codigo = req.body.codigo;

    let fk_empresa;
    let codValido = false;

    usuarioModel.verificarCodigo(codigo).then((resultado) => {
        if(resultado.length > 0) {
            console.log("passou 1");
            fk_empresa = resultado[0].fk_empresa;
            codValido = true;

            if(codValido) {
                console.log("Validou o cod");
                usuarioModel.cadastrar(nome, email, senha, fk_empresa).then((resultado) => {
                res.status(200).send("Cadastro autorizado!");
                });
            }
        }
    });
}

function login(req, res) {
    var email = req.body.email;
    var senha = req.body.senha;

    usuarioModel.login(email, senha).then((resultado) => {
        if(resultado.length > 0) {
            res.status(200).json({
                id: resultado[0].id,
                empresa_id: resultado[0].fk_empresa
            });
        } else {
            res.status(403).send("Credenciais inválidas");
        }
    })
}

module.exports = {
    cadastrar,
    login
}