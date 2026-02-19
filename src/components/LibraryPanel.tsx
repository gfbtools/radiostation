import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, Trash2, Upload, Music, Search, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { audioEngine } from '@/lib/audioEngine';
import TrackUploadModal from './TrackUploadModal';
import type { Track } from '@/types';

interface Props {
  onClose: () => void;
}

export default function LibraryPanel({ onClose }: Props) {
  const { tracks, player, playTrack, togglePlay, deleteTrack, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = tracks.filter((t) =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.composer.toLowerCase().includes(search.toLowerCase()) ||
    (t.genre?.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDur = (s: number) => {
    if (!s) return '--:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePlay = (track: Track) => {
    if (player.currentTrack?.id === track.id) {
      togglePlay();
    } else {
      if (!track.fileUrl) {
        addToast('No audio file — upload one first', 'error');
        return;
      }
      audioEngine.load(track.fileUrl);
      playTrack(track);
    }
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteTrack(id);
      setConfirmDelete(null);
      addToast('Track deleted', 'info');
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const isPlaying = (track: Track) =>
    player.currentTrack?.id === track.id && player.isPlaying;

  const isCurrent = (track: Track) => player.currentTrack?.id === track.id;

  const content = (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div
          className="relative w-full max-w-3xl max-h-[88vh] flex flex-col glass-card z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
            <div>
              <h2 className="text-[#F2F2F2] text-2xl font-semibold">Your Library</h2>
              <p className="text-[#B8B8B8] text-sm mt-1">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUpload(true)}
                className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
              >
                <Upload size={15} />
                Upload Track
              </button>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <X size={20} className="text-[#B8B8B8]" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-8 pb-4 flex-shrink-0">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, composer, or genre…"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-[#F2F2F2] text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>

          {/* Track List */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Music size={28} className="text-[#444]" />
                </div>
                {tracks.length === 0 ? (
                  <>
                    <p className="text-[#F2F2F2] font-medium mb-2">No tracks yet</p>
                    <p className="text-[#666] text-sm mb-6">Upload your first audio file to get started</p>
                    <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
                      <Upload size={16} /> Upload Track
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[#F2F2F2] font-medium mb-2">No results</p>
                    <p className="text-[#666] text-sm">Try a different search term</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((track, i) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
                    style={{
                      background: isCurrent(track) ? 'rgba(201,255,59,0.06)' : 'rgba(255,255,255,0.02)',
                      border: isCurrent(track) ? '1px solid rgba(201,255,59,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {/* Track number / play button */}
                    <div className="w-8 text-center flex-shrink-0">
                      <span className="text-[#444] text-sm group-hover:hidden">{i + 1}</span>
                      <button
                        onClick={() => handlePlay(track)}
                        className="hidden group-hover:flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ background: 'rgba(201,255,59,0.15)' }}
                      >
                        {isPlaying(track)
                          ? <Pause size={14} className="text-[#C9FF3B]" />
                          : <Play size={14} className="text-[#C9FF3B]" />}
                      </button>
                      {/* Show pause/play icon when current even without hover */}
                      {isCurrent(track) && (
                        <button
                          onClick={() => handlePlay(track)}
                          className="flex group-hover:hidden items-center justify-center w-8 h-8 rounded-lg"
                          style={{ background: 'rgba(201,255,59,0.15)' }}
                        >
                          {isPlaying(track)
                            ? <Pause size={14} className="text-[#C9FF3B]" />
                            : <Play size={14} className="text-[#C9FF3B]" />}
                        </button>
                      )}
                    </div>

                    {/* Track info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-sm ${isCurrent(track) ? 'text-[#C9FF3B]' : 'text-[#F2F2F2]'}`}>
                        {track.title}
                      </p>
                      <p className="text-[#666] text-xs truncate">{track.composer}</p>
                    </div>

                    {/* Genre */}
                    {track.genre && (
                      <span className="tag-pill text-xs hidden sm:inline-flex">{track.genre}</span>
                    )}

                    {/* No file warning */}
                    {!track.fileUrl && (
                      <span className="text-yellow-500/70 text-xs flex-shrink-0">No file</span>
                    )}

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-[#666] text-xs w-12 text-right flex-shrink-0">
                      <Clock size={11} />
                      {formatDur(track.duration)}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(track.id)}
                      className="p-2 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                      style={{ color: confirmDelete === track.id ? '#ff5555' : '#666' }}
                      title={confirmDelete === track.id ? 'Click again to confirm delete' : 'Delete track'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload modal stacked on top */}
      {showUpload && <TrackUploadModal onClose={() => setShowUpload(false)} />}
    </>
  );

  return createPortal(content, document.body);
}
