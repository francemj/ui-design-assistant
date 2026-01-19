import OpenAI from "openai"
import { analysisResultSchema } from "@shared/schema"
import { env } from "./env-config"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export interface AnalyzeInput {
  imageBuffer: Buffer
  imageMimeType: string
  imageName: string
  description: string
  conversationHistory?: Array<{ question: string; answer: string }>
}

export async function performAnalysis(
  input: AnalyzeInput
): Promise<ReturnType<typeof analysisResultSchema.parse>> {
  const { imageBuffer, imageMimeType, description, conversationHistory } = input

  // Validate buffer exists and has content
  if (!imageBuffer || imageBuffer.length === 0) {
    throw new Error("Invalid image data - empty buffer")
  }

  console.log(
    `Processing image: ${input.imageName}, size: ${imageBuffer.length} bytes, type: ${imageMimeType}`
  )

  const base64Image = imageBuffer.toString("base64")

  const systemPrompt = `You are a UI/UX expert analyzing layouts and suggesting optimal placements for new UI elements.

When analyzing a UI screenshot and a user's request to add a new element:
1. Carefully examine the existing layout, visual hierarchy, and design patterns
2. Suggest 2-4 optimal placement locations for the new element
3. For each suggestion, provide:
   - The specific region/location (e.g., "top-right toolbar", "below the main form")
   - A clear rationale explaining why this placement works well
   - Bounding box coordinates showing where this placement would be on the image
4. If you need more context to give better suggestions, list 1-3 clarifying questions

For coordinates, analyze the image and provide a bounding box as percentages of the image dimensions:
- x: horizontal position from left edge (0-100%)
- y: vertical position from top edge (0-100%)
- width: width of the suggested area (0-100%)
- height: height of the suggested area (0-100%)

Respond ONLY with a valid JSON object in this exact format:
{
  "placements": [
    {
      "region": "specific location description",
      "reason": "detailed rationale for this placement",
      "coordinates": {
        "x": 10.5,
        "y": 20.0,
        "width": 30.0,
        "height": 15.0
      }
    }
  ],
  "clarifyingQuestions": ["question 1", "question 2"]
}

IMPORTANT:
- Always include coordinates for every placement suggestion
- Coordinates are percentages (0-100) of the original image dimensions
- The clarifyingQuestions field is optional and can be omitted if you don't need additional context
- Do NOT include any comments, explanations, or additional fields in the JSON
- Return ONLY valid JSON with no markdown formatting or extra text`

  const userPrompt = `I want to add the following to this UI: ${description}

Please analyze the layout and suggest the best placement options.`

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
            url: `data:${imageMimeType};base64,${base64Image}`,
          },
        },
      ],
    },
  ]

  if (conversationHistory && conversationHistory.length > 0) {
    for (const turn of conversationHistory) {
      messages.push({
        role: "assistant",
        content: `I have a clarifying question: ${turn.question}`,
      })
      messages.push({
        role: "user",
        content: `Answer: ${turn.answer}`,
      })
    }

    messages.push({
      role: "user",
      content:
        "Based on my answers to your questions, please provide updated placement suggestions.",
    })
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    max_tokens: 1500,
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    console.error(
      "No content in response. Full response:",
      JSON.stringify(response)
    )
    throw new Error("No response from AI")
  }

  let parsedContent
  try {
    let jsonString = content.trim()

    if (jsonString.startsWith("```")) {
      const jsonMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        jsonString = jsonMatch[1]
      }
    } else {
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonString = jsonMatch[0]
      }
    }

    parsedContent = JSON.parse(jsonString)
  } catch (parseError) {
    console.error("JSON parsing failed for AI response:", content)
    console.error("Parse error:", parseError)
    throw new Error(`Failed to parse AI response as JSON: ${content}`)
  }

  let validatedResult
  try {
    validatedResult = analysisResultSchema.parse(parsedContent)
  } catch (validationError) {
    console.error("Zod validation failed:", validationError)
    console.error("Parsed content:", JSON.stringify(parsedContent, null, 2))
    throw new Error(
      `AI response did not match expected schema: ${JSON.stringify(validationError)}`
    )
  }

  return validatedResult
}
