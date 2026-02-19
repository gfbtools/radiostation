/**
 * audioEngine.ts
 * A singleton that owns the single <audio> element for the entire app.
 * React components and the Zustand store talk to this — never directly
 * to the DOM audio element — so there's never more than one player alive.
 */

type AudioEventCallback = (currentTime: number, duration: number) => void;
type EndedCallback = () => void;

class AudioEngine {
  private audio: HTMLAudioElement;
  private onTimeUpdateCb: AudioEventCallback | null = null;
  private onEndedCb: EndedCallback | null = null;
  private currentObjectUrl: string | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';

    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCb) {
        this.onTimeUpdateCb(this.audio.currentTime, this.audio.duration || 0);
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.onEndedCb) {
        this.onEndedCb();
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.onTimeUpdateCb) {
        this.onTimeUpdateCb(0, this.audio.duration || 0);
      }
    });
  }

  /**
   * Load a track by URL (either a blob: URL from an uploaded file,
   * or a regular https: URL).
   */
  load(url: string) {
    // Revoke the previous blob URL to free memory
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }

    this.audio.pause();
    this.audio.src = url;
    this.audio.load();
  }

  /**
   * Load a File object directly (from a file input or drag-and-drop).
   * Creates a temporary blob URL and remembers it so we can revoke later.
   */
  loadFile(file: File) {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
    }
    this.currentObjectUrl = URL.createObjectURL(file);
    this.load(this.currentObjectUrl);
  }

  play(): Promise<void> {
    return this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  seek(time: number) {
    if (isFinite(time)) {
      this.audio.currentTime = time;
    }
  }

  setVolume(volume: number) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  setMuted(muted: boolean) {
    this.audio.muted = muted;
  }

  onTimeUpdate(cb: AudioEventCallback) {
    this.onTimeUpdateCb = cb;
  }

  onEnded(cb: EndedCallback) {
    this.onEndedCb = cb;
  }

  get currentTime() {
    return this.audio.currentTime;
  }

  get duration() {
    return this.audio.duration || 0;
  }

  get paused() {
    return this.audio.paused;
  }
}

// Export a single shared instance
export const audioEngine = new AudioEngine();
