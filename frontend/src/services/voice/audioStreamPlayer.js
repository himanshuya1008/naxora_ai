// Shared across every AudioStreamPlayer instance in the tab (one per AI
// turn) — browsers cap the number of concurrent AudioContexts, and there's
// no benefit to a fresh one per turn since each player's <audio> element is
// only ever routed through it once, sequentially.
let sharedAudioContext = null;
function getSharedAudioContext() {
  sharedAudioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  return sharedAudioContext;
}

// Plays back MP3 chunks progressively as they arrive from the server (rather
// than waiting for the full clip) using the MediaSource Extensions API, so
// the AI's voice starts as soon as the first chunk lands instead of after
// the entire response has been synthesized.
//
// One instance is single-use: calling endOfStream() (via end()) permanently
// finalizes the underlying MediaSource, so the caller must create a fresh
// AudioStreamPlayer for each AI turn rather than reusing one across a call.
export class AudioStreamPlayer {
  constructor({ onPlaybackEnded, onLevel } = {}) {
    this.audioEl = new Audio();
    this.mediaSource = null;
    this.sourceBuffer = null;
    this.pendingChunks = [];
    this.streamEnded = false;
    this.onLevel = onLevel;
    this.analyser = null;
    this.levelFrame = null;
    this.ready = this._setup();
    this.audioEl.addEventListener('ended', () => {
      if (this.levelFrame) cancelAnimationFrame(this.levelFrame);
      onPlaybackEnded?.();
    });
  }

  _setup() {
    return new Promise((resolve) => {
      this.mediaSource = new MediaSource();
      this.audioEl.src = URL.createObjectURL(this.mediaSource);

      if (this.onLevel) {
        this._setupAnalyser();
      }

      this.mediaSource.addEventListener('sourceopen', () => {
        this.sourceBuffer = this.mediaSource.addSourceBuffer('audio/mpeg');
        this.sourceBuffer.addEventListener('updateend', () => this._flushQueue());
        resolve();
      });
    });
  }

  _setupAnalyser() {
    const audioContext = getSharedAudioContext();
    const source = audioContext.createMediaElementSource(this.audioEl);
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    // createMediaElementSource hijacks the element's default output route,
    // so we must explicitly reconnect it to the speakers or playback goes silent.
    source.connect(this.analyser);
    this.analyser.connect(audioContext.destination);

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const normalized = (data[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      this.onLevel(Math.min(1, rms * 4));
      this.levelFrame = requestAnimationFrame(tick);
    };
    this.levelFrame = requestAnimationFrame(tick);
  }

  _flushQueue() {
    if (this.sourceBuffer.updating || this.pendingChunks.length === 0) return;
    const chunk = this.pendingChunks.shift();
    this.sourceBuffer.appendBuffer(chunk);

    if (this.pendingChunks.length === 0 && this.streamEnded && !this.sourceBuffer.updating) {
      this._tryEndOfStream();
    }
  }

  _tryEndOfStream() {
    if (this.mediaSource.readyState === 'open' && !this.sourceBuffer.updating) {
      this.mediaSource.endOfStream();
    }
  }

  async appendChunk(chunk) {
    await this.ready;
    const buffer = chunk instanceof ArrayBuffer ? chunk : chunk.buffer ?? chunk;
    this.pendingChunks.push(buffer);

    if (this.audioEl.paused) {
      getSharedAudioContext().resume();
      this.audioEl.play().catch(() => {}); // autoplay may need a user gesture on first call
    }
    this._flushQueue();
  }

  async end() {
    await this.ready;
    this.streamEnded = true;
    if (this.pendingChunks.length === 0 && !this.sourceBuffer.updating) {
      this._tryEndOfStream();
    }
  }

  stop() {
    if (this.levelFrame) cancelAnimationFrame(this.levelFrame);
    this.audioEl.pause();
    this.pendingChunks = [];
    if (this.mediaSource?.readyState === 'open') {
      try {
        this.mediaSource.endOfStream();
      } catch {
        // already ending/closed — safe to ignore
      }
    }
    URL.revokeObjectURL(this.audioEl.src);
  }
}
