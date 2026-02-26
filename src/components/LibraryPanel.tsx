import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, Trash2, Upload, Music, Search, Clock, GripVertical } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { audioEngine } from '@/lib/audioEngine';
import TrackUploadModal from './TrackUploadModal';
import type { Track } from '@/types';

interface Props {
  onClose: () => void;
}

export default function LibraryPanel({ onClose }: Props) {
  const { tracks, player, playTrack, togglePlay, deleteTrack, reorderTracks, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const dragId       = useRef<string | null>(null);
  const dragOverId   = useRef<string | null>(null);
  const [dragActiveId, setDragActiveId]         = useState<string | null>(null);
  const [dragOverActiveId, setDragOverActiveId] = useState<string | null>(null);

  // Touch drag state
  const touchDragId    = useRef<string | null>(null);
  const touchStartY    = useRef(0);
  const touchRowHeight = useRef(0);
  const touchListRef   = useRef<HTMLDivElement>(null);
  const [touchActiveId, setTouchActiveId]   = useState<string | null>(null);
  const [touchTargetIdx, setTouchTargetIdx] = useState<number | null>(null);

  const isSearching = search.trim().length > 0;
  const filtered = isSearching
    ? tracks.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.composer.toLowerCase().includes(search.toLowerCase()) ||
        (t.genre?.toLowerCase().includes(search.toLowerCase()))
      )
    : tracks;

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
      if (!track.fileUrl) { addToast('No audio file — upload one first', 'error'); return; }
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

  const isPlaying = (track: Track) => player.currentTrack?.id === track.id && player.isPlaying;
  const isCurrent = (track: Track) => player.currentTrack?.id === track.id;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragId.current = id;
    setDragActiveId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId.current !== id) {
      dragOverId.current = id;
      setDragOverActiveId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragId.current;
    if (!sourceId || sourceId === targetId) return;
    const ids = tracks.map((t) => t.id);
    const fromIdx = ids.indexOf(sourceId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, sourceId);
    reorderTracks(reordered);
    dragId.current = null;
    dragOverId.current = null;
    setDragActiveId(null);
    setDragOverActiveId(null);
  };

  const handleDragEnd = () => {
    dragId.current = null; dragOverId.current = null;
    setDragActiveId(null); setDragOverActiveId(null);
  };

  // Touch drag — fires only from grip handle so play button stays safe
  const handleTouchStart = useCallback((e: React.TouchEvent, id: string) => {
    if (isSearching) return;
    e.stopPropagation();
    touchDragId.current = id;
    touchStartY.current = e.touches[0].clientY;
    setTouchActiveId(id);
    const list = touchListRef.current;
    if (list?.firstElementChild) {
      touchRowHeight.current = (list.firstElementChild as HTMLElement).offsetHeight + 8;
    }
  }, [isSearching]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchDragId.current) return;
    e.preventDefault();
    const dy      = e.touches[0].clientY - touchStartY.current;
    const rowH    = touchRowHeight.current || 64;
    const ids     = tracks.map((t) => t.id);
    const fromIdx = ids.indexOf(touchDragId.current);
    const offset  = Math.round(dy / rowH);
    const toIdx   = Math.max(0, Math.min(ids.length - 1, fromIdx + offset));
    setTouchTargetIdx(toIdx);
  }, [tracks]);

  const handleTouchEnd = useCallback(() => {
    const sourceId = touchDragId.current;
    if (!sourceId) return;
    const ids     = tracks.map((t) => t.id);
    const fromIdx = ids.indexOf(sourceId);
    const toIdx   = touchTargetIdx ?? fromIdx;
    if (fromIdx !== toIdx) {
      const reordered = [...ids];
      reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, sourceId);
      reorderTracks(reordered);
    }
    touchDragId.current = null;
    setTouchActiveId(null);
    setTouchTargetIdx(null);
  }, [tracks, touchTargetIdx, reorderTracks]);

  const content = (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col glass-card z-10" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
            <div>
              <h2 className="text-[#F2F2F2] text-2xl font-semibold">Your Library</h2>
              <p className="text-[#B8B8B8] text-sm mt-1">
                {tracks.length} track{tracks.length !== 1 ? 's' : ''}
                {!isSearching && tracks.length > 1 && <span className="text-[#555] text-xs ml-2">· drag to reorder</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                <Upload size={15} /> Upload Track
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
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
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
              <div className="space-y-2" ref={touchListRef} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                {filtered.map((track, i) => {
                  const isTouchDragging = touchActiveId === track.id;
                  const isDropTarget    = touchTargetIdx === i && touchActiveId !== track.id && touchActiveId !== null;
                  return (
                    <div
                      key={track.id}
                      draggable={!isSearching}
                      onDragStart={!isSearching ? (e) => handleDragStart(e, track.id) : undefined}
                      onDragOver={!isSearching ? (e) => handleDragOver(e, track.id) : undefined}
                      onDrop={!isSearching ? (e) => handleDrop(e, track.id) : undefined}
                      onDragEnd={!isSearching ? handleDragEnd : undefined}
                      className="flex items-center gap-3 p-3 rounded-2xl transition-all group"
                      style={{
                        background: isCurrent(track) ? 'rgba(201,255,59,0.06)' : isDropTarget || (dragOverActiveId === track.id && dragActiveId !== track.id) ? 'rgba(201,255,59,0.04)' : 'rgba(255,255,255,0.02)',
                        border: isCurrent(track) ? '1px solid rgba(201,255,59,0.2)' : isDropTarget || (dragOverActiveId === track.id && dragActiveId !== track.id) ? '1px solid rgba(201,255,59,0.4)' : '1px solid rgba(255,255,255,0.05)',
                        opacity: (dragActiveId === track.id || isTouchDragging) ? 0.35 : 1,
                        transition: 'opacity 0.15s, border-color 0.15s, background 0.15s',
                      }}
                    >
                      {/* Grip handle — large touch target, only thing that initiates drag */}
                      {!isSearching && (
                        <div
                          onTouchStart={(e) => handleTouchStart(e, track.id)}
                          className="flex-shrink-0 flex items-center justify-center rounded-xl transition-colors"
                          style={{
                            width: '40px', height: '40px', cursor: 'grab',
                            background: isTouchDragging ? 'rgba(201,255,59,0.12)' : 'rgba(255,255,255,0.04)',
                            touchAction: 'none',
                          }}
                          title="Hold and drag to reorder"
                        >
                          <GripVertical size={18} className="text-[#555] group-hover:text-[#888] transition-colors" />
                        </div>
                      )}

                      {/* Play button — always visible, clearly separated from grip */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePlay(track); }}
                        className="flex items-center justify-center rounded-xl flex-shrink-0 transition-all"
                        style={{
                          width: '40px', height: '40px',
                          background: isCurrent(track) ? 'rgba(201,255,59,0.15)' : 'rgba(255,255,255,0.06)',
                          color: isCurrent(track) ? '#C9FF3B' : '#B8B8B8',
                        }}
                      >
                        {isPlaying(track) ? <Pause size={15} /> : <Play size={15} />}
                      </button>

                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate text-sm ${isCurrent(track) ? 'text-[#C9FF3B]' : 'text-[#F2F2F2]'}`}>{track.title}</p>
                        <p className="text-[#666] text-xs truncate">{track.composer}</p>
                      </div>

                      {track.genre && <span className="tag-pill text-xs hidden sm:inline-flex">{track.genre}</span>}
                      {!track.fileUrl && <span className="text-yellow-500/70 text-xs flex-shrink-0">No file</span>}

                      <div className="flex items-center gap-1 text-[#666] text-xs w-12 text-right flex-shrink-0">
                        <Clock size={11} />{formatDur(track.duration)}
                      </div>

                      <button
                        onClick={() => handleDelete(track.id)}
                        className="p-2 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                        style={{ color: confirmDelete === track.id ? '#ff5555' : '#666' }}
                        title={confirmDelete === track.id ? 'Click again to confirm' : 'Delete track'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {showUpload && <TrackUploadModal onClose={() => setShowUpload(false)} />}
    </>
  );

  return createPortal(content, document.body);
}
