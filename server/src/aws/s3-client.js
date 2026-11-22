const { S3Client } = require("@aws-sdk/client-s3");

let s3ClientInstance = null;

function getS3Client() {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN } =
    process.env;

  if (!AWS_REGION) {
    throw new Error("[s3-client] A variável AWS_REGION não foi definida.");
  }

  const options = {
    region: AWS_REGION,
  };

  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    options.credentials = {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      sessionToken: AWS_SESSION_TOKEN || undefined,
    };
  }

  s3ClientInstance = new S3Client(options);
  return s3ClientInstance;
}

module.exports = {
  getS3Client,
};
