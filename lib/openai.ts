import OpenAI from "openai";

let client: OpenAI | null = null;

// Defaults target OpenRouter's free tier. Override via env vars to use any
// other OpenAI-compatible provider (OpenAI, Azure, Foundry, local, etc.).
// Free models on OpenRouter change often; see https://openrouter.ai/models?max_price=0
// Verified-working examples: nvidia/nemotron-3-super-120b-a12b:free | poolside/laguna-s-2.1:free
export const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export function getOpenAIClient() {
  if (client) {
    return client;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const baseURL = process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL;

  client = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: {
      // OpenRouter optional ranking/attrib headers; harmless for other providers.
      "HTTP-Referer": process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      "X-Title": "template-chat",
    },
  });
  return client;
}
