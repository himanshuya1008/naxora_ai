// Captures the visitor's mic and streams downsampled 16kHz PCM16 chunks to
// the caller via onChunk. Uses AudioWorklet (not the deprecated
// ScriptProcessorNode) so downsampling doesn't block the main thread.
export class MicCapture {
  constructor({ onChunk, onError, onLevel }) {
    this.onChunk = onChunk;
    this.onError = onError;
    this.onLevel = onLevel;
    this.audioContext = null;
    this.stream = null;
    this.workletNode = null;
    this.sourceNode = null;
    this.analyser = null;
    this.levelFrame = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      this.audioContext = new AudioContext();
      const workletUrl = new URL('./pcmWorkletProcessor.js', import.meta.url);
      await this.audioContext.audioWorklet.addModule(workletUrl);

      this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-downsample-processor');

      this.workletNode.port.onmessage = (event) => {
        this.onChunk?.(event.data);
      };

      this.sourceNode.connect(this.workletNode);
      // Not connecting workletNode to destination — we never want to play
      // the visitor's own mic input back to them.

      if (this.onLevel) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.sourceNode.connect(this.analyser);
        this._pollLevel();
      }
    } catch (err) {
      this.onError?.(err);
      throw err;
    }
  }

  _pollLevel() {
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
      this.onLevel(Math.min(1, rms * 4)); // scaled for a more visually responsive range
      this.levelFrame = requestAnimationFrame(tick);
    };
    this.levelFrame = requestAnimationFrame(tick);
  }

  stop() {
    if (this.levelFrame) cancelAnimationFrame(this.levelFrame);
    this.workletNode?.port.close();
    this.workletNode?.disconnect();
    this.sourceNode?.disconnect();
    this.analyser?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.audioContext?.close();
    this.workletNode = null;
    this.sourceNode = null;
    this.analyser = null;
    this.stream = null;
    this.audioContext = null;
  }
}
