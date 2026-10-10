"use client";

class TapSoundEngine {
  private audioCtx: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private audioPool: HTMLAudioElement[] = [];
  private poolIndex: number = 0;
  private poolSize: number = 8;
  private isPreloaded: boolean = false;
  private isUnlocked: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.55;
  private lastTapTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('coc_sfx_enabled');
      if (saved !== null) {
        this.isMuted = saved === 'false';
      }
      const savedVol = localStorage.getItem('coc_sfx_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed)) this.volume = parsed;
      }
    }
  }

  /**
   * Preload the audio file (/audio/clash_clans_pop.mp3) on app launch
   * so there is zero latency when the user taps.
   */
  public preload() {
    if (typeof window === 'undefined' || this.isPreloaded) return;
    this.isPreloaded = true;

    try {
      // 1. Web Audio API Preload
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        fetch('/audio/clash_clans_pop.mp3')
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.arrayBuffer();
          })
          .then((arrayBuffer) => this.audioCtx?.decodeAudioData(arrayBuffer))
          .then((decodedData) => {
            if (decodedData) {
              this.audioBuffer = decodedData;
            }
          })
          .catch((err) => {
            console.warn('[TapSound Engine] WebAudio decode warning:', err);
          });
      }

      // 2. HTML5 Audio Pool (Fallback and Instant Load)
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio('/audio/clash_clans_pop.mp3');
        audio.preload = 'auto';
        audio.volume = this.volume;
        this.audioPool.push(audio);
      }
    } catch (err) {
      console.warn('[TapSound Engine] Preload error:', err);
    }
  }

  /**
   * Unlock AudioContext & Audio elements on first user interaction
   */
  public unlockAudio() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    if (this.audioPool.length > 0) {
      const first = this.audioPool[0];
      const prevVol = first.volume;
      first.volume = 0;
      first.play().then(() => {
        first.pause();
        first.currentTime = 0;
        first.volume = prevVol;
      }).catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('coc_sfx_enabled', muted ? 'false' : 'true');
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    this.audioPool.forEach((a) => {
      a.volume = clamped;
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('coc_sfx_volume', clamped.toString());
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Play tap sound immediately using Web Audio API buffer or Audio Pool
   */
  public play() {
    if (this.isMuted) return;

    // Debounce rapid micro-taps/duplicate events under 120ms to ensure 1 sound per user tap
    const now = Date.now();
    if (now - this.lastTapTime < 120) return;
    this.lastTapTime = now;

    this.unlockAudio();

    // Strategy 1: Web Audio API (Zero latency, overlapping audio nodes)
    if (this.audioCtx && this.audioBuffer) {
      try {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const source = this.audioCtx.createBufferSource();
        const gainNode = this.audioCtx.createGain();

        source.buffer = this.audioBuffer;
        gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        source.start(0);
        return;
      } catch (err) {
        // Fall back to Audio Pool
      }
    }

    // Strategy 2: HTML5 Audio Pool (Fallback)
    if (this.audioPool.length > 0) {
      try {
        const sound = this.audioPool[this.poolIndex];
        this.poolIndex = (this.poolIndex + 1) % this.poolSize;

        sound.currentTime = 0;
        sound.volume = this.volume;
        sound.play().catch(() => {});
      } catch (e) {}
    }
  }
}

export const tapSoundEngine = new TapSoundEngine();
