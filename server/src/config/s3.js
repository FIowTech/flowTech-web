const { S3Client } = require('@aws-sdk/client-s3');

const client = new S3Client({
    region: process.env.AWS_REGION,
        credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ...(process.env.AWS_SESSION_TOKEN && {
          sessionToken: process.env.AWS_SESSION_TOKEN,
        }),
    }
});

module.exports = client;