let database = require("../database/config");

function cadastrarPortico(fkEmpresa, nome, uuid, codigoPortico, rodovia, km, sentido, uf, status) {
    let instrucaoPortico = `
        INSERT INTO porticos
            (fk_empresa, codigo_identificacao)
        VALUES
            (${fkEmpresa}, '${codigoPortico}');
    `;
    return database.executar(instrucaoPortico)
        .then(function (resultadoPortico) {
            let idPortico = resultadoPortico.insertId;
            let instrucaoEndereco = `
                INSERT INTO endereco_porticos
                    (fk_portico, rodovia, km, sentido, uf)
                VALUES
                    (${idPortico}, '${rodovia}', ${km}, '${sentido}', '${uf}');
            `;

        return database.executar(instrucaoEndereco)
            .then(function () {
                let instrucaoEmbarcado = `
                        INSERT INTO embarcados
                            (nome, uuid, status, fk_portico)
                    VALUES
                        ('${nome}', '${uuid}', ${status}, ${idPortico});
                    `;

                    return database.executar(instrucaoEmbarcado);
                });
        });
}

function listarPortico(fkEmpresa) {

    let instrucaoSql = `
        SELECT e.id, e.nome, e.uuid, e.status, p.id AS id_portico, p.codigo_identificacao,
               c.nome AS componente, pa.valor_minimo, pa.valor_maximo, pa.unidade_medida
        FROM embarcados AS e
        JOIN porticos AS p
            ON e.fk_portico = p.id
        LEFT JOIN parametros AS pa
            ON pa.fk_embarcado = e.id
        LEFT JOIN componentes AS c
            ON c.id = pa.fk_componente
        WHERE p.fk_empresa = ${fkEmpresa}
        ORDER BY e.id;
    `;

    console.log("Executando SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql);
}

function apagarPortico(idEmbarcado) {

    let instrucaoBusca = `
        SELECT fk_portico
        FROM embarcados
        WHERE id = ${idEmbarcado};
    `;

    return database.executar(instrucaoBusca)
        .then(function (resultado) {
            let idPortico = resultado[0].fk_portico;

            let instrucaoParametros = `
                DELETE FROM parametros
                WHERE fk_embarcado = ${idEmbarcado};
            `;

            return database.executar(instrucaoParametros)
                .then(function () {
                    let instrucaoEmbarcado = `
                        DELETE FROM embarcados
                        WHERE id = ${idEmbarcado};
                    `;
                    return database.executar(instrucaoEmbarcado);
                })
                .then(function () {
                    let instrucaoEndereco = `
                        DELETE FROM endereco_porticos
                        WHERE fk_portico = ${idPortico};
                    `;
                    return database.executar(instrucaoEndereco);
                })
                .then(function () {
                    let instrucaoPortico = `
                        DELETE FROM porticos
                        WHERE id = ${idPortico};
                    `;
                    return database.executar(instrucaoPortico);
                });
        });
}

function editarPortico(idPortico, nome, uuid, codigoPortico, rodovia, km, sentido, uf, status) {

    var instrucaoSql = `
        UPDATE embarcados AS e
        JOIN porticos AS p
            ON e.fk_portico = p.id
        JOIN endereco_porticos AS ep
            ON ep.fk_portico = p.id
        SET e.nome = '${nome}', e.uuid = '${uuid}', e.status = ${status}, p.codigo_identificacao = '${codigoPortico}',
            ep.rodovia = '${rodovia}', ep.km = ${km}, ep.sentido = '${sentido}', ep.uf = '${uf}'
        WHERE e.id = ${idPortico};
    `;

    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrarPortico,
    listarPortico,
    apagarPortico,
    editarPortico
};
