import httpClient from '../api/httpClient.js';
import { isDemoMode } from '../utils/demoMode.js';
import { mockVoiceSettings } from './mock/mockData.js';

// No backend route exists yet for this (see backend/src/routes/organizationRoutes.js) —
// this calls the REST-conventional endpoint a future backend would expose,
// and only falls back to the mock fixture when that request fails. If the
// endpoint is added later, this starts working against real data with no
// frontend change required.

export async function getVoiceSettings() {
  try {
    const { data } = await httpClient.get('/organization/voice-settings');
    return data.data.voiceSettings;
  } catch (err) {
    if (isDemoMode) return mockVoiceSettings;
    throw err;
  }
}

export async function updateVoiceSettings(fields) {
  try {
    const { data } = await httpClient.patch('/organization/voice-settings', fields);
    return data.data.voiceSettings;
  } catch (err) {
    if (isDemoMode) return { ...mockVoiceSettings, ...fields };
    throw err;
  }
}
