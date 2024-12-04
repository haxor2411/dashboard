import formidable from "formidable";
import { NextApiRequest } from "next";
import { NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();

  try {
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: "Error parsing the form" });
        return;
      }
      res.status(200).json({ fields, files });
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
