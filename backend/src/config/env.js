import 'dotenv/config';
import { z } from 'zod';

// Fail fast: an invalid/missing env var should crash the process at boot,
// not surface as a confusing runtime error three requests later.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url(),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),

  DEEPGRAM_API_KEY: z.string().min(1, 'DEEPGRAM_API_KEY is required'),

  ELEVENLABS_API_KEY: z.string().min(1, 'ELEVENLABS_API_KEY is required'),
  ELEVENLABS_VOICE_ID: z.string().min(1),
  ELEVENLABS_MODEL_ID: z.string().default('eleven_turbo_v2_5'),

  // Vapi (voice call orchestration — Elliot v2 voice + Soniox STT, replacing
  // the Deepgram/ElevenLabs/Socket.IO pipeline above).
  VAPI_API_KEY: z.string().min(1, 'VAPI_API_KEY is required'),
  // Public key for the browser-side Vapi Web SDK. Distinct from VAPI_API_KEY
  // (private/server key) — using the private key client-side would leak full
  // account access to every visitor's browser. Optional at the schema level
  // so the backend still boots while this is pending from the Vapi dashboard;
  // required in practice before the frontend voice call can start.
  VAPI_PUBLIC_KEY: z.string().optional(),
  VAPI_ASSISTANT_ID: z.string().min(1, 'VAPI_ASSISTANT_ID is required'),
  VAPI_WEBHOOK_SECRET: z.string().min(16, 'VAPI_WEBHOOK_SECRET must be at least 16 characters'),
  // Publicly reachable base URL for THIS backend (e.g. an ngrok/tunnel URL in
  // dev, or the real Render URL in production) — Vapi's cloud calls our
  // webhook over the public internet, so localhost is never reachable here.
  // Optional at the schema level (only needed to run the one-off assistant
  // configure script); the app itself doesn't read this at runtime.
  VAPI_WEBHOOK_BASE_URL: z.string().url().optional().or(z.literal('')),

  TURN_SERVER_URL: z.string().optional(),
  TURN_SERVER_USERNAME: z.string().optional(),
  TURN_SERVER_CREDENTIAL: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(200),
  // Dev-only override for the auth (/login, /register) rate limit — read ONLY
  // when NODE_ENV=development (see rateLimiter.js). Production always uses a
  // hardcoded strict limit regardless of this value, so misconfiguring or
  // omitting this var can never loosen production's brute-force protection.
  AUTH_RATE_LIMIT_MAX_DEV: z.coerce.number().int().positive().default(100),

  ALLOWED_ORIGINS: z
    .string()
    .min(1)
    .transform((val) => val.split(',').map((origin) => origin.trim())),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
