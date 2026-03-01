import { X, Radio, Play, Pause } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ShowBanner() {
  const { activeShow, player, togglePlay, dismissShow, playlists } = useStore();

  if (!activeShow) return null;

  const playlist = playlists.find(p => p.id === activeShow.playlistId);
  const [h, m] = activeShow.startTime.split(':').map(Number);
  const endH = Math.floor((h * 60 + m + activeShow.durationMinutes) / 60) % 24;
  const endM = (h * 60 + m + activeShow.durationMinutes) % 60;
  const endTime = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 py-3 gap-4"
      style={{
        background: 'linear-gradient(90deg, rgba(201,255,59,0.15) 0%, rgba(11,11,13,0.95) 100%)',
        borderBottom: '1px solid rgba(201,255,59,0.3)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: show info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(201,255,59,0.2)' }}
        >
          <Radio size={15} className="text-[#C9FF3B]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(201,255,59,0.2)', color: '#C9FF3B' }}
            >
              ON AIR
            </span>
            <p className="text-[#F2F2F2] text-sm font-semibold truncate">{activeShow.name}</p>
          </div>
          <p className="text-[#B8B8B8] text-xs truncate">
            {playlist?.name} · Until {endTime} · {player.currentTrack?.title ?? '—'}
          </p>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(201,255,59,0.15)', color: '#C9FF3B' }}
        >
          {player.isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={dismissShow}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666] hover:text-[#F2F2F2] hover:bg-white/10 transition-colors"
          title="End show"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
