import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import { promises as fs } from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing
  },
};

// Handle POST request
export async function POST(req: NextRequest) {
  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), "public", "uploads"), // Specify upload directory
    keepExtensions: true, // Preserve file extensions
  });

  // Ensure the upload directory exists
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch {}

  // Parse the incoming request
  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) {
        reject(
          NextResponse.json({ error: "Error parsing the form" }, { status: 500 })
        );
        return;
      }

      resolve(
        NextResponse.json({
          message: "File uploaded successfully",
          fields,
          files,
        })
      );
    });
  });
}
