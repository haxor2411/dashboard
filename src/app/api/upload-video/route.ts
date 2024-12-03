import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

// Disable Next.js body parsing for this route to handle FormData properly
export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

const uploadVideo = (req: NextApiRequest, res: NextApiResponse) => {
  // Create an instance of IncomingForm with the correct options
  const form = new IncomingForm({
    // Define where to save the uploaded files
    uploadDir: path.join(process.cwd(), "public", "uploads"),
    // Automatically keep the file extensions
    keepExtensions: true,
    // Optionally, change the filename to avoid conflicts (e.g., adding a timestamp)
    filename: (name, ext, path) => `${name}-${Date.now()}${ext}`,
  });

  // Make sure the upload directory exists
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Parse the form data (file + other fields)
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: "Error in file upload", details: err });
      return;
    }
    // Extract the uploaded file safely
    const uploadedFile = files.video ? files.video[0] : null;
    const filePath = uploadedFile ? uploadedFile.filepath : null;

    // Optionally, save file metadata (e.g., filePath) to a database (MongoDB, PostgreSQL, etc.)

    res.status(200).json({
      message: "File uploaded successfully",
      filePath, // Send the file path as a response (can be used to store in DB)
    });
  });
};

export default uploadVideo;
