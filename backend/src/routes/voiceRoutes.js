import { Router } from 'express';
import { getIceServers } from '../config/webrtc.js';

export const voiceRoutes = Router();

// Public: served to the visitor-facing widget before it opens a voice
// session, so TURN credentials are never hardcoded client-side.
voiceRoutes.get('/ice-servers', (req, res) => {
  res.status(200).json({ success: true, data: { iceServers: getIceServers() } });
});
