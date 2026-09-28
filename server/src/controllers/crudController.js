let crudModel = require("../models/crudModel");

function cadastrarPortico(req, res) {
    let fkEmpresa = req.body.fkEmpresaServer;
    let nome = req.body.nomeServer;
    let uuid = req.body.uuidServer;
    let codigoPortico = req.body.porticoServer;
    let rodovia = req.body.rodoviaServer;
    let km = req.body.kmServer;
    let sentido = req.body.sentidoServer;
    let uf = req.body.ufServer;
    let status = req.body.statusServer;

    if (fkEmpresa == undefined) {
        res.status(400).send("A empresa está undefined!");
    } else if (nome == undefined) {
        res.status(400).send("O nome do embarcado está undefined!");
    } else if (uuid == undefined) {
        res.status(400).send("O UUID está undefined!");
    } else if (codigoPortico == undefined) {
        res.status(400).send("O pórtico está undefined!");
    } else if (rodovia == undefined) {
        res.status(400).send("A rodovia está undefined!");
    } else if (km == undefined) {
        res.status(400).send("O KM está undefined!");
    } else if (sentido == undefined) {
        res.status(400).send("O sentido está undefined!");
    } else if (uf == undefined) {
        res.status(400).send("A UF está undefined!");
    } else if (status == undefined) {
        res.status(400).send("O status está undefined!");
    } else {

        crudModel.cadastrarPortico(fkEmpresa, nome, uuid, codigoPortico, rodovia, km, sentido, uf, status)
        .then(function (resultado) {
            res.status(201).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).send("Erro ao cadastrar o embarcado!");
        });
    }
}

function listarPortico(req, res) {

    let fkEmpresa = req.params.fkEmpresa;

    if (fkEmpresa == undefined) {
        res.status(400).send("Empresa está undefined!");
    } else {

        crudModel.listarPortico(fkEmpresa)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).send("Erro ao listar os embarcados!");
            });
    }
}

function editarPortico(req, res) {

    let idEmbarcado = req.body.idPorticoServer;
    let portico = req.body.porticoServer;
    let nome = req.body.nomeServer;
    let uuid = req.body.uuidServer;
    let rodovia = req.body.rodoviaServer;
    let km = req.body.kmServer;
    let sentido = req.body.sentidoServer;
    let uf = req.body.ufServer;
    let status = req.body.statusServer;

    if (idEmbarcado == undefined) {
        res.status(400).send("ID do embarcado indefinido!");
    } else if (portico == undefined) {
        res.status(400).send("Portico indefinido!");
    } else if (nome == undefined) {
        res.status(400).send("Nome indefinido!");
    } else if (uuid == undefined) {
        res.status(400).send("UUID indefinido!");
    } else if (rodovia == undefined) {
        res.status(400).send("Rodovia indefinida!");
    } else if (km == undefined) {
        res.status(400).send("KM indefinido!");
    } else if (sentido == undefined) {
        res.status(400).send("Sentido indefinido!");
    } else if (uf == undefined) {
        res.status(400).send("UF indefinida!");
    } else if (status == undefined) {
        res.status(400).send("Status indefinido!");
    } else {

        crudModel.editarPortico( idEmbarcado, portico, nome, uuid, rodovia, km, sentido, uf, status)

        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao editar! Erro: ", erro.sqlMessage);

            res.status(500).json(erro.sqlMessage);

        });
    }
}

function apagarPortico(req, res) {
    let idPortico = req.body.idPorticoServer;

    if (idPortico == undefined) {
        res.status(400).send("O ID do pórtico está undefined!");
    } else {

        crudModel.apagarPortico(idPortico)
            .then(function (resultado) {
                res.json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);

            });
    }
}

module.exports = {
    cadastrarPortico,
    listarPortico,
    editarPortico,
    apagarPortico
};