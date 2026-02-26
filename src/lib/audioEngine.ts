/**
 * audioEngine.ts
 * Singleton Web Audio graph with per-track gain normalization (~-14 LUFS).
 * Graph: <audio> → MediaElementSourceNode → GainNode → destination
 */

import { dbToLinear } from './analyzeGain';

type AudioEventCallback = (currentTime: number, duration: number) => void;
type EndedCallback = () => void;

class AudioEngine {
  private audio: HTMLAudioElement;
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private onTimeUpdateCb: AudioEventCallback | null = null;
  private onEndedCb: EndedCallback | null = null;
  private currentObjectUrl: string | null = null;
  private currentGainDb = 0;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCb)
        this.onTimeUpdateCb(this.audio.currentTime, this.audio.duration || 0);
    });
    this.audio.addEventListener('ended', () => {
      if (this.onEndedCb) this.onEndedCb();
    });
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.onTimeUpdateCb)
        this.onTimeUpdateCb(0, this.audio.duration || 0);
    });
  }

  private ensureAudioContext() {
    if (this.ctx) return;
    try {
      this.ctx        = new AudioContext();
      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.gainNode   = this.ctx.createGain();
      this.gainNode.gain.value = dbToLinear(this.currentGainDb);
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
    } catch (err) {
      console.warn('[audioEngine] Web Audio unavailable, using direct playback:', err);
    }
  }

  load(url: string, gainDb = 0) {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
    this.currentGainDb = gainDb;
    this.audio.pause();
    this.audio.src = url;
    this.audio.load();
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(dbToLinear(gainDb), this.ctx.currentTime, 0.05);
    }
  }

  loadFile(file: File, gainDb = 0) {
    if (this.currentObjectUrl) URL.revokeObjectURL(this.currentObjectUrl);
    this.currentObjectUrl = URL.createObjectURL(file);
    this.load(this.currentObjectUrl, gainDb);
  }

  play(): Promise<void> {
    this.ensureAudioContext();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(dbToLinear(this.currentGainDb), this.ctx.currentTime, 0.05);
    }
    return this.audio.play();
  }

  pause()  { this.audio.pause(); }

  seek(time: number) {
    if (isFinite(time)) this.audio.currentTime = time;
  }

  setVolume(v: number) { this.audio.volume = Math.max(0, Math.min(1, v)); }
  setMuted(m: boolean) { this.audio.muted = m; }

  onTimeUpdate(cb: AudioEventCallback) { this.onTimeUpdateCb = cb; }
  onEnded(cb: EndedCallback)           { this.onEndedCb = cb; }

  get currentTime() { return this.audio.currentTime; }
  get duration()    { return this.audio.duration || 0; }
  get paused()      { return this.audio.paused; }
}

export const audioEngine = new AudioEngine();
