const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multiparty = require("multiparty");
const fs = require("fs");

exports.handler = async (event) => {
  const form = new multiparty.Form();

  return new Promise((resolve) => {
    form.parse(event, async (err, fields, files) => {
      if (err) {
        return resolve({
          statusCode: 500,
          body: JSON.stringify({ success: false, error: "Form parsing error" }),
        });
      }

      const file = files.file[0];
      const fileName = fields.fileName[0];

      const s3 = new S3Client({
        region: "auto",
        endpoint: "https://gateway.storjshare.io",
        credentials: {
          accessKeyId: process.env.STORJ_ACCESS_KEY,
          secretAccessKey: process.env.STORJ_SECRET_KEY,
        },
      });

      try {
        const fileStream = fs.createReadStream(file.path);

        const command = new PutObjectCommand({
          Bucket: process.env.STORJ_BUCKET,
          Key: fileName,
          Body: fileStream,
          ContentType: file.headers["content-type"],
        });

        await s3.send(command);

        const url = `https://gateway.storjshare.io/${process.env.STORJ_BUCKET}/${fileName}`;

        resolve({
          statusCode: 200,
          body: JSON.stringify({ success: true, url }),
        });
      } catch (error) {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ success: false, error: error.message }),
        });
      }
    });
  });
};
