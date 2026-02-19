import { useState, useRef } from 'react';
import { X, GripVertical, Plus, Minus, CheckCircle, Music } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Track, Playlist } from '@/types';

interface Props {
  playlist?: Playlist; // if provided, we're editing; otherwise creating
  onClose: () => void;
}

export default function PlaylistModal({ playlist, onClose }: Props) {
  const { tracks, addPlaylist, updatePlaylist, reorderPlaylistTracks, addToast } = useStore();

  const [name, setName] = useState(playlist?.name ?? '');
  const [description, setDescription] = useState(playlist?.description ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>(playlist?.trackIds ?? []);
  const [saved, setSaved] = useState(false);

  // Drag-to-reorder state
  const dragIdx = useRef<number | null>(null);

  const orderedTracks: Track[] = selectedIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter(Boolean) as Track[];

  const unselected = tracks.filter((t) => !selectedIds.includes(t.id));

  const toggleTrack = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const formatDur = (s: number) => {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const totalDuration = orderedTracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const totalMin = Math.floor(totalDuration / 60);
  const totalSec = String(Math.floor(totalDuration % 60)).padStart(2, '0');

  // Drag handlers for reordering selected tracks
  const onDragStart = (i: number) => { dragIdx.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...selectedIds];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    setSelectedIds(next);
  };
  const onDragEnd = () => { dragIdx.current = null; };

  const handleSave = () => {
    if (!name.trim()) { addToast('Playlist name is required', 'error'); return; }
    if (selectedIds.length === 0) { addToast('Add at least one track', 'error'); return; }

    const playlistTracks = orderedTracks;

    if (playlist) {
      updatePlaylist(playlist.id, {
        name: name.trim(),
        description: description.trim(),
        trackIds: selectedIds,
        tracks: playlistTracks,
      });
      reorderPlaylistTracks(playlist.id, selectedIds);
      addToast(`"${name}" updated`, 'success');
    } else {
      addPlaylist({
        userId: 'demo',
        name: name.trim(),
        description: description.trim(),
        trackIds: selectedIds,
        tracks: playlistTracks,
        isShuffled: false,
        loopMode: 'none',
      });
      addToast(`"${name}" created`, 'success');
    }

    setSaved(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col glass-card z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-[#F2F2F2] text-2xl font-semibold">
              {playlist ? 'Edit Playlist' : 'New Playlist'}
            </h2>
            <p className="text-[#B8B8B8] text-sm mt-1">
              {selectedIds.length} tracks · {totalMin}:{totalSec}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-[#B8B8B8]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
          {/* Name + Description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[#B8B8B8] text-xs mb-1.5 uppercase tracking-wide">Playlist Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Late Night Drive"
                className="w-full px-4 py-3 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
            <div>
              <label className="block text-[#B8B8B8] text-xs mb-1.5 uppercase tracking-wide">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this playlist for?"
                className="w-full px-4 py-3 rounded-xl text-[#F2F2F2] text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(201,255,59,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
          </div>

          {/* Selected tracks (reorderable) */}
          {orderedTracks.length > 0 && (
            <div>
              <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3">
                Playlist Order — drag to reorder
              </p>
              <div className="space-y-1">
                {orderedTracks.map((track, i) => (
                  <div
                    key={track.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDragEnd={onDragEnd}
                    className="flex items-center gap-3 p-3 rounded-xl group transition-all"
                    style={{ background: 'rgba(201,255,59,0.05)', border: '1px solid rgba(201,255,59,0.12)' }}
                  >
                    <GripVertical size={14} className="text-[#444] cursor-grab flex-shrink-0" />
                    <span className="text-[#666] text-xs w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F2F2F2] text-sm truncate">{track.title}</p>
                      <p className="text-[#666] text-xs">{track.composer}</p>
                    </div>
                    <span className="text-[#666] text-xs">{formatDur(track.duration)}</span>
                    <button
                      onClick={() => toggleTrack(track.id)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                    >
                      <Minus size={14} className="text-[#ff5555]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add tracks from library */}
          <div>
            <p className="text-[#B8B8B8] text-xs uppercase tracking-wide mb-3">
              Add from Library
            </p>
            {tracks.length === 0 ? (
              <div className="text-center py-8">
                <Music size={28} className="mx-auto mb-3 text-[#444]" />
                <p className="text-[#666] text-sm">No tracks in your library yet — upload some first</p>
              </div>
            ) : unselected.length === 0 ? (
              <p className="text-[#666] text-sm py-4 text-center">All tracks added ✓</p>
            ) : (
              <div className="space-y-1">
                {unselected.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-3 rounded-xl group transition-all cursor-pointer hover:bg-white/3"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    onClick={() => toggleTrack(track.id)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Music size={14} className="text-[#666]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#F2F2F2] text-sm truncate">{track.title}</p>
                      <p className="text-[#666] text-xs">{track.composer} {track.genre ? `· ${track.genre}` : ''}</p>
                    </div>
                    <span className="text-[#666] text-xs">{formatDur(track.duration)}</span>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0">
                      <Plus size={14} className="text-[#C9FF3B]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-8 pt-4 flex-shrink-0 border-t border-white/5">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saved}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saved ? <><CheckCircle size={16} /> Saved!</> : playlist ? 'Save Changes' : 'Create Playlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
