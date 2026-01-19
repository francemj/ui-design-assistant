import type { Express } from "express"
import { createServer, type Server } from "http"
import { parseMultipartFormData } from "./multipart-parser"
import { performAnalysis } from "./analyze-handler"

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/analyze", async (req, res) => {
    try {
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

      res.json(result)
    } catch (error) {
      console.error("Analysis error:", error)

      if (error instanceof Error) {
        res.status(500).json({
          message: error.message || "Analysis failed",
        })
      } else {
        res.status(500).json({ message: "An unknown error occurred" })
      }
    }
  })

  const httpServer = createServer(app)

  return httpServer
}
