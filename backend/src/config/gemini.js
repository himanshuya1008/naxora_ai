import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { env } from './env.js';

// Shared LangChain chat model used by the Conversation Brain, Customer DNA
// Generator, and Report Generator. A single configured instance keeps model
// choice/temperature consistent across every reasoning step. Every consumer
// calls `.withStructuredOutput(zodSchema, { name })` on this — a LangChain
// abstraction implemented per-provider, so swapping the underlying model here
// is the only change needed; no consumer's call pattern changes.
export const chatModel = new ChatGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
  model: env.GEMINI_MODEL,
  temperature: env.GEMINI_TEMPERATURE,
});
