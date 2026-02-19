import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Repeat1, Shuffle, ListMusic,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '@/lib/audioEngine';

export default function PlayerBar() {
  const {
    player,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    seekTo,
    updatePlayerTime,
    setLoopMode,
    toggleShuffle,
    addPlayLog,
  } = useStore();

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Track how much of the current song has been played for ASCAP logging
  const playStartTimeRef = useRef<number | null>(null);
  const totalPlayedRef = useRef<number>(0);
  const sessionId = useRef<string>(Math.random().toString(36).substr(2, 9));

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Wire audioEngine callbacks once ───────────────────────────────────────
  useEffect(() => {
    audioEngine.onTimeUpdate((currentTime, duration) => {
      updatePlayerTime(currentTime, duration);
    });

    audioEngine.onEnded(() => {
      // Log the play before moving on
      const { player: p } = useStore.getState();
      if (p.currentTrack) {
        const durationPlayed = totalPlayedRef.current;
        const pct = p.duration > 0 ? (durationPlayed / p.duration) * 100 : 0;
        addPlayLog({
          trackId: p.currentTrack.id,
          track: p.currentTrack,
          userId: 'demo',
          playTimestamp: new Date(),
          durationPlayed,
          percentagePlayed: pct,
          sessionId: sessionId.current,
          counted: durationPlayed >= 30 || pct >= 50,
        });
      }
      totalPlayedRef.current = 0;
      playStartTimeRef.current = null;
      useStore.getState().nextTrack();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── React to track changes ─────────────────────────────────────────────────
  useEffect(() => {
    if (!player.currentTrack) return;
    const url = player.currentTrack.fileUrl;
    if (url) {
      audioEngine.load(url);
      if (player.isPlaying) {
        audioEngine.play().catch(() => useStore.getState().pause());
      }
    }
    totalPlayedRef.current = 0;
    playStartTimeRef.current = null;
  }, [player.currentTrack?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── React to play / pause state ───────────────────────────────────────────
  useEffect(() => {
    if (player.isPlaying) {
      audioEngine.play().catch(() => useStore.getState().pause());
      playStartTimeRef.current = Date.now();
    } else {
      audioEngine.pause();
      if (playStartTimeRef.current !== null) {
        totalPlayedRef.current += (Date.now() - playStartTimeRef.current) / 1000;
        playStartTimeRef.current = null;
      }
    }
  }, [player.isPlaying]);

  // ─── React to volume / mute changes ────────────────────────────────────────
  useEffect(() => { audioEngine.setVolume(player.volume); }, [player.volume]);
  useEffect(() => { audioEngine.setMuted(player.isMuted); }, [player.isMuted]);

  // ─── Click handlers ─────────────────────────────────────────────────────────
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !player.duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const time = ((e.clientX - rect.left) / rect.width) * player.duration;
    seekTo(time);
    audioEngine.seek(time);
  }, [player.duration, seekTo]);

  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  }, [setVolume]);

  const hasTrack = player.currentTrack !== null;
  const hasFileUrl = !!(player.currentTrack?.fileUrl);

  const cycleLoop = () => {
    if (player.loopMode === 'none') setLoopMode('all');
    else if (player.loopMode === 'all') setLoopMode('single');
    else setLoopMode('none');
  };

  const loopIcon = () => {
    if (player.loopMode === 'single') return <Repeat1 size={16} className="text-[#C9FF3B]" />;
    if (player.loopMode === 'all') return <Repeat size={16} className="text-[#C9FF3B]" />;
    return <Repeat size={16} className="text-[#666]" />;
  };

  return (
    <div className="player-bar">
      <div className="flex items-center justify-between h-full px-[6vw]">

        {/* ── Left: Track Info ── */}
        <div className="flex items-center gap-4 w-[30%]">
          {hasTrack ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-[#C9FF3B]/10 flex items-center justify-center flex-shrink-0">
                <ListMusic size={20} className="text-[#C9FF3B]" />
              </div>
              <div className="min-w-0">
                <p className="text-[#F2F2F2] text-sm font-medium truncate">
                  {player.currentTrack?.title}
                </p>
                <p className="text-[#B8B8B8] text-xs truncate">
                  {player.currentTrack?.composer}
                </p>
                {!hasFileUrl && (
                  <p className="text-yellow-500/80 text-xs">No audio file — upload one to play</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <ListMusic size={20} className="text-[#666]" />
              </div>
              <span className="text-[#666] text-sm">Select a track to play</span>
            </div>
          )}
        </div>

        {/* ── Center: Controls + Progress ── */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[500px]">
          <div className="flex items-center gap-4">
            <button onClick={toggleShuffle} className="p-2 rounded-lg hover:bg-white/5 transition-colors" title="Shuffle">
              <Shuffle size={16} className={player.isShuffled ? 'text-[#C9FF3B]' : 'text-[#666]'} />
            </button>
            <button onClick={prevTrack} disabled={!hasTrack} className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <SkipBack size={20} className="text-[#F2F2F2]" />
            </button>
            <button
              onClick={togglePlay}
              disabled={!hasTrack || !hasFileUrl}
              title={!hasFileUrl ? 'Upload an audio file to enable playback' : undefined}
              className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: hasTrack && hasFileUrl ? '#C9FF3B' : '#333' }}
            >
              {player.isPlaying
                ? <Pause size={18} className={hasTrack ? 'text-[#0B0B0D]' : 'text-[#666]'} />
                : <Play size={18} className={hasTrack ? 'text-[#0B0B0D]' : 'text-[#666]'} />}
            </button>
            <button onClick={nextTrack} disabled={!hasTrack} className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <SkipForward size={20} className="text-[#F2F2F2]" />
            </button>
            <button onClick={cycleLoop} className="p-2 rounded-lg hover:bg-white/5 transition-colors" title="Loop">
              {loopIcon()}
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[#666] text-xs w-10 text-right">{formatTime(player.currentTime)}</span>
            <div ref={progressRef} className="progress-bar flex-1" onClick={handleProgressClick}>
              <div
                className="progress-bar-fill"
                style={{ width: player.duration ? `${(player.currentTime / player.duration) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-[#666] text-xs w-10">{formatTime(player.duration)}</span>
          </div>
        </div>

        {/* ── Right: Volume ── */}
        <div className="flex items-center gap-3 w-[30%] justify-end">
          <button onClick={toggleMute} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            {player.isMuted
              ? <VolumeX size={18} className="text-[#B8B8B8]" />
              : <Volume2 size={18} className="text-[#B8B8B8]" />}
          </button>
          <div ref={volumeRef} className="volume-slider" onClick={handleVolumeClick}>
            <div className="volume-slider-fill" style={{ width: player.isMuted ? '0%' : `${player.volume * 100}%` }} />
          </div>
        </div>

      </div>
    </div>
  );
}
