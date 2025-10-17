import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import OpenAI from "openai";
import { analysisResultSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Only PNG and JPEG images are allowed"));
    }
  },
});

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      const description = req.body.description;
      if (!description || typeof description !== "string") {
        return res.status(400).json({ message: "Description is required" });
      }

      const conversationHistory = req.body.conversationHistory 
        ? JSON.parse(req.body.conversationHistory) 
        : [];

      const base64Image = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;

      const systemPrompt = `You are a UI/UX expert analyzing layouts and suggesting optimal placements for new UI elements.

When analyzing a UI screenshot and a user's request to add a new element:
1. Carefully examine the existing layout, visual hierarchy, and design patterns
2. Suggest 2-4 optimal placement locations for the new element
3. For each suggestion, provide:
   - The specific region/location (e.g., "top-right toolbar", "below the main form")
   - A clear rationale explaining why this placement works well
4. If you need more context to give better suggestions, list 1-3 clarifying questions

Respond ONLY with a valid JSON object in this exact format:
{
  "placements": [
    {
      "region": "specific location description",
      "reason": "detailed rationale for this placement"
    }
  ],
  "clarifyingQuestions": ["question 1", "question 2"]
}

The clarifyingQuestions field is optional and can be omitted if you don't need additional context.
Do NOT include any comments, explanations, or additional fields in the JSON.
Return ONLY valid JSON with no markdown formatting or extra text.`;

      let userPrompt = `I want to add the following to this UI: ${description}

Please analyze the layout and suggest the best placement options.`;

      const messages: any[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ];

      if (conversationHistory && conversationHistory.length > 0) {
        for (const turn of conversationHistory) {
          messages.push({
            role: "assistant",
            content: `I have a clarifying question: ${turn.question}`,
          });
          messages.push({
            role: "user",
            content: `Answer: ${turn.answer}`,
          });
        }
        
        messages.push({
          role: "user",
          content: "Based on my answers to your questions, please provide updated placement suggestions.",
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return res.status(500).json({ message: "No response from AI" });
      }

      let parsedContent;
      try {
        let jsonString = content.trim();
        
        if (jsonString.startsWith("```")) {
          const jsonMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (jsonMatch) {
            jsonString = jsonMatch[1];
          }
        } else {
          const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
          }
        }
        
        parsedContent = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("JSON parsing failed for AI response:", content);
        console.error("Parse error:", parseError);
        return res.status(500).json({ 
          message: "Failed to parse AI response as JSON",
          details: content 
        });
      }

      let validatedResult;
      try {
        validatedResult = analysisResultSchema.parse(parsedContent);
      } catch (validationError) {
        console.error("Zod validation failed:", validationError);
        console.error("Parsed content:", JSON.stringify(parsedContent, null, 2));
        return res.status(500).json({ 
          message: "AI response did not match expected schema",
          details: validationError 
        });
      }

      res.json(validatedResult);
    } catch (error) {
      console.error("Analysis error:", error);
      
      if (error instanceof Error) {
        res.status(500).json({ 
          message: error.message || "Analysis failed" 
        });
      } else {
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
