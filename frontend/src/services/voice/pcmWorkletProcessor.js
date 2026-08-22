// Runs in the AudioWorklet global scope (not the main thread). Downsamples
// the mic's native sample rate (usually 48kHz) to 16kHz mono Int16 PCM —
// exactly what the backend's Deepgram connection is configured to expect —
// so no server-side resampling is needed.
const TARGET_SAMPLE_RATE = 16000;

class PcmDownsampleProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.inputSampleRate = sampleRate; // global in AudioWorkletGlobalScope
    this.ratio = this.inputSampleRate / TARGET_SAMPLE_RATE;
  }

  downsampleAndConvert(float32Input) {
    const outputLength = Math.floor(float32Input.length / this.ratio);
    const output = new Int16Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * this.ratio;
      const lower = Math.floor(srcIndex);
      const upper = Math.min(lower + 1, float32Input.length - 1);
      const frac = srcIndex - lower;
      const sample = float32Input[lower] + (float32Input[upper] - float32Input[lower]) * frac;

      const clamped = Math.max(-1, Math.min(1, sample));
      output[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }

    return output;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel && channel.length > 0) {
      const pcm16 = this.downsampleAndConvert(channel);
      this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    }
    return true;
  }
}

registerProcessor('pcm-downsample-processor', PcmDownsampleProcessor);
