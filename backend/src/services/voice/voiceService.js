import { prisma } from '../../config/db.js';
import { pickSilencePhrase } from '../../ai/conversationBrain/silenceHandler.js';
import { synthesizeSpeechStream } from './elevenLabsService.js';

export { openLiveTranscription } from './deepgramService.js';

// Small reusable arm/clear timer utility — extracted out of the socket
// handler so the silence-check-in bookkeeping isn't tangled with Socket.IO
// event wiring.
export function createSilenceTimer({ timeoutMs, onTimeout }) {
  let timer = null;
  return {
    arm() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(onTimeout, timeoutMs);
    },
    clear() {
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}

// Picks the next silence check-in phrase and persists it as an AI message —
// previously an inline Prisma lookup+create sitting directly in the socket
// handler.
export async function recordSilenceCheckIn(conversationId) {
  const lastAiMessage = await prisma.message.findFirst({
    where: { conversationId, role: 'AI' },
    orderBy: { sequence: 'desc' },
  });
  const phrase = pickSilencePhrase(lastAiMessage?.content);
  const sequence = (lastAiMessage?.sequence ?? 0) + 1;

  await prisma.message.create({
    data: { conversationId, sequence, role: 'AI', content: phrase, strategyUsed: 'SILENCE_CHECK_IN' },
  });

  return phrase;
}

// Thin wrapper over ElevenLabs — streams TTS audio chunks to the caller via
// callback rather than importing Socket.IO here, so this stays testable and
// transport-agnostic.
export async function speak(text, onChunk) {
  const audioStream = await synthesizeSpeechStream(text);
  for await (const chunk of audioStream) {
    onChunk(chunk);
  }
}
