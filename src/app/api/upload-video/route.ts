import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Configure multer storage (to store files in a specific directory)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir); // Specify the directory to store files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Save file with its original name
  }
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing for file uploads
  },
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  return new Promise((resolve, reject) => {
    // Use multer's `.single()` method for single file upload handling
    upload.single("video")(req as any, (req as any).res, (err: any) => {
      if (err) {
        return reject(
          new NextResponse(
            JSON.stringify({ error: "Error uploading file", details: err.message }),
            { status: 500 }
          )
        );
      }

      // File uploaded successfully
      return resolve(
        NextResponse.json({ message: "File uploaded successfully", file: (req as any).file }, { status: 200 })
      );
    });
  });
}
