/**
 * analyzeGain.ts
 * Analyzes an audio file's loudness using the Web Audio API and returns
 * the gain adjustment (in dB) needed to normalize it to -14 LUFS.
 *
 * Uses RMS loudness as a practical approximation of LUFS — close enough
 * for music playback normalization without a full ITU-R BS.1770 implementation.
 *
 * Returns a gain_db value to store in the database. At playback time,
 * apply this as a GainNode multiplier: gainNode.gain.value = dbToLinear(gain_db)
 */

const TARGET_LUFS = -14; // Spotify / Apple Music standard
const MAX_GAIN_DB = 12;  // cap boost so quiet recordings don't distort
const MIN_GAIN_DB = -12; // cap cut so loud tracks don't go silent

/**
 * Convert dB to linear gain multiplier
 */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Convert linear RMS to dBFS
 */
function linearToDb(linear: number): number {
  return 20 * Math.log10(Math.max(linear, 1e-9));
}

/**
 * Analyze an audio File and return the gain_db needed to normalize it.
 * Decodes the full file in memory — works for typical track sizes (2-50MB).
 */
export async function analyzeGain(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) { resolve(0); return; }

        // OfflineAudioContext decodes without playing audio
        const audioCtx = new OfflineAudioContext(1, 1, 44100);
        const decoded  = await audioCtx.decodeAudioData(arrayBuffer);

        // Calculate RMS across all channels, sampling every 4 frames for speed
        const numChannels = decoded.numberOfChannels;
        let sumOfSquares  = 0;
        let sampleCount   = 0;

        for (let ch = 0; ch < numChannels; ch++) {
          const data = decoded.getChannelData(ch);
          for (let i = 0; i < data.length; i += 4) {
            sumOfSquares += data[i] * data[i];
            sampleCount++;
          }
        }

        const rms        = Math.sqrt(sumOfSquares / sampleCount);
        const loudnessDb = linearToDb(rms);

        // How much gain do we need to reach target?
        const gainNeeded = TARGET_LUFS - loudnessDb;

        // Clamp to safe range
        const gainDb = Math.max(MIN_GAIN_DB, Math.min(MAX_GAIN_DB, gainNeeded));

        console.log(`[analyzeGain] ${file.name}: RMS=${loudnessDb.toFixed(1)}dBFS → gain=${gainDb.toFixed(1)}dB`);
        resolve(gainDb);
      } catch (err) {
        console.warn('[analyzeGain] Analysis failed, defaulting to 0dB:', err);
        resolve(0); // safe fallback — just play at original level
      }
    };

    reader.onerror = () => resolve(0);
    reader.readAsArrayBuffer(file);
  });
}
