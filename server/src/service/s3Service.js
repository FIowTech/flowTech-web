const { GetObjectCommand, NoSuchKey, S3ServiceException, paginateListObjectsV2 } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const client = require("../config/s3");

async function getUrlS3(key) {
    // Criação de comando, pega um novo objeto do bucket s3
    // Na criação do objeto precisa passar o nome do bucket e a key que deseja consultar
    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key
    });

    // Cria url pelo cliente s3 e o comando, essa url expira em 3600 segundos, 1 hora
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    return url;
}

// Utilizar para pegar o json em especifico
async function getObject(key) {
    try {
        const response = await client.send(
            new GetObjectCommand({
                Bucket: process.env.BUCKET_NAME_ETL,
                Key: key,
            }),
        );

        // O Body vem como stream. Os arquivos GOLD atuais são JSONL; tenta-se
        // primeiro JSON convencional para manter compatibilidade com objetos antigos.
        const str = await response.Body.transformToString();
        try {
            return JSON.parse(str);
        } catch (error) {
            if (!(error instanceof SyntaxError)) throw error;
            return str
                .split(/\r?\n/)
                .filter((linha) => linha.trim())
                .map((linha) => JSON.parse(linha));
        }
    } catch (caught) {
        // Validações da documentação da aws sdk
        if (caught instanceof NoSuchKey) {
            console.error(
                `Error from S3 while getting object "${key}" from "${process.env.BUCKET_NAME_ETL}". No such key exists.`,
            );
        } else if (caught instanceof S3ServiceException) {
            // CORREÇÃO: aqui estava `bucketName`, variável que não existe (dava ReferenceError)
            console.error(
                `Error from S3 while getting object from ${process.env.BUCKET_NAME_ETL}.  ${caught.name}: ${caught.message}`,
            );
        } else {
            throw caught;
        }
        return null
    }
}

// NOVO: lista TODOS os objetos de um prefixo (o S3 devolve no máximo 1000 por chamada,
// o paginate cuida das páginas seguintes). Cada item tem Key, LastModified, Size...
async function listObjects(prefix) {
    const objetos = [];

    for await (const page of paginateListObjectsV2(
        { client },
        { Bucket: process.env.BUCKET_NAME_ETL, Prefix: prefix },
    )) {
        for (const obj of page.Contents ?? []) {
            if (!obj.Key.endsWith("/")) objetos.push(obj); // ignora "pastas" vazias
        }
    }

    return objetos;
}

// Pegar o objeto mais recente de um prefixo (null se não houver nenhum - tratar no controller)
// CORREÇÃO: antes lia só os primeiros 1000 objetos; agora usa a listagem paginada.
async function getMostRecentObject(prefix) {
    const objetos = await listObjects(prefix);

    return objetos.reduce(
        (last, obj) => (!last || obj.LastModified > last.LastModified ? obj : last),
        null,
    );
};

// Ler arquivos JSONL (JSON Lines) do S3
async function getJsonLines(key) {
    const response = await client.send(
        new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME_ETL,
            Key: key,
        }),
    );

    const conteudo = await response.Body.transformToString();

    return conteudo
        .split(/\r?\n/)
        .filter((linha) => linha.trim() !== "")
        .map((linha) => JSON.parse(linha));
}


module.exports = {
    getUrlS3,
    getObject,
    getMostRecentObject,
    listObjects,
    getJsonLines
}
