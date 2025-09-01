const { google } = require("googleapis");
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

      try {
        // Authenticate with Google Drive API using service account
        const auth = new google.auth.JWT(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          null,
          process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          ["https://www.googleapis.com/auth/drive.file"]
        );

        const drive = google.drive({ version: "v3", auth });

        // File metadata
        const fileMetadata = {
          name: fileName,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        };

        // File content
        const media = {
          mimeType: file.headers["content-type"],
          body: fs.createReadStream(file.path),
        };

        // Upload to Google Drive
        const uploadRes = await drive.files.create({
          resource: fileMetadata,
          media,
          fields: "id, webViewLink, webContentLink",
        });

        // Make file public
        await drive.permissions.create({
          fileId: uploadRes.data.id,
          requestBody: { role: "reader", type: "anyone" },
        });

        // Respond with JSON
        resolve({
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            url: uploadRes.data.webContentLink, // direct download link
            viewUrl: uploadRes.data.webViewLink, // Google Drive preview link
          }),
        });
      } catch (error) {
        console.error("Google Drive upload error:", error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ success: false, error: error.message }),
        });
      }
    });
  });
};
