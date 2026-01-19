import { config } from "dotenv"
import { existsSync } from "fs"
import { resolve } from "path"

// Determine the current environment
export const NODE_ENV = process.env.NODE_ENV || "development"

// Load environment-specific configuration
function loadEnvironmentConfig() {
  const envFile = `.env.${NODE_ENV}`
  const envPath = resolve(process.cwd(), envFile)

  // Check if environment-specific file exists
  if (existsSync(envPath)) {
    config({ path: envPath })
    console.log(`Loaded environment config from ${envFile}`)
  } else {
    // Fall back to default .env file
    config()
    console.error(`Environment file ${envFile} not found, falling back to .env`)
  }
}

// Load the configuration
loadEnvironmentConfig()

// Export environment configuration
export const env = {
  NODE_ENV,
  PORT: process.env.PORT || "8888",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
} as const

// Validate required environment variables
export function validateEnvironment() {
  const requiredVars = ["OPENAI_API_KEY"]

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.error("Missing required environment variables:")
    missing.forEach((varName) => console.error(`  - ${varName}`))
    process.exit(1)
  }

  console.log("All required environment variables are set")
}
