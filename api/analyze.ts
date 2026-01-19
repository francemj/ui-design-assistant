import type { VercelRequest, VercelResponse } from "@vercel/node"
import { parseMultipartFormData } from "../server/multipart-parser"
import { performAnalysis } from "../server/analyze-handler"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Parse multipart form data (parser handles Vercel's request format)
    const { file, description, conversationHistory } =
      await parseMultipartFormData(req)

    if (!file) {
      return res.status(400).json({ message: "No image file uploaded" })
    }

    if (!description || typeof description !== "string") {
      return res.status(400).json({ message: "Description is required" })
    }

    const result = await performAnalysis({
      imageBuffer: file.buffer,
      imageMimeType: file.mimetype,
      imageName: file.originalname,
      description,
      conversationHistory,
    })

    return res.json(result)
  } catch (error) {
    console.error("Analysis error:", error)

    if (error instanceof Error) {
      return res.status(500).json({
        message: error.message || "Analysis failed",
      })
    } else {
      return res.status(500).json({ message: "An unknown error occurred" })
    }
  }
}
