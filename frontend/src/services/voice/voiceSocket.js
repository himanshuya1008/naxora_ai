import { io } from 'socket.io-client';
import { MicCapture } from './micCapture.js';
import { AudioStreamPlayer } from './audioStreamPlayer.js';

/**
 * Orchestrates one voice conversation's full client-side lifecycle: connects
 * the authenticated Socket.IO stream, captures + streams mic audio, plays
 * back streamed AI speech, and exposes the real-time events (transcript,
 * scores, objections, end) the UI needs — all behind a small event-emitter
 * style API so React components don't touch sockets/audio APIs directly.
 */
export class VoiceSocket {
  constructor({ voiceToken, iceServers }) {
    this.voiceToken = voiceToken;
    this.iceServers = iceServers;
    this.socket = null;
    this.mic = null;
    this.currentPlayer = null;
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  _emit(event, payload) {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }

  async connect() {
    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { voiceToken: this.voiceToken },
      transports: ['websocket'],
    });

    this.socket.on('connect_error', (err) => this._emit('error', { code: 'SOCKET_ERROR', message: err.message }));
    this.socket.on('transcript', (payload) => this._emit('transcript', payload));
    this.socket.on('scores-update', (payload) => this._emit('scores-update', payload));
    this.socket.on('objection-detected', (payload) => this._emit('objection-detected', payload));
    this.socket.on('conversation-ended', (payload) => this._emit('conversation-ended', payload));
    this.socket.on('error', (payload) => this._emit('error', payload));

    this.socket.on('ai-audio-chunk', (chunk) => {
      if (!this.currentPlayer) {
        this.currentPlayer = new AudioStreamPlayer({
          onPlaybackEnded: () => {
            this._emit('ai-speaking', false);
            this._emit('ai-level', 0);
          },
          onLevel: (level) => this._emit('ai-level', level),
        });
        this._emit('ai-speaking', true);
      }
      this.currentPlayer.appendChunk(chunk);
    });

    this.socket.on('ai-audio-end', () => {
      this.currentPlayer?.end();
      this.currentPlayer = null;
    });

    this.mic = new MicCapture({
      onChunk: (buffer) => this.socket?.emit('audio-chunk', buffer),
      onError: (err) => this._emit('error', { code: 'MIC_ERROR', message: err.message }),
      onLevel: (level) => this._emit('mic-level', level),
    });

    await this.mic.start();
  }

  endCall() {
    this.socket?.emit('manual-end');
  }

  disconnect() {
    this.mic?.stop();
    this.currentPlayer?.stop();
    this.socket?.disconnect();
    this.socket = null;
  }
}
