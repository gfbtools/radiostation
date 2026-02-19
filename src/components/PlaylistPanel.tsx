import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, Plus, Edit2, Trash2, ListMusic, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { audioEngine } from '@/lib/audioEngine';
import PlaylistModal from './PlaylistModal';
import type { Playlist } from '@/types';

interface Props {
  onClose: () => void;
}

export default function PlaylistPanel({ onClose }: Props) {
  const { playlists, player, playPlaylist, togglePlay, deletePlaylist, addToast } = useStore();
  const [editing, setEditing] = useState<Playlist | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const formatDur = (s: number) => {
    if (!s) return '--:--';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const totalDur = (pl: Playlist) =>
    pl.tracks.reduce((sum, t) => sum + (t.duration || 0), 0);

  const isCurrentPlaylist = (pl: Playlist) => player.currentPlaylist?.id === pl.id;
  const isPlaying = (pl: Playlist) => isCurrentPlaylist(pl) && player.isPlaying;

  const handlePlay = (pl: Playlist) => {
    if (isCurrentPlaylist(pl)) {
      togglePlay();
    } else {
      if (!pl.tracks.length) { addToast('This playlist has no tracks', 'error'); return; }
      const firstWithFile = pl.tracks.find((t) => t.fileUrl);
      if (!firstWithFile) { addToast('No tracks have audio files yet — upload some first', 'error'); return; }
      const idx = pl.tracks.indexOf(firstWithFile);
      audioEngine.load(firstWithFile.fileUrl);
      playPlaylist(pl, idx);
    }
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deletePlaylist(id);
      setConfirmDelete(null);
      addToast('Playlist deleted', 'info');
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const content = (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div
          className="relative w-full max-w-2xl max-h-[88vh] flex flex-col glass-card z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
            <div>
              <h2 className="text-[#F2F2F2] text-2xl font-semibold">Playlists</h2>
              <p className="text-[#B8B8B8] text-sm mt-1">
                {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCreating(true)}
                className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
              >
                <Plus size={15} /> New Playlist
              </button>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <X size={20} className="text-[#B8B8B8]" />
              </button>
            </div>
          </div>

          {/* Playlist List */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {playlists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <ListMusic size={28} className="text-[#444]" />
                </div>
                <p className="text-[#F2F2F2] font-medium mb-2">No playlists yet</p>
                <p className="text-[#666] text-sm mb-6">Create your first playlist to get started</p>
                <button
                  onClick={() => setCreating(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={16} /> New Playlist
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {playlists.map((pl) => (
                  <div key={pl.id}>
                    {/* Playlist row */}
                    <div
                      className="rounded-2xl overflow-hidden transition-all"
                      style={{
                        background: isCurrentPlaylist(pl) ? 'rgba(201,255,59,0.06)' : 'rgba(255,255,255,0.02)',
                        border: isCurrentPlaylist(pl) ? '1px solid rgba(201,255,59,0.2)' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Play button */}
                        <button
                          onClick={() => handlePlay(pl)}
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: isCurrentPlaylist(pl) ? '#C9FF3B' : 'rgba(255,255,255,0.08)',
                          }}
                        >
                          {isPlaying(pl)
                            ? <Pause size={16} className={isCurrentPlaylist(pl) ? 'text-[#0B0B0D]' : 'text-[#F2F2F2]'} />
                            : <Play size={16} className={isCurrentPlaylist(pl) ? 'text-[#0B0B0D]' : 'text-[#F2F2F2]'} />}
                        </button>

                        {/* Info */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setExpanded(expanded === pl.id ? null : pl.id)}
                        >
                          <p className={`font-medium truncate text-sm ${isCurrentPlaylist(pl) ? 'text-[#C9FF3B]' : 'text-[#F2F2F2]'}`}>
                            {pl.name}
                          </p>
                          <p className="text-[#666] text-xs truncate">{pl.description || 'No description'}</p>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="tag-pill text-xs hidden sm:inline-flex">
                            {pl.tracks.length} tracks
                          </span>
                          <span className="text-[#666] text-xs flex items-center gap-1">
                            <Clock size={11} /> {formatDur(totalDur(pl))}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditing(pl)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            title="Edit playlist"
                          >
                            <Edit2 size={14} className="text-[#666]" />
                          </button>
                          <button
                            onClick={() => handleDelete(pl.id)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            title={confirmDelete === pl.id ? 'Click again to confirm' : 'Delete playlist'}
                          >
                            <Trash2 size={14} style={{ color: confirmDelete === pl.id ? '#ff5555' : '#666' }} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded track list */}
                      {expanded === pl.id && pl.tracks.length > 0 && (
                        <div className="border-t border-white/5 px-4 pb-3">
                          {pl.tracks.map((track, i) => (
                            <div key={track.id} className="flex items-center gap-3 py-2">
                              <span className="text-[#444] text-xs w-5 text-right">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[#F2F2F2] text-sm truncate">{track.title}</p>
                                <p className="text-[#666] text-xs">{track.composer}</p>
                              </div>
                              <span className="text-[#666] text-xs">{formatDur(track.duration)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit modals */}
      {creating && <PlaylistModal onClose={() => setCreating(false)} />}
      {editing && <PlaylistModal playlist={editing} onClose={() => setEditing(null)} />}
    </>
  );

  return createPortal(content, document.body);
}
