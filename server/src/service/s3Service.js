
const {
  GetObjectCommand,
  NoSuchKey,
  S3ServiceException,
  paginateListObjectsV2,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const client = require("../config/s3");

const BUCKET = process.env.BUCKET_NAME_ETL;

console.log("Bucket configurado:", BUCKET);
console.log("Região configurada:", process.env.AWS_REGION);

if (!BUCKET) {
  throw new Error(
    "A variável de ambiente BUCKET_NAME_ETL não foi definida."
  );
}

// Presigned URL
async function getUrlS3(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: 3600 });
}

const { ListObjectsV2Command } = require("@aws-sdk/client-s3");

// Lê JSON convencional ou JSONL
async function getObject(key) {
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );

    const conteudo = await response.Body.transformToString();

    if (!conteudo.trim()) return null;

    // JSON convencional: objeto ou array
    try {
      return JSON.parse(conteudo);
    } catch {
      // JSONL: um objeto JSON por linha
      return conteudo
        .split(/\r?\n/)
        .filter((linha) => linha.trim() !== "")
        .map((linha, index) => {
          try {
            return JSON.parse(linha);
          } catch (error) {
            throw new Error(
              `JSONL inválido no arquivo "${key}", linha ${index + 1}: ${error.message}`,
            );
          }
        });
    }
  } catch (error) {
    if (error instanceof NoSuchKey) {
      console.error(`Objeto não encontrado no S3: ${key}`);
      return null;
    }

    if (error instanceof S3ServiceException) {
      console.error(
        `Erro S3 (${BUCKET}): ${error.name}: ${error.message}`,
      );
      return null;
    }

    throw error;
  }
}

// Lista todos os objetos de um prefixo, incluindo paginação
async function listObjects(prefix) {
  const objetos = [];

  console.log("[S3 DEBUG] Bucket:", BUCKET);
  console.log("[S3 DEBUG] Prefix:", prefix);

  for await (const page of paginateListObjectsV2(
    { client },
    {
      Bucket: BUCKET,
      Prefix: prefix,
    },
  )) {
    console.log("[S3 DEBUG] KeyCount:", page.KeyCount);
    console.log("[S3 DEBUG] Contents:", page.Contents);

    for (const objeto of page.Contents ?? []) {
      if (objeto.Key && !objeto.Key.endsWith("/")) {
        objetos.push(objeto);
      }
    }
  }

  console.log("[S3 DEBUG] Total de objetos:", objetos.length);

  return objetos;
}

// Objeto mais recente
async function getMostRecentObject(prefix) {
  const objetos = await listObjects(prefix);

  return objetos.reduce(
    (maisRecente, objeto) =>
      !maisRecente ||
      objeto.LastModified > maisRecente.LastModified
        ? objeto
        : maisRecente,
    null,
  );
}

module.exports = {
  getUrlS3,
  getObject,
  getMostRecentObject,
  listObjects,
};
