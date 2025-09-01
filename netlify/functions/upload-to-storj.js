const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multiparty = require("multiparty");
const fs = require("fs");

exports.handler = async (event) => {
  return new Promise((resolve) => {
    const form = new multiparty.Form();

    form.parse(event, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ success: false, error: "Form parsing error" }),
        });
      }

      const file = files.file?.[0];
      const fileName = fields.fileName?.[0];

      if (!file || !fileName) {
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ success: false, error: "Missing file or fileName" }),
        });
      }

      const s3 = new S3Client({
        region: "auto",
        endpoint: process.env.STORJ_ENDPOINT || "https://gateway.storjshare.io",
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

        const url = `${process.env.STORJ_ENDPOINT || "https://gateway.storjshare.io"}/${process.env.STORJ_BUCKET}/${fileName}`;

        resolve({
          statusCode: 200,
          body: JSON.stringify({ success: true, url }),
        });
      } catch (error) {
        console.error("Storj upload error:", error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ success: false, error: error.message }),
        });
      }
    });
  });
};
