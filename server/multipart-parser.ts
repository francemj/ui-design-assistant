import busboy from "busboy"
import type { IncomingMessage } from "http"
import { Readable } from "stream"

export interface ParsedMultipartData {
  file?: { buffer: Buffer; mimetype: string; originalname: string }
  description?: string
  conversationHistory?: Array<{ question: string; answer: string }>
}

export function parseMultipartFormData(
  req: IncomingMessage | any
): Promise<ParsedMultipartData> {
  return new Promise((resolve, reject) => {
    const contentType = req.headers?.["content-type"] || ""
    if (!contentType.includes("multipart/form-data")) {
      return reject(new Error("Content-Type must be multipart/form-data"))
    }

    const bb = busboy({ headers: req.headers as any })
    const fields: Record<string, string> = {}
    let fileData: {
      buffer: Buffer
      mimetype: string
      originalname: string
    } | null = null

    bb.on("file", (name, file, info) => {
      if (name !== "image") {
        file.resume()
        return
      }

      const { filename, mimeType } = info
      const chunks: Buffer[] = []

      // Validate file type
      if (mimeType !== "image/png" && mimeType !== "image/jpeg") {
        file.resume()
        return reject(new Error("Only PNG and JPEG images are allowed"))
      }

      file.on("data", (chunk: Buffer) => {
        chunks.push(chunk)
      })

      file.on("end", () => {
        const buffer = Buffer.concat(chunks)
        if (buffer.length > 10 * 1024 * 1024) {
          return reject(new Error("File size exceeds 10MB limit"))
        }
        fileData = {
          buffer,
          mimetype: mimeType,
          originalname: filename || "image",
        }
      })

      file.on("error", (err) => {
        reject(err)
      })
    })

    bb.on("field", (name, value) => {
      fields[name] = value
    })

    bb.on("finish", () => {
      const conversationHistory = fields.conversationHistory
        ? JSON.parse(fields.conversationHistory)
        : []
      resolve({
        file: fileData || undefined,
        description: fields.description,
        conversationHistory,
      })
    })

    bb.on("error", (err) => {
      reject(err)
    })

    // Handle different request types (Express vs Vercel)
    // For Vercel, the body might already be read, so we need to reconstruct the stream
    if (req.body && !req.readable) {
      // Body was already read (Vercel case), create a new stream
      const bodyBuffer = Buffer.isBuffer(req.body)
        ? req.body
        : typeof req.body === "string"
          ? Buffer.from(req.body, "utf-8")
          : Buffer.from(String(req.body))
      const bodyStream = Readable.from(bodyBuffer)
      bodyStream.pipe(bb)
    } else {
      // Standard Express/Node.js request - pipe directly
      req.pipe(bb)
    }
  })
}
