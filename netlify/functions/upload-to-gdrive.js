// Uploads a file to Google Drive using a service account, makes it public,
// and returns JSON with a direct download URL and a view URL.
// Requires env vars:
//  - GOOGLE_SERVICE_ACCOUNT_EMAIL
//  - GOOGLE_PRIVATE_KEY (with newline characters preserved; Netlify shows \n)
//  - GOOGLE_DRIVE_FOLDER_ID

const { google } = require("googleapis");
const parser = require("lambda-multipart-parser");

exports.handler = async (event) => {
  try {
    // Parse multipart form-data from AWS Lambda-style event
    const result = await parser.parse(event);

    const file = (result.files && result.files[0]) || null;
    const fileName = result.fileName || (file && file.filename);

    if (!file || !fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "Missing file or fileName"
        })
      };
    }

    // OPTIONAL: reject overly large uploads to avoid function limits
    // if (file.content && file.content.length > 9 * 1024 * 1024) {
    //   return {
    //     statusCode: 413,
    //     body: JSON.stringify({
    //       success: false,
    //       error: "File too large for this endpoint."
    //     })
    //   };
    // }

    // Auth with service account
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/drive.file"]
    );

    const drive = google.drive({ version: "v3", auth });

    // Create file in folder
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
    };

    const media = {
      mimeType: file.contentType || "application/octet-stream",
      body: Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content || [])
    };

    const uploadRes = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink"
    });

    const fileId = uploadRes.data.id;

    // Make file public (anyone with the link can read)
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" }
    });

    // Some clients prefer a stable direct-download URL pattern
    // webContentLink works, but you can also use: https://drive.google.com/uc?export=download&id=FILE_ID
    const directUrl = uploadRes.data.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`;
    const viewUrl = uploadRes.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        url: directUrl,
        viewUrl
      })
    };
  } catch (error) {
    console.error("Google Drive upload error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error && error.message ? error.message : "Upload failed"
      })
    };
  }
};
