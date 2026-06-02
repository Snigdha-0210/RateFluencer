// lib/env.ts

export function validateEnv() {
  const requiredVars = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "GEMINI_API_KEY",
    "NEWS_API_KEY",
  ];

  const missing = requiredVars.filter(
    (envVar) => !process.env[envVar] || process.env[envVar] === ""
  );

  if (missing.length > 0) {
    console.warn(
      `⚠️ WARNING: Missing environment variables: ${missing.join(", ")}\nPlease check your .env.local file. Some features may not work.`
    );
  }
}
