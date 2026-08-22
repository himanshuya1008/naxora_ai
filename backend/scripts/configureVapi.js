import { env } from '../src/config/env.js';
import { getAssistant, updateAssistant } from '../src/config/vapi.js';

// One-off setup script: points the real Vapi Assistant at this backend's
// webhook route. Idempotent — safe to re-run any time the webhook URL or
// secret changes (e.g. a new ngrok tunnel each dev session).
async function main() {
  if (!env.VAPI_WEBHOOK_BASE_URL) {
    console.error(
      'VAPI_WEBHOOK_BASE_URL is not set. Vapi calls your webhook from its own ' +
        'cloud, so it needs a publicly reachable URL — localhost will not work. ' +
        'In dev, run `ngrok http 5000` (or similar) and set VAPI_WEBHOOK_BASE_URL ' +
        'to the resulting https URL, then re-run this script.'
    );
    process.exit(1);
  }

  const before = await getAssistant();
  console.error('Current assistant config:', {
    id: before.id,
    name: before.name,
    firstMessageMode: before.firstMessageMode,
    serverUrl: before.serverUrl ?? before.server?.url,
    isServerUrlSecretSet: before.isServerUrlSecretSet,
  });

  const webhookUrl = `${env.VAPI_WEBHOOK_BASE_URL.replace(/\/$/, '')}/api/vapi/webhook`;

  const patch = {
    server: {
      url: webhookUrl,
      secret: env.VAPI_WEBHOOK_SECRET,
    },
    firstMessageMode: 'assistant-speaks-first-with-model-generated-message',
  };

  const updated = await updateAssistant(patch);
  console.error('Assistant updated:', {
    id: updated.id,
    firstMessageMode: updated.firstMessageMode,
    serverUrl: updated.serverUrl ?? updated.server?.url,
    isServerUrlSecretSet: updated.isServerUrlSecretSet,
  });
}

main().catch((err) => {
  console.error('Failed to configure Vapi assistant:', err);
  process.exit(1);
});
